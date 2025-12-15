import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';
import type { FormInstance } from 'antd/es/form';


interface BugFormProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  projectKey?: string;
  currentUserRole: string;
  currentUser: { id: string; name: string; role: string };
  userData: Record<string, { name: string; role: string }>;
  initialValues?: {
    bugName: string;
    assignee: string;
    startDate: dayjs.Dayjs;
    deadline: dayjs.Dayjs;
    severity: string;
    status: string;
    bugDetails: string;
  };
  isEdit?: boolean;
  isApproval?: boolean;
  onSearchUser?: (
    keyword: string
  ) => Promise<Array<{ _id: string; username: string; role: string }>>;
}



/**
 * Bug表单组件
 * 用于添加新Bug或编辑Bug，支持基于角色的Bug分配和组长审批
 */
export const BugForm: React.FC<BugFormProps> = ({
  visible,
  onCancel,
  onOk,
  projectKey,
  currentUserRole,
  currentUser,
  userData,
  initialValues,
  isEdit = false,
  isApproval = false,
  onSearchUser,
}) => {

  const [form] = Form.useForm();
  const BugFormRef = React.useRef<FormInstance>(null);

  // 初始化Bug分配选项
  const bugAssigneeOptions = React.useMemo(() => {
    return Object.entries(userData).map(([id, user]) => ({
      label: `${user.name} (${user.role})`,
      value: id
    }));
  }, [userData]);

  // 根据当前用户角色过滤Bug分配选项
  const filteredBugAssigneeOptions = React.useMemo(() => {
    // 如果是普通成员，只能分配给自己
    if (currentUserRole === '成员') {
      const selfOption = bugAssigneeOptions.find(opt => opt.value === currentUser.id);
      return selfOption ? [selfOption] : [];
    }
    // 组长可以分配给任何人
    return bugAssigneeOptions;
  }, [bugAssigneeOptions, currentUserRole, currentUser.id]);

  // 支持远程搜索时的分配人选项
  const [assigneeOptions, setAssigneeOptions] = React.useState(filteredBugAssigneeOptions);
  const enableRemoteSearch = currentUserRole === '组长' && !!onSearchUser;

  React.useEffect(() => {
    setAssigneeOptions(filteredBugAssigneeOptions);
  }, [filteredBugAssigneeOptions]);

  const quillModules = React.useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const handleSearchAssignee = async (keyword: string) => {
    if (!enableRemoteSearch || !onSearchUser) return;
    try {
      const list = await onSearchUser(keyword);
      const remoteOptions = (list || []).map((u) => ({
        label: `${u.username} (${u.role === 'admin' ? '组长' : '成员'})`,
        value: u._id,
      }));

      // 组长可在项目成员基础上合并搜索结果
      const merged = [...filteredBugAssigneeOptions];
      remoteOptions.forEach((opt) => {
        if (!merged.find((item) => item.value === opt.value)) {
          merged.push(opt);
        }
      });
      setAssigneeOptions(merged);
    } catch (error) {
      console.error('搜索分配人失败:', error);
    }
  };


  // 当模态框可见性变化时，填充初始值
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {

        form.setFieldsValue({
          bugName: '',
          assignee: currentUser.id, // 默认分配给当前用户
          startDate: dayjs(),
          deadline: dayjs().add(7, 'day'),
          severity: '中',
          status: '待处理',
          bugDetails: ''
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
      title={isApproval ? '审核Bug' : (isEdit ? '编辑Bug' : '添加新Bug')}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose={true}
      width={isApproval ? 700 : 600}
      centered={true}
      maskClosable={false}
      styles={{ body: { padding: '20px' } }}
    >

      <Form
        form={form}
        layout="vertical"
        name="BugForm"
        style={{ maxWidth: '100%' }}
        ref={BugFormRef}
      >

        {!isApproval && (
          <>
            <Form.Item
              name="bugName"
              label="Bug名称"
              rules={[{ required: true, message: '请输入Bug名称' }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                placeholder="请输入Bug名称"
                showCount
                maxLength={50}
                size="middle"
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            <Form.Item
              name="assignee"
              label="Bug分配"
              rules={[{ required: true, message: '请选择Bug分配人' }]}
              style={{ marginBottom: 16 }}
            >
              <Select
                placeholder="请选择Bug分配人"
                size="middle"
                style={{ borderRadius: 6 }}
                options={assigneeOptions}
                showSearch={enableRemoteSearch}
                filterOption={false}
                onSearch={handleSearchAssignee}
                onFocus={() => handleSearchAssignee('')}
              />
            </Form.Item>
          </>
        )}


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
            size="middle"
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
            size="middle"
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
          name="severity"
          label="严重程度"
          rules={[{ required: true, message: '请选择严重程度' }]}
          style={{ marginBottom: 16 }}
        >
          <Select
            placeholder="请选择严重程度"
            size="middle"
            style={{ borderRadius: 6 }}
          >
            <Select.Option value="严重">严重</Select.Option>
            <Select.Option value="高">高</Select.Option>
            <Select.Option value="中">中</Select.Option>
            <Select.Option value="低">低</Select.Option>
          </Select>
        </Form.Item>



        {!isApproval && (
          <>
            <Form.Item
              name="status"
              label="Bug状态"
              rules={[{ required: true, message: '请选择Bug状态' }]}
              style={{ marginBottom: 16 }}
            >
              <Select
                placeholder="请选择Bug状态"
                size="middle"
                style={{ borderRadius: 6 }}
              >
                <Select.Option value="待处理">待处理</Select.Option>
                <Select.Option value="处理中">处理中</Select.Option>
                <Select.Option value="待审核">待审核</Select.Option>
                <Select.Option value="已解决">已解决</Select.Option>
                <Select.Option value="已关闭">已关闭</Select.Option>
                <Select.Option value="已取消">已取消</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}


        {isApproval && (
          <>
            <Form.Item
              name="approvalStatus"
              label="审核结果"
              rules={[{ required: true, message: '请选择审核结果' }]}
              style={{ marginBottom: 16 }}
            >
              <Select
                placeholder="请选择审核结果"
                size="middle"
                style={{ borderRadius: 6 }}
              >
                <Select.Option value="通过">通过</Select.Option>
                <Select.Option value="不通过">不通过</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reviewComment"
              label="审核意见"
              style={{ marginBottom: 16 }}
            >
              <Input.TextArea
                placeholder="请输入审核意见"
                size="middle"
                style={{ borderRadius: 6 }}
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="bugDetails"
          label="Bug详情"
          rules={[{ required: true, message: '请输入Bug详情' }]}
          style={{ marginBottom: 16 }}
          getValueFromEvent={(content) => content}
        >
          <ReactQuill
            theme="snow"
            placeholder="请输入Bug详情"
            modules={quillModules}
            value={form.getFieldValue('bugDetails')}
            onChange={(content: string) => {
              form.setFieldsValue({ bugDetails: content });
            }}
            style={{ backgroundColor: 'white' }}
          />
        </Form.Item>
        {isEdit && !isApproval && (
          <Form.Item
            name="solution"
            label="解决方案"
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea
              placeholder="请输入解决方案（可选）"
              size="middle"
              style={{ borderRadius: 6 }}
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default BugForm;
