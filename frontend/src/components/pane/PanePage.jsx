// components/pane/PanePage.jsx
import React from 'react';
import { Layout } from 'antd';
import Logo from './Logo';
import MenuList from './MenuList';
import Profile from './Profile';

const { Sider, Content } = Layout;

const PanePage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={250}>
        <Logo />
        <MenuList />
        <Profile />
      </Sider>
      <Content style={{ padding: '24px' }}>
        {/* Add your main content here */}
      </Content>
    </Layout>
  );
};

export default PanePage;