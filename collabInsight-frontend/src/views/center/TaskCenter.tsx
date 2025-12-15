import React, { useEffect, useMemo, useState } from 'react';
import { Table, Space, Select, Input, Button, Tag, message, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ProjectList } from '@/Components/ProjectList';
import TaskForm from './TaskForm';
import type { Project, Task } from '@/types/task';
import {
  createProject,
  createTask,
  deleteTask,
  deleteProject,
  fetchProjects,
  fetchTasksByProject,
  searchUser,
  updateProject,
  updateTask,
} from '@/request/api/task';
import { getUserProfile } from '@/request/api/user/profile';

interface AssigneeMap {
  [id: string]: { name: string; role: string };
}

export const TaskCenter: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState('');
  const [taskDetailsFilter, setTaskDetailsFilter] = useState<string | undefined>(undefined);
  const [urgencyFilter, setUrgencyFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  // 组装给 ProjectList 使用的数据
  const projectRecord = useMemo(() => {
    const record: Record<string, any> = {};
    projects.forEach((p) => {
      record[p._id] = {
        projectName: p.name,
        projectDesc: p.description || '',
        status: p.status,
        priority: p.priority,
        deadline: p.deadline ? dayjs(p.deadline).format('YYYY-MM-DD') : '',
        tasks: [],
        members: p.members || [],
        leaderName: p.leader?.username || '',
        leaderRole: p.leader?.role || '',
      };
    });
    return record;
  }, [projects]);

  // 计算可选成员（组长 + 成员）
  const assigneeMap: AssigneeMap = useMemo(() => {
    if (!selectedProject) return {};
    const members = [...selectedProject.members, selectedProject.leader];
    const map: AssigneeMap = {};
    members.forEach((m) => {
      map[m._id] = { name: m.username, role: m.role === 'admin' ? '组长' : '成员' };
    });
    return map;
  }, [selectedProject]);

  const fetchUser = async () => {
    try {
      const profile = await getUserProfile();
      setCurrentUser({
        id: profile._id,
        name: profile.username,
        role: profile.role === 'admin' ? '组长' : '成员',
      });
    } catch (error) {
      console.error(error);
      message.error('获取用户信息失败');
    }
  };

  const loadProjects = async (keyword?: string) => {
    try {
      const res = await fetchProjects(keyword ? { keyword } : undefined);
      setProjects(res);
      if (!selectedProjectId && res.length > 0) {
        setSelectedProjectId(res[0]._id);
      }
    } catch (error) {
      message.error('获取项目列表失败');
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await fetchTasksByProject(projectId);
      setTasks(res);
      setFilteredTasks(res);
    } catch (error) {
      message.error('获取任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    fetchUser();
    loadProjects();
  }, []);

  // 项目切换加载任务
  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
      setSearchText('');
      setTaskDetailsFilter(undefined);
      setUrgencyFilter(undefined);
    }
  }, [selectedProjectId]);

  // 过滤任务
  useEffect(() => {
    let data = [...tasks];
    if (searchText) {
      data = data.filter((t) => t.taskName.toLowerCase().includes(searchText.toLowerCase()));
    }
    if (taskDetailsFilter) {
      data = data.filter(
        (t) =>
          t.taskDetails && t.taskDetails.toLowerCase().includes(taskDetailsFilter.toLowerCase())
      );
    }
    if (urgencyFilter) {
      data = data.filter((t) => t.urgency === urgencyFilter);
    }
    if (statusFilter) {
      data = data.filter((t) => t.status === statusFilter);
    }
    setFilteredTasks(data);
  }, [tasks, searchText, taskDetailsFilter, urgencyFilter, statusFilter]);

  const handleAddTask = () => {
    if (!selectedProjectId) {
      message.warning('请先选择一个项目');
      return;
    }
    setEditingTask(null);
    setIsTaskModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalVisible(true);
  };

  const handleDeleteTask = (task: Task) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${task.taskName}"吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTask(task._id);
          // HTTP拦截器已经显示了成功消息，这里不需要再显示
          if (selectedProjectId) {
            loadTasks(selectedProjectId);
          }
        } catch (error) {
          // 错误消息由HTTP拦截器统一处理，这里不需要再显示
          console.error('删除任务失败:', error);
        }
      },
    });
  };

  const handleTaskSubmit = async (values: any) => {
    if (!selectedProjectId || !currentUser) return;
    try {
      const payload = {
        taskName: values.taskName,
        taskDetails: values.taskDetails,
        assignee: values.assignee,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        urgency: values.urgency,
        status: values.status,
      };

      if (editingTask) {
        await updateTask(editingTask._id, payload);
        // HTTP拦截器已经显示了成功消息，这里不需要再显示
      } else {
        await createTask(selectedProjectId, payload);
        // HTTP拦截器已经显示了成功消息，这里不需要再显示
      }
      setIsTaskModalVisible(false);
      loadTasks(selectedProjectId);
    } catch (error) {
      // 错误消息由HTTP拦截器统一处理，这里不需要再显示
      console.error('提交任务失败:', error);
    }
  };

  const handleRefreshTasks = () => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  };

  const handleCreateProject = async (values: any) => {
    try {
      await createProject({
        name: values.projectName,
        description: values.projectDesc,
        status: values.status,
        priority: values.priority,
        deadline: values.deadline, // 已经是 YYYY-MM-DD 格式
        memberIds: values.members || [],
      });
      // HTTP拦截器已经显示了成功消息，这里不需要再显示
      loadProjects();
    } catch (error: any) {
      console.error('创建项目失败:', error);
      // 错误消息由HTTP拦截器统一处理，这里不需要再显示
    }
  };

  const handleEditProject = async (projectId: string, values: any) => {
    try {
      await updateProject(projectId, {
        name: values.projectName,
        description: values.projectDesc,
        status: values.status,
        priority: values.priority,
        deadline: values.deadline, // 已经是 YYYY-MM-DD 格式
        memberIds: values.members || [],
      });
      // HTTP拦截器已经显示了成功消息，这里不需要再显示
      loadProjects();
    } catch (error: any) {
      console.error('更新项目失败:', error);
      // 错误消息由HTTP拦截器统一处理，这里不需要再显示
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      // HTTP拦截器已经显示了成功消息，这里不需要再显示
      // 如果删除的是当前选中的项目，清空选中状态
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
      loadProjects();
    } catch (error) {
      // 错误消息由HTTP拦截器统一处理，这里不需要再显示
      console.error('删除项目失败:', error);
    }
  };

  const handleSearchMemberForProject = async (keyword: string) => {
    const res: any = await searchUser(keyword);
    return res as Array<{ _id: string; username: string; role: string }>;
  };

  const taskColumns: ColumnsType<any> = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      ellipsis: true,
      width: 150,
    },
    {
      title: '执行人',
      dataIndex: ['assignee', 'username'],
      key: 'assignee',
      width: 120,
      render: (_: any, record: Task) => record.assignee?.username || '-',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
      sorter: (a, b) =>
        new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime(),
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
      sorter: (a, b) => new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime(),
    },

    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 120,
      render: (urgency: string) => {
        let color = 'default';
        if (urgency === '高') color = 'red';
        else if (urgency === '中') color = 'orange';
        return <Tag color={color}>{urgency || '普通'}</Tag>;
      },
      sorter: (a: any, b: any) => {
        const order = { 高: 3, 中: 2, 普通: 1 };
        return (
          (order[a.urgency as keyof typeof order] || 1) -
          (order[b.urgency as keyof typeof order] || 1)
        );
      },
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = 'default';
        if (status === '已完成') color = 'green';
        else if (status === '进行中') color = 'blue';
        else if (status === '已取消') color = 'red';
        return <Tag color={color}>{status || '待办'}</Tag>;
      },
      sorter: (a: any, b: any) => {
        const order = { 已完成: 4, 进行中: 3, 待办: 2, 已取消: 1 };
        return (
          (order[a.status as keyof typeof order] || 1) -
          (order[b.status as keyof typeof order] || 1)
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 130,

      render: (_: any, record: Task) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleEditTask(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDeleteTask(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full w-full flex flex-col" style={{ padding: '12px' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧项目列表 */}
        <div className="flex-shrink-0" style={{ display: 'flex', flexDirection: 'column' }}>
          <ProjectList
            projectData={projectRecord}
            selectedProjectKey={selectedProjectId}
            onItemClick={(item) => setSelectedProjectId(item.key as string)}
            onAdd={() => {}}
            onSearch={(value) => {
              loadProjects(value);
            }}
            onAddTask={(projectKey) => {
              setSelectedProjectId(projectKey);
              handleAddTask();
            }}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onSearchMember={handleSearchMemberForProject}
          />
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden ml-4">
          <div className="p-4 border rounded-lg bg-white flex-1 overflow-hidden">
            {selectedProject ? (
              <div className="h-full flex flex-col">
                {/* 项目信息部分 */}
                <div className="flex-shrink-0">
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div>
                      <span className="text-gray-500 text-xs">项目状态：</span>
                      <span
                        className={`p-1 rounded text-xs ${
                          selectedProject.status === '已完成'
                            ? 'bg-green-100 text-green-800'
                            : selectedProject.status === '进行中'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedProject.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">优先级：</span>
                      <span
                        className={`p-1 rounded text-xs ${
                          selectedProject.priority === '高'
                            ? 'bg-red-100 text-red-800'
                            : selectedProject.priority === '中'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedProject.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">截止日期：</span>
                      <span className="ml-2 text-xs">
                        {selectedProject.deadline
                          ? dayjs(selectedProject.deadline).format('YYYY-MM-DD')
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">项目负责人：</span>
                      <span className="ml-2 text-xs">
                        {selectedProject.leader?.username || '未指定'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600 text-xs p-3 border rounded bg-gray-50">
                    {selectedProject.description || '暂无描述'}
                  </p>
                </div>

                {/* 任务列表部分 */}
                <div className="flex-1 flex flex-col  mt-6">
                  {/* 搜索和操作栏 */}
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-sm font-semibold">任务列表</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="搜索任务名称"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 140 }}
                      />
                      <Input
                        placeholder="任务详情"
                        prefix={<SearchOutlined />}
                        value={taskDetailsFilter}
                        onChange={(e) => setTaskDetailsFilter(e.target.value)}
                        style={{ width: 120 }}
                      />
                      <Select
                        placeholder="紧急程度"
                        style={{ width: 100 }}
                        allowClear
                        value={urgencyFilter}
                        onChange={(value) => setUrgencyFilter(value)}
                      >
                        <Select.Option value="高">高</Select.Option>
                        <Select.Option value="中">中</Select.Option>
                        <Select.Option value="普通">普通</Select.Option>
                      </Select>
                      <Select
                        placeholder="任务状态"
                        style={{ width: 100 }}
                        allowClear
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                      >
                        <Select.Option value="待办">待办</Select.Option>
                        <Select.Option value="进行中">进行中</Select.Option>
                        <Select.Option value="已完成">已完成</Select.Option>
                        <Select.Option value="已取消">已取消</Select.Option>
                      </Select>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefreshTasks}
                        title="刷新任务列表"
                        size="small"
                      >
                        刷新
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddTask}
                        size="small"
                      >
                        添加
                      </Button>
                    </div>
                  </div>

                  {/* 表格部分 */}
                  <div
                    className="flex-1 min-h-0 overflow-auto"
                    style={{ paddingBottom: 32, maxHeight: 'calc(100vh - 220px)' }}
                  >
                    <Table
                      loading={loading}
                      columns={taskColumns}
                      dataSource={filteredTasks}
                      rowKey={(record) => record._id}
                      scroll={{ x: 'max-content', y: 'calc(100vh - 500px)' }}
                      locale={{
                        emptyText: '暂无任务数据，请点击"添加任务"按钮创建新任务',
                      }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条任务记录`,
                        position: ['bottomRight'],
                        style: { margin: '12px 0' },
                      }}
                      size="middle"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>请选择左侧项目查看任务</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskForm
        visible={isTaskModalVisible}
        onCancel={() => setIsTaskModalVisible(false)}
        onOk={handleTaskSubmit}
        projectKey={selectedProjectId || undefined}
        currentUserRole={currentUser?.role || '成员'}
        currentUser={
          currentUser || {
            id: '',
            name: '',
            role: '成员',
          }
        }
        userData={assigneeMap}
        initialValues={
          editingTask
            ? {
                taskName: editingTask.taskName,
                assignee: editingTask.assignee?._id,
                startDate: editingTask.startDate ? dayjs(editingTask.startDate) : dayjs(),
                deadline: editingTask.deadline
                  ? dayjs(editingTask.deadline)
                  : dayjs().add(7, 'day'),
                urgency: editingTask.urgency,
                status: editingTask.status,
                taskDetails: editingTask.taskDetails || '',
              }
            : undefined
        }
        isEdit={!!editingTask}
        onSearchUser={undefined}
      />
    </div>
  );
};

export default TaskCenter;
