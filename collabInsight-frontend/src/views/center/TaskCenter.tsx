
import CustomList, { type ListItem } from '@/Components/List';
import { ProjectList } from '@/components/ProjectList';
import React, { useState, useEffect } from 'react';
import { Table, Space, Select, Input, Button, Tag, message, Modal, Form, DatePicker, Select as AntSelect } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 模拟项目数据（每个项目包含多个任务）
const projectData = {
  '1': {
    projectName: '云合成实验室', // 项目名称（左侧列表展示）
    projectDesc: '专注于云合成技术研发与产品落地', // 项目描述
    status: '进行中',
    priority: '高',
    deadline: '2025-12-31',
    // 项目下的任务列表
    tasks: [
      { taskId: 't1', taskName: '首页布局开发', taskStatus: '进行中', assignee: '张三', startDate: '2023-10-01', deadline: '2023-10-15', urgency: '高' },
      { taskId: 't2', taskName: '组件封装', taskStatus: '未开始', assignee: '李四', startDate: '2023-10-10', deadline: '2023-10-25', urgency: '中' },
      { taskId: 't3', taskName: '响应式适配', taskStatus: '已完成', assignee: '王五', startDate: '2023-09-20', deadline: '2023-10-05', urgency: '普通' },
    ],
  },
  '2': {
    projectName: '智能接口平台',
    projectDesc: '提供统一的API接口管理与调度服务',
    status: '未开始',
    priority: '中',
    deadline: '2026-01-15',
    tasks: [
      { taskId: 't4', taskName: '用户管理接口', taskStatus: '未开始', assignee: '赵六', startDate: '2023-11-01', deadline: '2023-11-20', urgency: '高' },
      { taskId: 't5', taskName: '任务管理接口', taskStatus: '未开始', assignee: '孙七', startDate: '2023-11-15', deadline: '2023-12-01', urgency: '普通' },
    ],
  },
  '3': {
    projectName: 'UI设计系统',
    projectDesc: '构建公司统一的UI设计规范与组件库',
    status: '已完成',
    priority: '低',
    deadline: '2025-11-20',
    tasks: [
      { taskId: 't6', taskName: '视觉效果优化', taskStatus: '已完成', assignee: '周八', startDate: '2023-08-15', deadline: '2023-09-10', urgency: '中' },
      { taskId: 't7', taskName: '交互体验升级', taskStatus: '已完成', assignee: '吴九', startDate: '2023-09-01', deadline: '2023-09-25', urgency: '普通' },
    ],
  },
};

export const TaskCenter: React.FC = () => {
  // 左侧列表：展示所有项目名称（转换为 ListItem 格式）
  // 已抽离为共用组件 ProjectList

  // 新增状态：存储当前选中的项目
  const [selectedProject, setSelectedProject] = useState<
    (typeof projectData)[keyof typeof projectData] | null
  >(projectData['1']); // 默认选中第一个项目

  // 任务筛选相关状态
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [urgencyFilter, setUrgencyFilter] = useState<string | undefined>(undefined);
  const [filteredTasks, setFilteredTasks] = useState(selectedProject?.tasks || []);

  // 新增项目相关状态
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [projectForm] = Form.useForm();

  // 当选中项目或筛选条件变化时，更新过滤后的任务
  useEffect(() => {
    if (selectedProject) {
      let tasks = selectedProject.tasks;
      
      // 按任务名称搜索
      if (searchText) {
        tasks = tasks.filter(task => 
          task.taskName.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // 按状态筛选
      if (statusFilter) {
        tasks = tasks.filter(task => task.taskStatus === statusFilter);
      }

      // 按紧急程度筛选
      if (urgencyFilter) {
        tasks = tasks.filter(task => task.urgency === urgencyFilter);
      }

      setFilteredTasks(tasks);
    }
  }, [selectedProject, searchText, statusFilter, urgencyFilter]);

  // 列表项点击：更新选中的项目（右侧展示该项目下的任务）
  const handleItemClick = (item: ListItem): void => {
    console.log('选中项目：', item.key, item.label);
    // 根据项目key获取项目详情（含项目下的任务）
    const project = projectData[item.key as keyof typeof projectData];
    setSelectedProject(project || null);
    // 重置筛选条件
    setSearchText('');
    setStatusFilter(undefined);
    setUrgencyFilter(undefined);
  };

  // 处理任务搜索
  const handleSearch = () => {
    if (!selectedProject) return;

    let tasks = selectedProject.tasks;
    if (statusFilter) {
      tasks = tasks.filter(task => task.taskStatus === statusFilter);
    }

    if (urgencyFilter) {
      tasks = tasks.filter(task => task.urgency === urgencyFilter);
    }

    setFilteredTasks(tasks);
  };

  // 重置搜索
  const handleResetSearch = () => {
    setStatusFilter(undefined);
    setUrgencyFilter(undefined);
    if (selectedProject) {
      setFilteredTasks(selectedProject.tasks);
    }
  };

  // 添加新任务
  const handleAddTask = () => {
    message.info('添加任务功能待实现');
  };

  // 打开新增项目弹窗
  const showProjectModal = () => {
    setIsProjectModalVisible(true);
    projectForm.resetFields();
  };

  // 关闭新增项目弹窗
  const handleProjectModalCancel = () => {
    setIsProjectModalVisible(false);
  };

  // 提交新增项目
  const handleProjectModalOk = () => {
    projectForm
      .validateFields()
      .then((values) => {
        // 生成项目ID
        const projectId = `p${Date.now()}`;

        // 创建新项目对象
        const newProject = {
          projectId,
          projectName: values.projectName,
          projectDesc: values.projectDesc || '',
          status: values.status || '未开始',
          priority: values.priority || '普通',
          deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : '',
          tasks: []
        };

        // 更新项目数据
        const updatedProjectData = { ...projectData, [projectId]: newProject };
        // 这里应该调用父组件传递的处理函数或更新状态
        // 目前只是模拟更新
        
        message.success('项目添加成功！');
        setIsProjectModalVisible(false);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  // 刷新任务列表
  const handleRefreshTasks = () => {
    message.info('任务列表已刷新');
    // 重置所有筛选条件
    setSearchText('');
    setStatusFilter(undefined);
    setUrgencyFilter(undefined);
    // 由于使用的是本地数据，直接重置即可
    if (selectedProject) {
      setFilteredTasks(selectedProject.tasks);
    }
  };

  // 任务表格列定义
  const taskColumns: ColumnsType<any> = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      ellipsis: true,
      width: '200px',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date) => date ? date : '-',
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date) => date ? date : '-',
      sorter: (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      width: 120,
      render: (status) => {
        let color = 'processing';
        if (status === '已完成') color = 'success';
        else if (status === '未开始') color = 'default';
        return <Tag color={color}>{status}</Tag>;
      },
      sorter: (a, b) => {
        const order = { '进行中': 2, '未开始': 1, '已完成': 3 };
        return (order[a.taskStatus] || 1) - (order[b.taskStatus] || 1);
      },
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 120,
      render: (urgency) => {
        let color = 'default';
        if (urgency === '高') color = 'red';
        else if (urgency === '中') color = 'orange';
        return <Tag color={color}>{urgency || '普通'}</Tag>;
      },
      sorter: (a, b) => {
        const order = { '高': 3, '中': 2, '普通': 1 };
        return (order[a.urgency || '普通'] || 1) - (order[b.urgency || '普通'] || 1);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, _record) => (
        <Space size="middle">
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full w-full p-3">
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* 左侧：项目列表（共用组件） */}
        <ProjectList
          projectData={projectData}
          selectedProjectKey={selectedProject ? Object.keys(projectData).find(key => projectData[key] === selectedProject) || null : null}
          onItemClick={handleItemClick}
          onAdd={showProjectModal}
          onSearch={(value) => {
            console.log('搜索项目：', value);
          }}
          onAddTask={(projectKey, taskData) => {
            // 更新项目数据，添加新任务
            const updatedProjectData = { ...projectData };
            const project = updatedProjectData[projectKey as keyof typeof projectData];
            if (project) {
              project.tasks = [...project.tasks, taskData];
              
              // 如果当前选中的项目是要添加任务的项目，更新选中项目
              if (selectedProject && Object.keys(projectData).find(key => projectData[key] === selectedProject) === projectKey) {
                setSelectedProject({ ...project });
              }
              
              message.success('任务添加成功！');
            }
          }}
        />

        {/* 右侧：展示选中项目下的所有任务 */}
        <div className="flex-1 p-4 border rounded-lg bg-white overflow-auto">
          {selectedProject ? (
            <div className="space-y-6">
              {/* 项目基本信息 */}
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedProject.projectName}</h2>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <span className="text-gray-500 text-sm">项目状态：</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
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
                    <span className="text-gray-500 text-sm">优先级：</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
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
                    <span className="text-gray-500 text-sm">截止日期：</span>
                    <span className="ml-2 text-sm">{selectedProject.deadline}</span>
                  </div>
                </div>
                <p className="mt-3 text-gray-600 text-sm p-3 border rounded bg-gray-50">
                  {selectedProject.projectDesc}
                </p>
              </div>

              {/* 项目下的任务列表 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">任务列表</h3>
                  <Space>
                    <Input
                      placeholder="搜索任务名称"
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 200 }}
                      onPressEnter={handleSearch}
                    />
                    <Select
                      placeholder="按状态筛选"
                      style={{ width: 120 }}
                      allowClear
                      onChange={(value) => setStatusFilter(value)}
                    >
                      <Select.Option value="进行中">进行中</Select.Option>
                      <Select.Option value="未开始">未开始</Select.Option>
                      <Select.Option value="已完成">已完成</Select.Option>
                    </Select>
                    <Select
                      placeholder="按紧急程度筛选"
                      style={{ width: 120 }}
                      allowClear
                      onChange={(value) => setUrgencyFilter(value)}
                    >
                      <Select.Option value="高">高</Select.Option>
                      <Select.Option value="中">中</Select.Option>
                      <Select.Option value="普通">普通</Select.Option>
                    </Select>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefreshTasks}
                      title="刷新任务列表"
                    >
                      刷新
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddTask}
                    >
                      添加任务
                    </Button>
                  </Space>
                </div>

                {/* 任务表格 */}
                <Table
                  columns={taskColumns}
                  dataSource={filteredTasks}
                  rowKey={(record) => record.taskName + record.startDate}
                  locale={{
                    emptyText: '暂无任务数据，请点击"添加任务"按钮创建新任务',
                  }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条任务记录`,
                  }}
                  size="middle"
                />
              </div>

              {/* 空任务提示 */}
              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 mt-4">
                  <span>该项目暂无任务</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span>请选择左侧项目查看任务</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCenter;
