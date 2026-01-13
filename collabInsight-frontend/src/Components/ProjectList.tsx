import React from 'react';
import dayjs from 'dayjs';
import CustomList, { type ListItem } from '@/Components/List';
import { Input, Modal, Form, DatePicker, Select as AntSelect } from 'antd';

interface ProjectListProps {
  // 项目数据
  projectData: Record<
    string,
    {
      projectName: string;
      projectDesc: string;
      status: string;
      priority: string;
      deadline: string;
      tasks: any[];
    }
  >;
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
  onEditProject?: (projectKey: string, values: any) => Promise<void> | void;
  onCreateProject?: (values: any) => Promise<void> | void;
  onSearchMember?: (
    keyword: string
  ) => Promise<Array<{ _id: string; username: string; role: string }>>;
  /** 列表高度，默认100%填满父容器 */
  height?: number | string;
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
  onEditProject,
  onCreateProject,
  onSearchMember,
  height = '100%',
}) => {
  // 左侧列表：展示所有项目名称（转换为 ListItem 格式）
  const taskItems: ListItem[] = Object.entries(projectData).map(([key, project]) => ({
    key,
    label: project.projectName, // 左侧仅显示项目名称
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
      },
    },
  }));

  // 新增/编辑项目相关状态
  const [isProjectModalVisible, setIsProjectModalVisible] = React.useState(false);
  const [projectForm] = Form.useForm();
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentEditingKey, setCurrentEditingKey] = React.useState<string | null>(null);
  const [editingProject, setEditingProject] = React.useState<any>(null);
  const [memberOptions, setMemberOptions] = React.useState<Array<{ label: string; value: string }>>(
    []
  );
  const [memberLoading, setMemberLoading] = React.useState(false);

  // 打开新增项目弹窗
  const showProjectModal = () => {
    setIsProjectModalVisible(true);
    setIsEditing(false);
    setCurrentEditingKey(null);
    setEditingProject(null);
    setMemberOptions([]);
    projectForm.resetFields();
  };

  // 打开添加任务弹窗
  const showTaskModal = (projectKey: string) => {
    // 调用父组件传递的添加任务处理函数
    if (onAddTask) {
      onAddTask(projectKey, null);
    }
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
      // 预填成员选项，确保已有成员展示为可删除标签
      const memberOpts = (editingProject.members || []).map((m: any) => {
        const value = typeof m === 'string' ? m : m._id || m;
        const label = typeof m === 'string' ? m : (m.username || m._id || m);
        return { label, value };
      });
      setMemberOptions(memberOpts);

      // 处理日期范围：如果有截止日期，使用它作为结束日期
      const deadlineDate = editingProject.deadline 
        ? dayjs(editingProject.deadline) 
        : null;
      
      projectForm.setFieldsValue({
        projectName: editingProject.projectName,
        projectDesc: editingProject.projectDesc || '',
        status: editingProject.status || '未开始',
        priority: editingProject.priority || '普通',
        dateRange: deadlineDate 
          ? [deadlineDate, deadlineDate] 
          : null,
        members: (editingProject.members || []).map((m: any) =>
          typeof m === 'string' ? m : (m._id || m)
        ),
      });
    } else if (isProjectModalVisible && !isEditing) {
      // 新增模式：清空表单
      projectForm.resetFields();
      setMemberOptions([]);
    }
  }, [isProjectModalVisible, isEditing, editingProject, projectForm]);

  // 新增模式：弹窗打开时自动加载所有用户
  React.useEffect(() => {
    if (isProjectModalVisible && !isEditing && onSearchMember && memberOptions.length === 0) {
      // 延迟加载，避免与表单重置冲突
      const timer = setTimeout(async () => {
        try {
          setMemberLoading(true);
          const list = await onSearchMember('');
          const options = (list || []).map((u) => ({
            label: `${u.username} (${u.role === 'admin' ? '组长' : '成员'})`,
            value: u._id,
          }));
          setMemberOptions(options);
        } catch (error) {
          console.error('加载用户列表失败:', error);
        } finally {
          setMemberLoading(false);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isProjectModalVisible, isEditing, onSearchMember, memberOptions.length]);

  const handleSearchMember = async (keyword: string) => {
    if (!onSearchMember) return;
    
    try {
      setMemberLoading(true);
      // 即使关键词为空，也调用API获取所有用户
      const searchKeyword = keyword ? keyword.trim() : '';
      const list = await onSearchMember(searchKeyword);
      
      // 确保返回的是数组
      const userList = Array.isArray(list) ? list : [];
      
      const options = userList.map((u: any) => ({
        label: `${u.username || u._id} (${u.role === 'admin' ? '组长' : '成员'})`,
        value: u._id,
      }));
      
      // 合并搜索结果和已有成员（编辑模式）
      if (isEditing && editingProject) {
        const existingMembers = (editingProject.members || []).map((m: any) => {
          const value = typeof m === 'string' ? m : m._id || m;
          const label = typeof m === 'string' ? m : (m.username || m._id || m);
          return { label, value };
        });
        // 合并并去重，确保已有成员也在列表中
        const merged = [...existingMembers];
        options.forEach((opt) => {
          if (!merged.find((m) => m.value === opt.value)) {
            merged.push(opt);
          }
        });
        setMemberOptions(merged);
      } else {
        setMemberOptions(options);
      }
    } catch (error: any) {
      console.error('搜索成员失败:', error);
      // 如果搜索失败，至少保留已有成员（编辑模式）
      if (isEditing && editingProject) {
        const existingMembers = (editingProject.members || []).map((m: any) => {
          const value = typeof m === 'string' ? m : m._id || m;
          const label = typeof m === 'string' ? m : (m.username || m._id || m);
          return { label, value };
        });
        setMemberOptions(existingMembers);
      } else {
        setMemberOptions([]);
      }
    } finally {
      setMemberLoading(false);
    }
  };

  // 关闭项目弹窗
  const handleProjectModalCancel = () => {
    setIsProjectModalVisible(false);
    setIsEditing(false);
    setCurrentEditingKey(null);
    setEditingProject(null);
    setMemberOptions([]);
    projectForm.resetFields();
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
  const handleProjectModalOk = async () => {
    try {
      const values = await projectForm.validateFields();
      const projectName = values.projectName;

      // 处理日期范围：使用结束日期（第二个日期）作为截止日期
      let deadline = '';
      if (values.dateRange && Array.isArray(values.dateRange) && values.dateRange.length > 0) {
        // 如果有结束日期，使用结束日期；否则使用开始日期
        const endDate = values.dateRange[1] || values.dateRange[0];
        deadline = dayjs(endDate).format('YYYY-MM-DD');
      }

      // 创建项目对象
      const payload = {
        projectName,
        projectDesc: values.projectDesc || '',
        status: values.status || '未开始',
        priority: values.priority || '普通',
        deadline: deadline || undefined, // 如果没有设置日期，传undefined而不是空字符串
        tasks: [],
        members: values.members || [],
      };

      // 如果是编辑模式
      if (isEditing && currentEditingKey) {
        // 调用父组件传递的编辑处理函数
        if (onEditProject) {
          await onEditProject(currentEditingKey, payload);
        }
      } else {
        // 新增模式
        if (onCreateProject) {
          await onCreateProject(payload);
        } else if (onAdd) {
          onAdd();
        }
      }

      // 成功提交后关闭弹窗并重置状态
      handleProjectModalCancel();
    } catch (error: any) {
      // 表单验证失败，不关闭弹窗，让用户修正错误
      if (error.errorFields) {
        console.log('表单验证失败:', error.errorFields);
        // 表单验证失败时不关闭弹窗
        return;
      }
      
      // 其他错误（如API调用失败），也关闭弹窗
      // 错误消息已由HTTP拦截器统一处理
      console.error('提交失败:', error);
      handleProjectModalCancel();
    }
  };

  return (
    <div className="project-list-container h-full" style={{ minHeight: 0 }}>
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
        onAddTask={(item) => {
          showTaskModal(item.key);
        }}
        height={height}
      />

      {/* 新增/编辑项目弹窗 */}
      <Modal
        title={isEditing ? '编辑项目' : '新增项目'}
        open={isProjectModalVisible}
        onOk={handleProjectModalOk}
        onCancel={handleProjectModalCancel}
        okText={isEditing ? '保存' : '创建'}
        cancelText="取消"
        destroyOnClose={true}
        width={700}
        centered={true} // 添加这个属性使弹窗居中显示
        styles={{ body: { padding: '20px' } }}
      >
        <Form form={projectForm} layout="vertical" name="projectForm" style={{ maxWidth: '100%' }}>
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
              size="middle"
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

          <Form.Item name="status" label="项目状态" style={{ marginBottom: 16 }}>
            <AntSelect placeholder="请选择项目状态" size="middle" style={{ borderRadius: 6 }}>
              <AntSelect.Option value="未开始">未开始</AntSelect.Option>
              <AntSelect.Option value="进行中">进行中</AntSelect.Option>
              <AntSelect.Option value="已完成">已完成</AntSelect.Option>
            </AntSelect>
          </Form.Item>

          <Form.Item name="priority" label="项目优先级" style={{ marginBottom: 16 }}>
            <AntSelect placeholder="请选择项目优先级" size="middle" style={{ borderRadius: 6 }}>
              <AntSelect.Option value="高">高</AntSelect.Option>
              <AntSelect.Option value="中">中</AntSelect.Option>
              <AntSelect.Option value="普通">普通</AntSelect.Option>
              <AntSelect.Option value="低">低</AntSelect.Option>
            </AntSelect>
          </Form.Item>

          <Form.Item name="dateRange" label="项目截止日期" style={{ marginBottom: 16 }}>
            <DatePicker.RangePicker
              style={{
                width: '100%',
                borderRadius: 6,
              }}
              placeholder={['开始日期', '截止日期']}
              size="middle"
              format="YYYY-MM-DD"
              allowClear
            />
          </Form.Item>

          <Form.Item name="members" label="项目成员（可多选）" style={{ marginBottom: 16 }}>
            <AntSelect
              mode="multiple"
              showSearch
              filterOption={false}
              placeholder="搜索用户名或ID添加成员，点击可查看全部用户"
              notFoundContent={memberLoading ? '搜索中...' : '暂无结果'}
              options={memberOptions}
              onSearch={handleSearchMember}
              onFocus={() => {
                // 当选择框聚焦时，如果没有选项，自动加载所有用户
                if (memberOptions.length === 0) {
                  handleSearchMember('');
                }
              }}
              allowClear
              size="middle"
              style={{ borderRadius: 6 }}
              // 让已选成员以标签形式展示，可点击 × 移除
              maxTagCount="responsive"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;
