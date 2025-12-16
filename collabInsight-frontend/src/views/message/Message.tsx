import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input, Button, Avatar, Badge, message as antdMessage, Popover, Select } from 'antd';
import dayjs from 'dayjs';
import { io, type Socket } from 'socket.io-client';
import ProjectList from '@/Components/ProjectList';
import type { Project } from '@/types/task';
import { fetchProjects } from '@/request/api/task';
import { auth } from '@/utils/http';
import { getUserProfile } from '@/request/api/user/profile';
import type { UserProfile } from '@/request/type';
import { fetchProjectMessages } from '@/request/api/message';

interface LocalChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}

const Message: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Pick<UserProfile, '_id' | 'username'>>({
    _id: '',
    username: '我',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const emojiList = ['😀', '😁', '😂', '😊', '😎', '🤔', '😢', '😭', '👍', '👏', '🔥', '❤️', '💪', '🚀'];

  // 计算后端 WebSocket 地址
  const socketBaseUrl = useMemo(() => {
    // 优先使用专门的 WebSocket 地址
    const wsBase = import.meta.env.VITE_WS_BASE_URL as string | undefined;
    if (wsBase) return wsBase;

    const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
    // 如果是完整地址，则取其 origin
    if (apiBase && /^https?:\/\//i.test(apiBase)) {
      try {
        return new URL(apiBase).origin;
      } catch {
        // ignore
      }
    }

    // 默认直接连后端服务
    return 'http://localhost:5000';
  }, []);

  // 加载当前用户信息（用于展示自己的昵称、区分左右气泡）
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setCurrentUser({ _id: profile._id, username: profile.username || '我' });
      } catch (error) {
        console.error('获取用户信息失败', error);
      }
    };
    fetchProfile();
  }, []);

  // 加载项目列表（左侧联调）
  const loadProjects = async (keyword?: string) => {
    try {
      const res = await fetchProjects(keyword ? { keyword } : undefined);
      setProjects(res);
      if (!selectedProjectId && res.length > 0) {
        setSelectedProjectId(res[0]._id);
      } else if (selectedProjectId && !res.find((p) => p._id === selectedProjectId) && res.length > 0) {
        setSelectedProjectId(res[0]._id);
      }
    } catch (error) {
      console.error(error);
      antdMessage.error('获取项目列表失败');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // 建立 WebSocket 连接
  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      return;
    }

    const socket = io(socketBaseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket 已连接');
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket 连接失败', err);
      antdMessage.error('消息实时连接失败，请检查网络或稍后重试');
    });

    socket.on('projectMessage', (msg: LocalChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      requestAnimationFrame(() => {
        messageListRef.current?.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketBaseUrl]);

  // 当切换项目时，加入/离开对应的项目房间
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedProjectId) return;

    // 切换项目时，先加载该项目的历史消息
    const loadHistory = async () => {
      try {
        const history = await fetchProjectMessages(selectedProjectId);
        setMessages(history);
        requestAnimationFrame(() => {
          messageListRef.current?.scrollTo({
            top: messageListRef.current.scrollHeight,
            behavior: 'smooth',
          });
        });
      } catch (error) {
        console.error('加载项目历史消息失败', error);
      }
    };

    loadHistory();

    socket.emit('joinProject', selectedProjectId);

    return () => {
      socket.emit('leaveProject', selectedProjectId);
    };
  }, [selectedProjectId]);

  // 右侧 UI 展示（本地示例，不请求后端）
  const filteredMessages = useMemo(
    () => messages.filter((m) => m.projectId === selectedProjectId),
    [messages, selectedProjectId]
  );

  const currentProject = useMemo(
    () => projects.find((p) => p._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const memberOptions = useMemo(
    () =>
      (currentProject?.members || []).map((m: any) => ({
        label: m.username || m._id,
        value: m._id,
      })),
    [currentProject]
  );

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || !selectedProjectId) return;
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('projectMessage', {
        projectId: selectedProjectId,
        content: text,
        type: 'text',
      });
    } else {
      // 如果 WebSocket 不可用，回退为本地消息，避免用户输入丢失
      const fallbackMsg: LocalChatMessage = {
        id: `local-${Date.now()}`,
        projectId: selectedProjectId,
        senderId: currentUser._id || 'me',
        senderName: currentUser.username || '我',
        content: text,
        type: 'text',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }

    setInputValue('');
    requestAnimationFrame(() => {
      messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const renderBubble = (msg: LocalChatMessage) => {
    const isMine = currentUser._id && msg.senderId === currentUser._id;
    return (
      <div
        key={msg.id}
        className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
      >
        {!isMine && (
          <Avatar size={32} className="mr-2">
            {msg.senderName[0]}
          </Avatar>
        )}
        <div className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
          {!isMine && <div className="text-xs text-gray-500 mb-1">{msg.senderName}</div>}
          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
          <div className="text-[10px] text-gray-400 mt-1 text-right">
            {dayjs(msg.createdAt).format('HH:mm')}
          </div>
        </div>
        {isMine && (
          <Avatar size={32} className="ml-2" style={{ backgroundColor: '#1677ff' }}>
            {currentUser.username[0]}
          </Avatar>
        )}
      </div>
    );
  };

  // 项目列表数据适配 ProjectList
  const projectDataForList = useMemo(() => {
    const record: Record<string, any> = {};
    projects.forEach((proj) => {
      record[proj._id] = {
        projectName: proj.name,
        projectDesc: proj.description || '',
        status: proj.status,
        priority: proj.priority,
        deadline: proj.deadline,
        tasks: [],
        members: proj.members || [],
        leader: proj.leader,
      };
    });
    return record;
  }, [projects]);

  return (
    <div
      className="min-h-0 h-full flex gap-4 p-4 bg-gray-50"
      style={{ overflow: 'hidden' }}
    >
      {/* 左侧项目列表（真实接口） */}
      <div
        className="flex-shrink-0 h-full"
        style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <ProjectList
          projectData={projectDataForList}
          selectedProjectKey={selectedProjectId}
          onItemClick={(item) => setSelectedProjectId(item.key as string)}
          onAdd={() => {}}
          onSearch={(keyword) => loadProjects(keyword)}
          onCreateProject={undefined}
          onEditProject={undefined}
          onDeleteProject={undefined}
          onSearchMember={undefined}
          onAddTask={undefined}
        />
      </div>

      {/* 右侧聊天窗口（静态本地消息示例） */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <header className="p-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold">
              {currentProject?.name || '请选择项目'}
            </div>
            <div className="text-xs text-gray-500">
              成员 {currentProject?.members?.length || 0} 人
            </div>
          </div>
          <Badge status="default" text="本地示例（未接实时/后端消息）" />
        </header>

        <section
          ref={messageListRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-3 bg-gray-50"
        >
          {filteredMessages.map(renderBubble)}
        </section>

        <footer className="p-3 border-t border-gray-200 bg-white">
          <div className="mb-2 flex items-center gap-2">
            <Popover
              content={
                <div className="flex flex-wrap max-w-[220px] gap-1">
                  {emojiList.map((e) => (
                    <Button
                      key={e}
                      size="small"
                      onClick={() => setInputValue((v) => v + e)}
                    >
                      {e}
                    </Button>
                  ))}
                </div>
              }
              trigger="click"
            >
              <Button size="small">🙂 表情</Button>
            </Popover>
            <Select
              allowClear
              placeholder="@成员"
              size="small"
              style={{ width: 140 }}
              options={memberOptions}
              onSelect={(_, option) => {
                const name = option.label as string;
                setInputValue((v) => `${v}@${name} `);
              }}
            />
            <div className="text-xs text-gray-400 flex-1">仅本地示例，未接入上传/文件</div>
          </div>
          <Input.TextArea
            rows={3}
            placeholder="输入消息，按回车发送"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="mt-2 flex justify-end items-center">
            <Button type="primary" onClick={handleSend} disabled={!selectedProjectId}>
              发送
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Message;
