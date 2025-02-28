import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import Logo from './Logo';
import MenuList from './MenuList';
import Profile from './Profile';
import Settings from '../settingsPage/Settings'; // Import Settings Page
import Dashboard from './Dashboard'; // Import other components as needed

import GlobalSync from './GlobalSync';
import ProfilePage from '../userProfile/ProfilePage';

const { Sider, Content } = Layout;

const PanePage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={250}>
        <Logo />
        <MenuList />  {/* Pass function properly */}
        <Profile />  {/* Profile will always be visible in the sidebar */}
      </Sider>
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* Default route for /pane */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="global-sync" element={<GlobalSync />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<ProfilePage/>} />
          {/* Add other routes here */}
        </Routes>
      </Content>
    </Layout>
  );
};

export default PanePage;