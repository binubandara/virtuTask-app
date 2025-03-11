import React, { useState, useEffect } from 'react';
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
import HealthHabit from '../health-habit-tracker/HealthHabit';
import MyProjectsManager from '../Task-management/MyProjectsManager';
import TaskManage from '../Task-management/TaskManage';
import TaskForm from '../Task-management/TaskForm';
import TaskInformation from '../Task-management/TaskInformation';
import MyTasks from '../Task-management-E/MyTasks';
import ProjectForm from '../Task-management/ProjectForm';

const { Sider, Content } = Layout;

const PanePage = () => {
  const location = useLocation();
  
  // Check if the current route is the landing page
  if (location.pathname === '/') {
    return <LandingPage />; // Directly render the LandingPage if on the root path
  }

  // Create and manage projects state at this level
  const [projects, setProjects] = useState(() => {
    // Try to load from localStorage if available
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={280}>
        <Logo />
        <MenuList />
        <Profile />
      </Sider>
      <Content>
        <Routes>
          <Route path="/dashboard" element={<ProductivityDashboard />} />
          <Route path="/engagement-hub" element={<EngagementHub />} />
          <Route path="/health-habit-tracker" element={<HealthHabit />} />
          <Route path="/global-sync" element={<ClockDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/pane/profile" element={<ProfilePage />} />

          {/* Project Management Routes */}
          <Route path="/my-projects-manager" element={<MyProjectsManager projects={projects} setProjects={setProjects} />} />
          <Route path="/task-manager/:projectId" element={<TaskManage projects={projects} setProjects={setProjects} />} />
          <Route path="/task-form" element={<TaskForm />} />
          <Route path="/task-info" element={<TaskInformation />} />
          <Route path="/my-tasks" element={<MyTasks />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default PanePage;
