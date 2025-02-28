import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import Logo from './Logo';
import MenuList from './MenuList';
import Profile from './Profile';
import ProductivityDashboard from '../productivity-tracker/ProductivityDashboard';
import EngagementHub from '../engagement-hub/EngagementHub';
import PrivacySettings from '../PrivacySettings';

const { Sider, Content } = Layout;

const PanePage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={250} className="sidebar">
        <Logo />
        <MenuList />
        <Profile />
      </Sider>
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route path="/dashboard" element={<ProductivityDashboard />} />
          <Route path="/tools/engagement-hub" element={<EngagementHub />} />
          <Route path="/settings" element={<PrivacySettings />} />
          {/* Add more routes as needed */}
        </Routes>
      </Content>
    </Layout>
  );
};

export default PanePage;