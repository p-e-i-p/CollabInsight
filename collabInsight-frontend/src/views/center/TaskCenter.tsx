import CustomList, { type ListItem } from '@/Components/List';
import { ProjectList } from '@/components/ProjectList';
import TaskForm from './TaskForm';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Table, Space, Select, Input, Button, Tag, message, Form, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 模拟用户数据
const userData = {
  // 用户ID: { 用户名, 角色 }
  '1': { name: '张三', role: '组长' },
  '2': { name: '李四', role: '成员' },
  '3': { name: '王五', role: '成员' },
  '4': { name: '赵六', role: '成员' },
  '5': { name: '孙七', role: '成员' },
  '6': { name: '周八', role: '成员' },
  '7': { name: '吴九', role: '成员' },
};

// 模拟当前登录用户（假设为张三，组长）
const currentUser = {
  id: '1',
  name: '张三',
  role: '组长'
};

// 模拟项目数据（每个项目包含多个任务）
const projectData: Record<string, {
  projectName: string;
  projectDesc: string;
  status: string;
  priority: string;
  deadline: string;
  tasks: any[];
}> = {
  '1': {
    projectName: '云合成实验室', // 项目名称（左侧列表展示）
    projectDesc: '专注于云合成技术研发与产品落地', // 项目描述
    status: '进行中',
    priority: '高',
    deadline: '2025-12-31',
    // 项目下的任务列表
    tasks: [
      { taskId: 't1', taskName: '首页布局开发', taskDetails: '完成首页整体布局设计，包括导航栏、轮播图和主要内容区域', assignee: '张三', startDate: '2023-10-01', deadline: '2023-10-15', urgency: '高' },
      { taskId: 't2', taskName: '组件封装', taskDetails: '封装常用UI组件，包括按钮、表单、表格等基础组件', assignee: '李四', startDate: '2023-10-10', deadline: '2023-10-25', urgency: '中' },
      { taskId: 't3', taskName: '响应式适配', taskDetails: '实现页面在不同设备上的自适应布局', assignee: '王五', startDate: '2023-09-20', deadline: '2023-10-05', urgency: '普通' },
    ],
  },
  '2': {
    projectName: '智能接口平台',
    projectDesc: '提供统一的API接口管理与调度服务',
    status: '未开始',
    priority: '中',
    deadline: '2026-01-15',
    tasks: [
      { taskId: 't4', taskName: '用户管理接口', taskDetails: '实现用户注册、登录、信息修改等功能接口', assignee: '赵六', startDate: '2023-11-01', deadline: '2023-11-20', urgency: '高' },
      { taskId: 't5', taskName: '任务管理接口', taskDetails: '实现任务创建、分配、更新和查询等功能接口', assignee: '孙七', startDate: '2023-11-15', deadline: '2023-12-01', urgency: '普通' },
    ],
  },
  '3': {
    projectName: 'UI设计系统',
    projectDesc: '构建公司统一的UI设计规范与组件库',
    status: '已完成',
    priority: '低',
    deadline: '2025-11-20',
    tasks: [
      { taskId: 't6', taskName: '视觉效果优化', taskDetails: '优化界面视觉效果，提升用户体验', assignee: '周八', startDate: '2023-08-15', deadline: '2023-09-10', urgency: '中' },
      { taskId: 't7', taskName: '交互体验升级', taskDetails: '改进用户交互流程，提升操作便捷性', assignee: '吴九', startDate: '2023-09-01', deadline: '2023-09-25', urgency: '普通' },
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
  const [taskDetailsFilter, setTaskDetailsFilter] = useState<string | undefined>(undefined);
  const [urgencyFilter, setUrgencyFilter] = useState<string | undefined>(undefined);
  const [filteredTasks, setFilteredTasks] = useState(selectedProject?.tasks || []);

  // 新增项目相关状态（暂时未使用）
  // const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  // const [projectForm] = Form.useForm();

  // 新增任务相关状态
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  // 编辑任务相关状态
  const [editingTask, setEditingTask] = useState<any>(null);

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

      // 按任务详情筛选
      if (taskDetailsFilter) {
        tasks = tasks.filter(task => 
          task.taskDetails && task.taskDetails.toLowerCase().includes(taskDetailsFilter.toLowerCase())
        );
      }

      // 按紧急程度筛选
      if (urgencyFilter) {
        tasks = tasks.filter(task => task.urgency === urgencyFilter);
      }

      setFilteredTasks(tasks);
    }
  }, [selectedProject, searchText, taskDetailsFilter, urgencyFilter]);

  // 列表项点击：更新选中的项目（右侧展示该项目下的任务）
  const handleItemClick = (item: ListItem): void => {
    console.log('选中项目：', item.key, item.label);
    // 根据项目key获取项目详情（含项目下的任务）
    const project = projectData[item.key as keyof typeof projectData];
    setSelectedProject(project || null);
    // 重置筛选条件
    setSearchText('');
    setTaskDetailsFilter(undefined);
    setUrgencyFilter(undefined);
  };

  // 处理任务搜索
  const handleSearch = () => {
    if (!selectedProject) return;

    let tasks = selectedProject.tasks;
    if (taskDetailsFilter) {
      tasks = tasks.filter(task => 
        task.taskDetails && task.taskDetails.toLowerCase().includes(taskDetailsFilter.toLowerCase())
      );
    }
    if (urgencyFilter) {
      tasks = tasks.filter(task => task.urgency === urgencyFilter);
    }
    setFilteredTasks(tasks);
  };

  // 重置搜索（暂时未使用）
  // const handleResetSearch = () => {
  //   setStatusFilter(undefined);
  //   setUrgencyFilter(undefined);
  //   if (selectedProject) {
  //     setFilteredTasks(selectedProject.tasks);
  //   }
  // };

  // 添加新任务
  const handleAddTask = () => {
    if (!selectedProject) {
      message.warning('请先选择一个项目');
      return;
    }

    // 重置编辑状态
    setEditingTask(null);
    // 显示任务添加弹窗
    setIsTaskModalVisible(true);
  };

  // 编辑任务
  const handleEditTask = (task: any) => {
    if (!selectedProject) {
      message.warning('请先选择一个项目');
      return;
    }

    // 设置编辑任务数据
    setEditingTask(task);
    // 显示任务编辑弹窗
    setIsTaskModalVisible(true);
  };

  // 删除任务
  const handleDeleteTask = (task: any) => {
    if (!selectedProject) {
      message.warning('请先选择一个项目');
      return;
    }

    // 显示确认弹窗
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${task.taskName}"吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        // 执行删除操作
        executeDeleteTask(task);
      },
    });
  };

  // 执行删除任务操作
  const executeDeleteTask = (task: any) => {
    // 更新项目数据，移除任务
    const updatedProjectData = { ...projectData };
    const projectKey = Object.keys(projectData).find(key => projectData[key] === selectedProject);
    
    if (projectKey) {
      // 过滤掉要删除的任务
      const updatedTasks = updatedProjectData[projectKey].tasks.filter(t => t.taskId !== task.taskId);
      
      updatedProjectData[projectKey].tasks = updatedTasks;
      
      // 更新选中的项目
      setSelectedProject({
        ...updatedProjectData[projectKey],
        tasks: updatedTasks
      });
      
      // 更新筛选后的任务列表
      setFilteredTasks(updatedTasks);
      
      message.success('任务删除成功！');
    } else {
      message.error('无法确定项目，请重试');
    }
  };

  // 打开新增项目弹窗
  const showProjectModal = () => {
    // setIsProjectModalVisible(true);
    // projectForm.resetFields();
  };

  // 关闭新增项目弹窗
  const handleProjectModalCancel = () => {
    // setIsProjectModalVisible(false);
  };

  // 处理任务提交（新增或编辑）
  const handleTaskSubmit = (values: {
    taskName: string;
    assignee: string;
    startDate: dayjs.Dayjs;
    deadline: dayjs.Dayjs;
    urgency: string;
    taskDetails: string;
    projectKey?: string;
  }) => {
    if (!selectedProject) return;

    // 获取分配人信息
    const assigneeId = values.assignee;
    const assignee = userData[assigneeId as keyof typeof userData];

    // 判断是新增还是编辑
    if (editingTask) {
      // 编辑现有任务
      const updatedTask = {
        ...editingTask,
        taskName: values.taskName,
        taskDetails: values.taskDetails,
        assignee: assignee.name,
        startDate: values.startDate.format('YYYY-MM-DD'),
        deadline: values.deadline.format('YYYY-MM-DD'),
        urgency: values.urgency
      };

      // 更新项目数据
      const updatedProjectData = { ...projectData };
      const projectKey = values.projectKey || Object.keys(projectData).find(key => projectData[key] === selectedProject);
      
      if (projectKey) {
        // 更新任务列表
        const updatedTasks = updatedProjectData[projectKey].tasks.map(task => 
          task.taskId === editingTask.taskId ? updatedTask : task
        );
        
        updatedProjectData[projectKey].tasks = updatedTasks;
        
        // 更新选中的项目
        setSelectedProject({
          ...updatedProjectData[projectKey],
          tasks: updatedTasks
        });
        
        // 更新筛选后的任务列表
        setFilteredTasks(updatedTasks);
        
        message.success('任务更新成功！');
        setIsTaskModalVisible(false);
      } else {
        message.error('无法确定项目，请重试');
      }
    } else {
      // 添加新任务
      // 生成任务ID
      const taskId = `t${Date.now()}`;

      // 创建新任务对象
      const newTask = {
        taskId,
        taskName: values.taskName,
        taskDetails: values.taskDetails,
        assignee: assignee.name,
        startDate: values.startDate.format('YYYY-MM-DD'),
        deadline: values.deadline.format('YYYY-MM-DD'),
        urgency: values.urgency
      };

      // 更新项目数据，添加新任务
      const updatedProjectData = { ...projectData };
      // 优先使用传入的projectKey，如果没有则使用当前选中的项目
      const projectKey = values.projectKey || Object.keys(projectData).find(key => projectData[key] === selectedProject);
      
      if (projectKey) {
        updatedProjectData[projectKey].tasks = [
          ...updatedProjectData[projectKey].tasks,
          newTask
        ];
        
        // 更新选中的项目
        setSelectedProject({
          ...updatedProjectData[projectKey],
          tasks: [
            ...updatedProjectData[projectKey].tasks,
            newTask
          ]
        });
        
        // 更新筛选后的任务列表
        setFilteredTasks([
          ...updatedProjectData[projectKey].tasks,
          newTask
        ]);
        
        message.success('任务添加成功！');
        setIsTaskModalVisible(false);
      } else {
        message.error('无法确定项目，请重试');
      }
    }
  };

  // 关闭任务添加弹窗
  const handleTaskModalCancel = () => {
    setIsTaskModalVisible(false);
  };

  // 提交新增项目
  const handleProjectModalOk = () => {
    // projectForm
    //   .validateFields()
    //   .then((values) => {
    //     // 生成项目ID
    //     const projectId = `p${Date.now()}`;
    //     // 创建新项目对象
    //     const newProject = {
    //       projectId,
    //       projectName: values.projectName,
    //       projectDesc: values.projectDesc || '',
    //       status: values.status || '未开始',
    //       priority: values.priority || '普通',
    //       deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : '',
    //       tasks: []
    //     };
    //     // 更新项目数据
    //     const updatedProjectData = { ...projectData, [projectId]: newProject };
    //     // 这里应该调用父组件传递的处理函数或更新状态
    //     // 目前只是模拟更新

    //     message.success('项目添加成功！');
    //     setIsProjectModalVisible(false);
    //   })
    //   .catch((info: any) => {
    //     console.log('Validate Failed:', info);
    //   });
  };

  // 刷新任务列表
  const handleRefreshTasks = () => {
    message.info('任务列表已刷新');
    // 重置所有筛选条件
    setSearchText('');
    setTaskDetailsFilter(undefined);
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
      title: '任务详情',
      dataIndex: 'taskDetails',
      key: 'taskDetails',
      width: 200,
      ellipsis: true,
      render: (details) => details || '-',
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
      sorter: (a: any, b: any) => {
        const order = { '高': 3, '中': 2, '普通': 1 };
        return (order[(a.urgency || '普通') as keyof typeof order] || 1) - (order[(b.urgency || '普通') as keyof typeof order] || 1);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleEditTask(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDeleteTask(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full w-full flex flex-col" style={{ padding: "12px" }}>
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden" style={{ gap: "16px" }}>
        {/* 左侧：项目列表（共用组件） */}
        <div className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0" style={{ minWidth: "240px", flexBasis: "240px", display: "flex", flexDirection: "column" }}>
          <ProjectList
            projectData={projectData}
            selectedProjectKey={selectedProject ? Object.keys(projectData).find(key => projectData[key] === selectedProject) || null : null}
            onItemClick={handleItemClick}
            onAdd={showProjectModal}
            onSearch={(value) => {
              console.log('搜索项目：', value);
            }}
            onAddTask={(projectKey, taskData) => {
              // 设置当前选中的项目
              const project = projectData[projectKey as keyof typeof projectData];
              if (project) {
                setSelectedProject(project);

                // 打开添加任务弹窗
                handleAddTask();
              }
            }}
          />
        </div>

        {/* 右侧：展示选中项目下的所有任务 */}
        <div className="p-4 border rounded-lg bg-white overflow-hidden" style={{ flexShrink: 1, minWidth: 0, width: "calc(100% - 256px)" }}>
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
              <div className="flex flex-col h-full" style={{ minHeight: 0, overflow: "hidden" }}>
                <div className="flex justify-between items-center mb-4" style={{ flexWrap: "nowrap", gap: "8px" }}>
                  <h3 className="text-lg font-semibold whitespace-nowrap">任务列表</h3>
                  <div className="flex items-center" style={{ flexWrap: "nowrap", gap: "8px", overflow: "hidden", minWidth: 0 }}>
                    <Input
                      placeholder="搜索任务名称"
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 140 }}
                      onPressEnter={handleSearch}
                    />
                    <Input
                      placeholder="任务详情"
                      prefix={<SearchOutlined />}
                      value={taskDetailsFilter}
                      onChange={(e) => setTaskDetailsFilter(e.target.value)}
                      style={{ width: 120 }}
                      onPressEnter={handleSearch}
                    />
                    <Select
                      placeholder="紧急程度"
                      style={{ width: 80 }}
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
                    {/* 添加水平滚动条 */}
                    <div style={{ flexShrink: 0, width: 1 }}></div>
                  </div>
                </div>

                {/* 任务表格 */}
                <div className="flex flex-col h-full">
                  <div className="flex-grow overflow-auto" style={{ minHeight: 0 }}>
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
                </div>
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

      {/* 添加/编辑任务弹窗 */}
      <TaskForm
        visible={isTaskModalVisible}
        onCancel={handleTaskModalCancel}
        onOk={handleTaskSubmit}
        projectKey={selectedProject ? Object.keys(projectData).find(key => projectData[key] === selectedProject) : undefined}
        currentUserRole={currentUser.role}
        currentUser={currentUser}
        userData={userData}
        initialValues={editingTask ? {
          taskName: editingTask.taskName,
          assignee: Object.keys(userData).find(key => userData[key].name === editingTask.assignee),
          startDate: dayjs(editingTask.startDate),
          deadline: dayjs(editingTask.deadline),
          urgency: editingTask.urgency,
          taskDetails: editingTask.taskDetails
        } : undefined}
        isEdit={!!editingTask}
      />
    </div>
  );
};

export default TaskCenter;