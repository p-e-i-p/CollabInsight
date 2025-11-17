import CustomList, { type ListItem } from '@/Components/List';
import React, { useState } from 'react';

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
      { taskId: 't1', taskName: '首页布局开发', taskStatus: '进行中', assignee: '张三' },
      { taskId: 't2', taskName: '组件封装', taskStatus: '未开始', assignee: '李四' },
      { taskId: 't3', taskName: '响应式适配', taskStatus: '已完成', assignee: '王五' },
    ],
  },
  '2': {
    projectName: '智能接口平台',
    projectDesc: '提供统一的API接口管理与调度服务',
    status: '未开始',
    priority: '中',
    deadline: '2026-01-15',
    tasks: [
      { taskId: 't4', taskName: '用户管理接口', taskStatus: '未开始', assignee: '赵六' },
      { taskId: 't5', taskName: '任务管理接口', taskStatus: '未开始', assignee: '孙七' },
    ],
  },
  '3': {
    projectName: 'UI设计系统',
    projectDesc: '构建公司统一的UI设计规范与组件库',
    status: '已完成',
    priority: '低',
    deadline: '2025-11-20',
    tasks: [
      { taskId: 't6', taskName: '视觉效果优化', taskStatus: '已完成', assignee: '周八' },
      { taskId: 't7', taskName: '交互体验升级', taskStatus: '已完成', assignee: '吴九' },
    ],
  },
};

export const TaskCenter: React.FC = () => {
  // 左侧列表：展示所有项目名称（转换为 ListItem 格式）
  const taskItems: ListItem[] = Object.entries(projectData).map(([key, project]) => ({
    key,
    label: project.projectName, // 左侧显示项目名称
  }));

  // 新增状态：存储当前选中的项目
  const [selectedProject, setSelectedProject] = useState<
    (typeof projectData)[keyof typeof projectData] | null
  >(projectData['1']); // 默认选中第一个项目

  // 列表项点击：更新选中的项目（右侧展示该项目下的任务）
  const handleItemClick = (item: ListItem): void => {
    console.log('选中项目：', item.key, item.label);
    // 根据项目key获取项目详情（含项目下的任务）
    const project = projectData[item.key as keyof typeof projectData];
    setSelectedProject(project || null);
  };

  return (
    <div className="h-full w-full p-3">
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* 左侧：项目列表（原List组件，展示项目名称） */}
        <CustomList
          title="全部项目列表"
          listItems={taskItems}
          defaultSelectedKey="1" // 默认选中第一个项目
          onItemClick={handleItemClick}
          onAdd={() => {
            console.log('打开新增项目弹窗');
          }}
          onSearch={(value) => {
            console.log('搜索项目：', value);
            // 可选：实现项目搜索过滤
            // const filtered = taskItems.filter(item => item.label.toString().includes(value));
          }}
          onPageChange={(page, pageSize) => {
            console.log(`切换到第 ${page} 页，每页 ${pageSize} 条`);
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
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-700">项目任务列表</h3>
                  <button className="text-blue-600 text-sm flex items-center">
                    <span className="mr-1">新增任务</span>
                  </button>
                </div>

                {/* 任务表格 */}
                <div className="mt-3 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">任务名称</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">负责人</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">任务状态</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.tasks.map((task) => (
                        <tr
                          key={task.taskId}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-800">{task.taskName}</td>
                          <td className="py-3 px-4 text-gray-600">{task.assignee}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                task.taskStatus === '已完成'
                                  ? 'bg-green-100 text-green-800'
                                  : task.taskStatus === '进行中'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {task.taskStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="text-blue-600 hover:text-blue-800">编辑</button>
                              <button className="text-red-600 hover:text-red-800">删除</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 空任务提示 */}
                {selectedProject.tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <span>该项目暂无任务</span>
                  </div>
                )}
              </div>
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
