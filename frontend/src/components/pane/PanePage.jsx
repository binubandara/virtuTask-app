import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import Logo from './Logo';
import MenuList from './MenuList';
import Profile from './Profile';
import Settings from '../settingsPage/Settings';
import Dashboard from './Dashboard'; 
import ClockDashboard from '../globalTime/ClockDashboard';  
import GlobalSync from './GlobalSync';
import ProfilePage from '../userProfile/ProfilePage';

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
        <Routes>
          <Route path="/" element={<Dashboard />} /> 
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="global-sync" element={<ClockDashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<ProfilePage/>} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default PanePage;