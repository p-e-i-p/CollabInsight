
import React from 'react';
import dayjs from 'dayjs';
import CustomList, { type ListItem } from '@/Components/List';
import { Button, Input, Modal, Form, DatePicker, Select as AntSelect, Dropdown, Menu } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

interface ProjectListProps {
  // 项目数据
  projectData: Record<string, {
    projectName: string;
    projectDesc: string;
    status: string;
    priority: string;
    deadline: string;
    tasks: any[];
  }>;
  // 当前选中的项目key
  selectedProjectKey: string | null;
  // 项目点击处理函数
  onItemClick: (item: ListItem) => void;
  // 添加项目处理函数
  onAdd?: () => void;
  // 搜索项目处理函数
  onSearch?: (value: string) => void;
  // 添加任务处理函数
  onAddTask?: (projectKey: string, taskData: any) => void;
  // 删除项目处理函数
  onDeleteProject?: (projectKey: string) => void;
  // 编辑项目处理函数
  onEditProject?: (projectKey: string) => void;
}

/**
 * 项目列表组件
 * 用于展示所有项目，并支持选择、搜索等功能
 */
export const ProjectList: React.FC<ProjectListProps> = ({
  projectData,
  selectedProjectKey,
  onItemClick,
  onAdd,
  onSearch,
  onAddTask,
  onDeleteProject,
  onEditProject
}) => {
  // 左侧列表：展示所有项目名称（转换为 ListItem 格式）
  const taskItems: ListItem[] = Object.entries(projectData).map(([key, project]) => ({
    key,
    label: project.projectName, // 左侧显示项目名称
    actions: {
      onDelete: () => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除项目"${project.projectName}"吗？此操作不可恢复。`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            onDeleteProject?.(key);
          },
        });
      },
      onEdit: () => {
        showEditProjectModal(key);
      }
    }
  }));

  // 新增/编辑项目相关状态
  const [isProjectModalVisible, setIsProjectModalVisible] = React.useState(false);
  const [projectForm] = Form.useForm();
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentEditingKey, setCurrentEditingKey] = React.useState<string | null>(null);
  const [editingProject, setEditingProject] = React.useState<any>(null);

  // 打开新增项目弹窗
  const showProjectModal = () => {
    setIsProjectModalVisible(true);
    setIsEditing(false);
    setCurrentEditingKey(null);
    projectForm.resetFields();
  };

  // 打开编辑项目弹窗
  const showEditProjectModal = (projectKey: string) => {
    const project = projectData[projectKey];
    if (project) {
      setIsProjectModalVisible(true);
      setIsEditing(true);
      setCurrentEditingKey(projectKey);
      
      // 设置编辑项目数据
      setEditingProject(project);
    }
  };

  // 使用useEffect处理表单值的设置
  React.useEffect(() => {
    if (isProjectModalVisible && isEditing && editingProject) {
      projectForm.setFieldsValue({
        projectName: editingProject.projectName,
        projectDesc: editingProject.projectDesc,
        status: editingProject.status,
        priority: editingProject.priority,
        dateRange: editingProject.deadline ? [dayjs(editingProject.deadline), dayjs(editingProject.deadline)] : null,
      });
    }
  }, [isProjectModalVisible, isEditing, editingProject]);

  // 关闭项目弹窗
  const handleProjectModalCancel = () => {
    setIsProjectModalVisible(false);
    setIsEditing(false);
    setCurrentEditingKey(null);
    setEditingProject(null);
  };

  // 处理右侧操作按钮点击
  const handleActionClick = (item: ListItem, action: 'edit' | 'delete') => {
    if (action === 'edit') {
      showEditProjectModal(item.key);
    } else if (action === 'delete') {
      item.actions?.onDelete();
    }
  };

  // 处理更新按钮点击
  const handleUpdate = (item: ListItem) => {
    showEditProjectModal(item.key);
  };

  // 提交新增/编辑项目
  const handleProjectModalOk = () => {
    projectForm
      .validateFields()
      .then((values) => {
        const projectName = values.projectName;
        
        // 处理日期范围
        let deadline = '';
        if (values.dateRange && values.dateRange.length > 0) {
          // 使用第一个日期作为截止日期
          deadline = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
        }
        
        // 如果没有设置截止日期，使用当前日期
        if (!deadline) {
          deadline = dayjs().format('YYYY-MM-DD');
        }
        
        // 创建项目对象
        const projectData = {
          projectName,
          projectDesc: values.projectDesc || '',
          status: values.status || '未开始',
          priority: values.priority || '普通',
          deadline,
          tasks: []
        };

        // 如果是编辑模式
        if (isEditing && currentEditingKey) {
          // 调用父组件传递的编辑处理函数
          if (onEditProject) {
            onEditProject(currentEditingKey, projectData);
          }
          
          // 关闭弹窗
          setIsProjectModalVisible(false);
          
          // 显示成功消息
          alert(`项目 "${projectName}" 编辑成功！`);
        } else {
          // 新增模式
          // 生成项目ID
          const projectId = `p${Date.now()}`;
          
          // 调用父组件传递的新增处理函数
          if (onAdd) {
            onAdd();
          }
          
          // 关闭弹窗
          setIsProjectModalVisible(false);
          
          // 显示成功消息
          alert(`项目 "${projectName}" 添加成功！`);
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <div className="project-list-container">
      <CustomList
      title="全部项目列表"
      listItems={taskItems}
      defaultSelectedKey={selectedProjectKey || '1'} // 默认选中第一个项目
      onItemClick={onItemClick}
      onAdd={showProjectModal}
      onUpdate={handleUpdate}
      onDelete={(item) => {
        // 触发删除确认
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除项目"${item.label}"吗？此操作不可恢复。`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            onDeleteProject?.(item.key);
          },
        });
      }}
      onSearch={onSearch}
      onPageChange={(page, pageSize) => {
        console.log(`切换到第 ${page} 页，每页 ${pageSize} 条`);
      }}
    />



    {/* 新增/编辑项目弹窗 */}
    <Modal
      title={isEditing ? "编辑项目" : "新增项目"}
      open={isProjectModalVisible}
      onOk={handleProjectModalOk}
      onCancel={handleProjectModalCancel}
      destroyOnClose={true}
      width={700}
      styles={{ body: { padding: '20px' } }}
    >
      <Form
        form={projectForm}
        layout="vertical"
        name="projectForm"
        style={{ maxWidth: '100%' }}
      >
        <Form.Item
          name="projectName"
          label="项目名称"
          rules={[{ required: true, message: '请输入项目名称' }]}
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="请输入项目名称"
            showCount
            maxLength={50}
            size="large"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="projectDesc"
          label="项目描述"
          rules={[{ max: 150, message: '项目描述不能超过150字' }]}
          style={{ marginBottom: 16 }}
        >
          <Input.TextArea
            placeholder="请输入项目描述（最多150字）"
            showCount
            maxLength={150}
            rows={4}
            style={{ borderRadius: 6, resize: 'vertical' }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="项目状态"
          style={{ marginBottom: 16 }}
        >
          <AntSelect
            placeholder="请选择项目状态"
            size="large"
            style={{ borderRadius: 6 }}
          >
            <AntSelect.Option value="未开始">未开始</AntSelect.Option>
            <AntSelect.Option value="进行中">进行中</AntSelect.Option>
            <AntSelect.Option value="已完成">已完成</AntSelect.Option>
          </AntSelect>
        </Form.Item>

        <Form.Item
          name="priority"
          label="项目优先级"
          style={{ marginBottom: 16 }}
        >
          <AntSelect
            placeholder="请选择项目优先级"
            size="large"
            style={{ borderRadius: 6 }}
          >
            <AntSelect.Option value="高">高</AntSelect.Option>
            <AntSelect.Option value="中">中</AntSelect.Option>
            <AntSelect.Option value="普通">普通</AntSelect.Option>
            <AntSelect.Option value="低">低</AntSelect.Option>
          </AntSelect>
        </Form.Item>



        <Form.Item
          name="dateRange"
          label="项目时间范围"
          style={{ marginBottom: 16 }}
        >
          <DatePicker.RangePicker 
            style={{ 
              width: '100%',
              borderRadius: 6
            }} 
            placeholder={["开始日期", "截止日期"]}
            size="large"
            format="YYYY-MM-DD"
            allowClear
            onChange={(dates) => {
              // 当日期变化时，更新表单值
              if (dates && dates[0]) {
                projectForm.setFieldsValue({
                  dateRange: [dayjs(dates[0]).format('YYYY-MM-DD'), dayjs(dates[1] || dates[0]).format('YYYY-MM-DD')]
                });
              } else {
                projectForm.setFieldsValue({
                  dateRange: null
                });
              }
            }}
          />
        </Form.Item>


      </Form>
    </Modal>
    </div>
  );
};

export default ProjectList;
