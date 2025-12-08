import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import type { FormInstance } from 'antd/es/form';

interface TaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  projectKey?: string;
  currentUserRole: string;
  currentUser: { id: string; name: string; role: string };
  userData: Record<string, { name: string; role: string }>;
  initialValues?: {
    taskName: string;
    assignee: string;
    startDate: dayjs.Dayjs;
    deadline: dayjs.Dayjs;
    urgency: string;
    status: string;
    taskDetails: string;
  };
  isEdit?: boolean;
  onSearchUser?: (keyword: string) => Promise<void>;
}

/**
 * 任务表单组件
 * 用于添加新任务，支持基于角色的任务分配
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  onCancel,
  onOk,
  projectKey,
  currentUserRole,
  currentUser,
  userData,
  initialValues,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const taskFormRef = React.useRef<FormInstance>(null);

  // 初始化任务分配选项
  const taskAssigneeOptions = React.useMemo(() => {
    return Object.entries(userData).map(([id, user]) => ({
      label: `${user.name} (${user.role})`,
      value: id
    }));
  }, [userData]);

  // 根据当前用户角色过滤任务分配选项
  const filteredTaskAssigneeOptions = React.useMemo(() => {
    // 如果是普通成员，只能分配给自己
    if (currentUserRole === '成员') {
      const selfOption = taskAssigneeOptions.find(opt => opt.value === currentUser.id);
      return selfOption ? [selfOption] : [];
    }
    // 组长可以分配给任何人
    return taskAssigneeOptions;
  }, [taskAssigneeOptions, currentUserRole, currentUser.id]);

  // 当模态框可见性变化时，填充初始值
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.setFieldsValue({
          taskName: '',
          assignee: currentUser.id, // 默认分配给当前用户
          startDate: dayjs(),
          deadline: dayjs().add(7, 'day'),
          urgency: '普通',
          status: '待办',
          taskDetails: ''
        });
      }
    }
  }, [visible, initialValues, form, currentUser.id]);

  // 处理表单提交
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk({
          ...values,
          projectKey
        });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={isEdit ? '编辑任务' : '添加新任务'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose={true}
      width={700}
      styles={{ body: { padding: '20px' } }}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        name="taskForm"
        style={{ maxWidth: '100%' }}
        ref={taskFormRef}
      >
        <Form.Item
          name="taskName"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="请输入任务名称"
            showCount
            maxLength={50}
            size="large"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="assignee"
          label="任务分配"
          rules={[{ required: true, message: '请选择任务分配人' }]}
          style={{ marginBottom: 16 }}
        >
          <Select
            placeholder="请选择任务分配人"
            size="large"
            style={{ borderRadius: 6 }}
            options={filteredTaskAssigneeOptions}
          />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="开始日期"
          rules={[{ required: true, message: '请选择开始日期' }]}
          style={{ marginBottom: 16 }}
        >
          <DatePicker 
            style={{ 
              width: '100%',
              borderRadius: 6
            }} 
            placeholder="请选择开始日期"
            size="large"
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              // 不允许选择过去的日期
              return current && current < dayjs().startOf('day');
            }}
            onChange={(date) => {
              // 确保日期值被正确设置为dayjs对象
              if (date) {
                form.setFieldsValue({
                  startDate: date
                });
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="截止日期"
          rules={[{ required: true, message: '请选择截止日期' }]}
          style={{ marginBottom: 16 }}
        >
          <DatePicker 
            style={{ 
              width: '100%',
              borderRadius: 6
            }} 
            placeholder="请选择截止日期"
            size="large"
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              // 不允许选择早于开始日期的日期
              const startDate = form.getFieldValue('startDate');
              if (startDate) {
                // 确保startDate是dayjs对象
                const startDateObj = dayjs.isDayjs(startDate) ? startDate : dayjs(startDate);
                return current && current < startDateObj.startOf('day');
              }
              return false;
            }}
            onChange={(date) => {
              // 确保日期值被正确设置为dayjs对象
              if (date) {
                form.setFieldsValue({
                  deadline: date
                });
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="urgency"
          label="紧急程度"
          rules={[{ required: true, message: '请选择紧急程度' }]}
          style={{ marginBottom: 16 }}
        >
          <Select
            placeholder="请选择紧急程度"
            size="large"
            style={{ borderRadius: 6 }}
          >
            <Select.Option value="高">高</Select.Option>
            <Select.Option value="中">中</Select.Option>
            <Select.Option value="普通">普通</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="任务状态"
          rules={[{ required: true, message: '请选择任务状态' }]}
          style={{ marginBottom: 16 }}
        >
          <Select
            placeholder="请选择任务状态"
            size="large"
            style={{ borderRadius: 6 }}
          >
            <Select.Option value="待办">待办</Select.Option>
            <Select.Option value="进行中">进行中</Select.Option>
            <Select.Option value="已完成">已完成</Select.Option>
            <Select.Option value="已取消">已取消</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="taskDetails"
          label="任务详情"
          rules={[{ required: true, message: '请输入任务详情' }]}
          style={{ marginBottom: 16 }}
        >
          <Input.TextArea
            placeholder="请输入任务详情"
            size="large"
            style={{ borderRadius: 6 }}
            rows={3}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;
