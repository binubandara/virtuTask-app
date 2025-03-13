import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import Logo from './Logo';
import MenuList from './MenuList';
import Profile from './Profile';
import Settings from '../settingsPage/Settings';
import Dashboard from './Dashboard'; 
import ClockDashboard from '../globalTime/ClockDashboard';  
import ProfilePage from '../userProfile/ProfilePage';
import Rewards from '../rewardsPage/Rewards';

const { Sider, Content } = Layout;

const PanePage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={240}>
        <Logo />
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}> 
          <MenuList />  
          <Profile />  
        </div>
      </Sider>
      <Content >
        <Routes>
          <Route path="/" element={<Dashboard />} /> 
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="global-sync" element={<ClockDashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<ProfilePage/>} />
          <Route path="rewards" element={<Rewards />} /> 
        </Routes>
      </Content>
    </Layout>
  );
};

export default PanePage;