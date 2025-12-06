import {
  Layout,
  type MenuProps,
  Dropdown,
  Avatar,
  Form,
  Input,
  message,
  Button,
  Card,
  Menu,
} from 'antd';
import React, { useState, useEffect, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import {
  FrownFilled,
  LogoutOutlined,
  KeyOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { generateMenuItems } from './menu';
import { changePassword } from '@/request/api/changePassword';
import { getUserProfile } from '@/request/api/user/profile';
import ProfileCard from '@/Components/ProfileCard';
import { eventBus, Events } from '@/utils/eventBus';
import type { ChangePasswordParams } from '@/request/type';
export { HomeContext };
const { Header, Content, Sider } = Layout;

// 创建HomeContext
const HomeContext = createContext({
  setShowProfileCard: (show: boolean) => {}
});

export const Home: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showPasswordCard, setShowPasswordCard] = useState<boolean>(false);
  const [showProfileCard, setShowProfileCard] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [menuItems, setMenuItems] = useState<any[]>(() => generateMenuItems());

  // 获取用户角色并生成菜单项
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserAvatar(profile.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `http://localhost:3000${profile.avatar}`) : '');
        // 保存用户角色到localStorage
        localStorage.setItem('userRole', profile.role);
        console.log('用户角色:', profile.role);
        // 生成菜单项
        setMenuItems(generateMenuItems());
      } catch (error) {
        console.error('获取用户头像失败', error);
      }
    };

    fetchUserProfile();
  

    
    // 监听头像更新事件
    const handleAvatarUpdated = (avatarUrl: string) => {
      setUserAvatar(avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:3000${avatarUrl}`) : '');
    };
    
    eventBus.on(Events.USER_AVATAR_UPDATED, handleAvatarUpdated);
    
    // 清理函数
    return () => {
      eventBus.off(Events.USER_AVATAR_UPDATED, handleAvatarUpdated);
    };
  }, []);
  
  // 更新用户头像的函数
  const updateUserAvatar = (avatarUrl: string) => {
    setUserAvatar(avatarUrl ? `http://localhost:3000${avatarUrl}` : '');
  };

  // 实时时间更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setCurrentTime(timeString);
    };

    // 初始化时间并设置定时器
    updateTime();
    const timerId = setInterval(updateTime, 1000);

    // 清理定时器
    return () => clearInterval(timerId);
  }, []);

  const handelMenuClick: MenuProps['onClick'] = ({ key }) => {
    const path = key === '/' ? key : `/${key}`;
    return window.location.href = path;
  };

  // 处理下拉菜单点击
  const handleDropdownClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 清除token和用户角色信息
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      
      // 通知其他已打开的页面用户已退出登录
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'userRole',
        newValue: null,
        url: window.location.href
      }));
      
      // 触发自定义事件，以便其他组件能够响应用户退出登录
      window.dispatchEvent(new CustomEvent('userRoleChanged', {
        detail: { role: null }
      }));
      
      window.location.href = '/login';
    } else if (key === 'change-password') {
      setShowPasswordCard(true);
    }
  };

  // 处理修改密码表单提交
  const handlePasswordChange = async (values: ChangePasswordParams) => {
    try {
      await changePassword(values);
      message.success('密码修改成功，请重新登录');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('密码修改失败，请重试');
      }
    }
  };

  // 取消修改密码
  const handleCancel = () => {
    form.resetFields();
    setShowPasswordCard(false);
  };

  // 处理头像点击
  const handleAvatarClick = () => {
    // 显示个人中心卡片
    setShowProfileCard(true);
  };

  // 提供HomeContext给子组件
  const contextValue = {
    setShowProfileCard
  };

  // 关闭个人中心卡片
  const closeProfileCard = () => {
    setShowProfileCard(false);
    // 重新获取用户信息并更新头像
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserAvatar(profile.avatar ? `http://localhost:3000${profile.avatar}` : '');
      } catch (error) {
        console.error('重新获取用户头像失败', error);
      }
    };

    fetchUserProfile();
  };

  return (
    <HomeContext.Provider value={contextValue}>
      <Layout className="h-screen overflow-hidden flex flex-col h-full">
      <Sider width={250} theme="light" className="m-5 rounded-xl w-20000 ">
        <div className="flex items-center justify-center mb-1 p-5" onClick={() => window.location.href = '/'}>
          <FrownFilled className=" text-3xl mr-3" />
          <span className="font-bold font-serif text-xl ">CollabInsight</span>
        </div>
        <Menu
          onClick={handelMenuClick}
          defaultSelectedKeys={['/']}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout className="flex flex-col h-full">
        <Header className="mt-5  mr-5 rounded-xl h-18 px-6 bg-white flex items-center justify-between shadow-sm border-b">
          <div className="text-lg font-medium"></div>
          <div className="flex items-center space-x-4">
            <div className="text-gray-600 mr-4 font-medium text-lg">{currentTime}</div>
            <Avatar
              src={userAvatar}
              icon={<UserOutlined />}
              size={'large'}
              className=" transition-all duration-300 hover:scale-110"
              style={{ cursor: 'pointer' }}
              onClick={handleAvatarClick}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'change-password',
                    icon: <KeyOutlined />,
                    label: '修改密码',
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                  },
                ],
                onClick: handleDropdownClick,
              }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                <DownOutlined />
              </div>
            </Dropdown>
          </div>
        </Header>
        {/* 只修改 Content 区域：移除 overflow-hidden，子容器用 h-[calc(100%-1.25rem)] 替代 h-full */}
        <Content className="flex-1 mb-5 mr-5 ">
          <div className="bg-white rounded-xl shadow-sm mt-5 h-[calc(100%-1.25rem)] overflow-y-auto">
            <Outlet></Outlet>
          </div>
        </Content>
      </Layout>

      {/* 修改密码表单弹窗 */}
      {showPasswordCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <Card className=" col-span-1  text-center  shadow-xl rounded-lg border-2 backdrop-blur-sm bg-white/95 max-w-[90vw] w-[370px] h-[450px] ">
            <Form form={form} onFinish={handlePasswordChange}>
              <div className="text-xl pb-4 my-3">修改密码</div>
              <Form.Item name="oldPassword" rules={[{ required: true, message: '请输入旧密码' }]}>
                <Input.Password placeholder="请输入原密码" size="large" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少为6位' },
                ]}
              >
                <Input.Password placeholder="请输入新密码" size="large" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请确认新密码" size="large" />
              </Form.Item>
              <Form.Item>
                <div className="flex flex-col space-y-3 mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    autoInsertSpace
                    block
                    size="large"
                    loading={false}
                  >
                    确认
                  </Button>
                  <Button type="default" onClick={handleCancel} block size="large">
                    取消
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}

      {/* 个人中心卡片 */}
      {showProfileCard && (
        <ProfileCard onClose={closeProfileCard} />
      )}
    </Layout>
    </HomeContext.Provider>
  );
};

export default Home;
