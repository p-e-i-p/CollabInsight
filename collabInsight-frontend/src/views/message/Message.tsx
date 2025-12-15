import React, { useEffect, useMemo, useState } from 'react';
import { Input, Button, Avatar, Badge, message as antdMessage, Popover, Select } from 'antd';
import dayjs from 'dayjs';
import ProjectList from '@/Components/ProjectList';
import type { Project } from '@/types/task';
import { fetchProjects } from '@/request/api/task';

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
  const currentUser = { id: 'me', name: '我', avatar: '' }; // TODO: 接入真实用户信息
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const messageListRef = React.useRef<HTMLDivElement>(null);
  const emojiList = ['😀', '😁', '😂', '😊', '😎', '🤔', '😢', '😭', '👍', '👏', '🔥', '❤️', '💪', '🚀'];

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
    const newMsg: LocalChatMessage = {
      id: `local-${Date.now()}`,
      projectId: selectedProjectId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: text,
      type: 'text',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    requestAnimationFrame(() => {
      messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const renderBubble = (msg: LocalChatMessage) => {
    const isMine = msg.senderId === currentUser.id;
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
            {currentUser.name[0]}
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
