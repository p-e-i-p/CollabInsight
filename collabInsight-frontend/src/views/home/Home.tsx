import { Breadcrumb, Layout, Menu, theme, type MenuProps } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FrownFilled } from '@ant-design/icons';
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
        <Header  className="mt-5  mr-5 rounded-xl h-17 px-6 bg-white flex items-center shadow-sm border-b"></Header>
        <Content className="flex-1  overflow-hidden mb-5 mr-5 ">
          <Breadcrumb className="mb-4" />
          <div className="p-5 bg-white rounded-xl shadow-sm h-full ">
            <Outlet></Outlet>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
