import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Tag,
  Tooltip,
  Typography,
  Divider,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, deleteUser, createUser, updateUser } from '@/request/api/userManagement';
import { auth } from '@/utils/http';
import type { UserProfile } from '@/request/type';

const { Title, Text } = Typography;
const { Option } = Select;

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('添加用户');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>('');

  // 检查是否是管理员
  const [isAdmin, setIsAdmin] = useState(
    auth.isLogin() && localStorage.getItem('userRole') === 'admin'
  );

  // 当用户角色变化时更新isAdmin状态
  useEffect(() => {
    const updateUserRole = () => {
      const loggedIn = auth.isLogin();
      const userRole = localStorage.getItem('userRole');
      setIsAdmin(loggedIn && userRole === 'admin');
      console.log(`用户角色已更新: ${userRole}, 是否是管理员: ${loggedIn && userRole === 'admin'}`);
    };

    // 监听storage事件
    window.addEventListener('storage', updateUserRole);

    // 监听自定义事件
    window.addEventListener('userRoleChanged', updateUserRole as EventListener);

    // 组件卸载时移除监听器
    return () => {
      window.removeEventListener('storage', updateUserRole);
      window.removeEventListener('userRoleChanged', updateUserRole as EventListener);
    };
  }, []);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    console.log('开始获取用户列表...');
    try {
      const data = await getUsers();
      console.log('获取到的用户数据:', data);
      // 确保返回的数据是数组
      const usersArray = Array.isArray(data) ? data : [];
      console.log('处理后的用户数组:', usersArray);
      setUsers(usersArray);
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      if (error.response && error.response.status === 403) {
        message.error('需要管理员权限');
      } else {
        message.error('获取用户列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取用户列表
  useEffect(() => {
    console.log('UserManagement组件加载，准备获取用户列表...');
    fetchUsers();
  }, []);

  // 当用户角色变化时，除了更新isAdmin状态，还需要重新获取用户列表
  useEffect(() => {
    const handleUserRoleChange = () => {
      console.log('检测到用户角色变化，重新获取用户列表...');
      fetchUsers();
    };

    window.addEventListener('userRoleChanged', handleUserRoleChange);
    return () => {
      window.removeEventListener('userRoleChanged', handleUserRoleChange);
    };
  }, []);

  // 处理搜索
  const handleSearch = () => {
    if (!searchText) {
      fetchUsers();
      return;
    }

    const filteredUsers = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setUsers(filteredUsers);
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchText('');
    fetchUsers();
  };

  // 打开添加用户模态框
  const handleAddUser = () => {
    setModalTitle('添加用户');
    form.resetFields();
    setEditingUserId(null);
    setModalVisible(true);
  };

  // 打开编辑用户模态框
  const handleEditUser = (user: UserProfile) => {
    setModalTitle('编辑用户');
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setEditingUserId(user._id);
    setModalVisible(true);
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      // HTTP拦截器已经显示了成功消息，这里不需要再显示
      fetchUsers();
    } catch (error: any) {
      // 错误消息由HTTP拦截器统一处理，这里只需要处理特殊权限错误
      if (error.response && error.response.status === 403) {
        // 403错误已经在拦截器中处理，这里不需要再显示
      }
      console.error('删除用户失败:', error);
    }
  };

  // 提交表单（添加或编辑用户）
  const handleSubmit = async (values: UserFormData) => {
    try {
      if (editingUserId) {
        await updateUser(editingUserId, values);
      } else {
        await createUser(values);
      }
      // HTTP拦截器已经显示了成功消息，这里不需要再显示
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      // 错误消息由HTTP拦截器统一处理，这里只需要处理特殊权限错误
      if (error.response && error.response.status === 403) {
        // 403错误已经在拦截器中处理，这里不需要再显示
      }
      console.error('提交用户失败:', error);
    }
  };

  // 表格列定义
  const columns: ColumnsType<UserProfile> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditUser(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteUser(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2">
      <Card>
        <div className="mb-6 flex justify-between items-center">
          <Title level={2}></Title>
          <Space>
            <Input
              placeholder="搜索用户名或邮箱"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
            />
            <Button icon={<ReloadOutlined />} onClick={handleResetSearch}>
              重置
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              刷新
            </Button>
            <Button type="primary" icon={<UserAddOutlined />} onClick={handleAddUser}>
              添加用户
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          locale={{
            emptyText: '暂无用户数据，请点击"添加用户"按钮创建新用户',
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 30, message: '用户名最多30个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUserId && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              <Option value="user">普通用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingUserId ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
