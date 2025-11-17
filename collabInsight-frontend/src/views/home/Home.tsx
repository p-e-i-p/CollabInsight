import { Breadcrumb, Layout, Menu, theme, type BreadcrumbProps, type MenuProps } from 'antd';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FrownFilled, HomeOutlined } from '@ant-design/icons';
import { menuItems } from './menu';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Sider } = Layout;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const handelMenuClick: MenuProps['onClick'] = ({ key }) => {
    const path = key === '/' ? key : `/${key}`;
    return navigate(path);
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
        <Header className="mt-5  mr-5 rounded-xl h-17 px-6 bg-white flex items-center shadow-sm border-b"></Header>
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
