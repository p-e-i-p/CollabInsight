import {
  Breadcrumb,
  Layout,
  Menu,
  theme,
  type BreadcrumbProps,
  type MenuProps,
  Dropdown,
  Avatar,
} from 'antd';
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  FrownFilled,
  HomeOutlined,
  LogoutOutlined,
  KeyOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { menuItems } from './menu';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Sider } = Layout;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');

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
    return navigate(path);
  };

  // 处理下拉菜单点击
  const handleDropdownClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('token'); 
      navigate('/login'); 
    } else if (key === 'change-password') {
    
      console.log('修改密码');
    
    }
  };

  // 处理头像点击
  const handleAvatarClick = () => {
    // 跳转到个人中心页面
    navigate('/profile');
  };

  return (
    <Layout className="h-screen overflow-hidden flex flex-col h-full">
      <Sider width={250} theme="light" className="m-5 rounded-xl w-20000 ">
        <div className="flex items-center justify-center mb-1 p-5" onClick={() => navigate('/')}>
          <FrownFilled className=" text-3xl mr-3" />
          <span className="font-bold font-serif text-xl ">CollabInsight</span>
        </div>
        <Menu
          onClick={handelMenuClick}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
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
    </Layout>
  );
};
