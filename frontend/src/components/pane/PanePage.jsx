import React from 'react';
import { Layout } from 'antd';
import { Routes, Route, useLocation } from 'react-router-dom';
import Logo from './Logo';
import MenuList from './MenuList';
import Profile from './Profile';
import Settings from '../settingsPage/Settings';
import PrivacySettings from '../PrivacySettings';
import ProductivityDashboard from '../productivity-tracker/ProductivityDashboard';
import ClockDashboard from '../globalTime/ClockDashboard'; 
import ProfilePage from '../userProfile/ProfilePage';
import EngagementHub from '../engagement-hub/EngagementHub';
import LandingPage from '../landingPage/LandingPage';


const { Sider, Content } = Layout;

const PanePage = () => {
  const location = useLocation();
  
  // Check if the current route is the landing page
  if (location.pathname === '/') {
    return <LandingPage />; // Directly render the LandingPage if on the root path
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={240}>
        <Logo />
        <MenuList />
        <Profile />
      </Sider>
      <Content>
        <Routes>
          <Route path="/dashboard" element={<ProductivityDashboard />} />
          <Route path="/engagement-hub" element={<EngagementHub />} />
          <Route path="/global-sync" element={<ClockDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/pane/profile" element={<ProfilePage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default PanePage;
