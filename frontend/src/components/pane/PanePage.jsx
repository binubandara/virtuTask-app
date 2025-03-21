import React, { useState, useEffect, useContext } from 'react';
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
import HabitInfo from '../health-habit-tracker/HabitInfo';

// Task Management imports
import MyProjectsManager from '../Task-management/MyProjectsManager';
import ProjectForm from '../Task-management/ProjectForm';
import TaskManage from '../Task-management/TaskManage';
import TaskForm from '../Task-management/TaskForm';
import TaskInformation from '../Task-management/TaskInformation';
import MyTasks from '../Task-management-common/MyTasks';
import MyProjects from '../Task-management-employee/MyProjects';
import MyTasksEmployee from '../Task-management-employee/MyTasksEmployee';
import { SocketProvider } from '../../context/SocketContext';

// Import Focus Mode components and contexts
import { SettingContext } from '../../context/SettingsContext';
import SettingContextProvider from '../../context/SettingsContext';
import { TaskProvider } from '../../context/TaskContext';
import SetPomodoro from '../focus-mode/SetPomodoro';
import CountdownAnimation from '../focus-mode/CountDownAnimation';
import Button from '../focus-mode/Button';
import TaskList from '../focus-mode/TaskList';
import Rewards from '../rewardsPage/Rewards';

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

  // Focus Mode component directly integrated
  const FocusMode = () => {
    const {
      pomodoro, 
      executing, 
      setCurrentTimer,
      SettingBtn,
      startAnimate,
      startTimer,
      pauseTimer,
      updateExecute
    } = useContext(SettingContext);
    
    useEffect(() => {
      console.log("Pomodoro value updated:", pomodoro);
    }, [pomodoro]);
    
    useEffect(() => {
      updateExecute(executing);
    }, [executing, startAnimate, updateExecute]); 
    
    return (
      <div className={`container-focus ${pomodoro !== 0 ? 'with-task-list' : ''}`}>
        
        {pomodoro !== 0 ? (
          <>
          <h1 className="focus-title">FOCUS MODE</h1>
          <small className='focus-desc'>Be productive the right way</small>
            <ul className="labels">
              <li>
                <Button
                  title="Work"
                  activeClass={executing.active === 'work' ? 'active-label' : undefined}
                  _callback={() => setCurrentTimer('work')}
                />
              </li>
              <li>
                <Button
                  title="Short Break"
                  activeClass={executing.active === 'short' ? 'active-label' : undefined}
                  _callback={() => setCurrentTimer('short')}
                />
              </li>
              <li>
                <Button
                  title="Long Break"
                  activeClass={executing.active === 'long' ? 'active-label' : undefined}
                  _callback={() => setCurrentTimer('long')}
                />
              </li>
            </ul>
            
            <div className="settings-button">
              <Button title="Settings" _callback={SettingBtn} />
            </div>
            <div className={"time-container"}>
              <div className="time-wrapper mb-4">
                <CountdownAnimation
                  key={pomodoro}
                  timer={pomodoro}
                  animate={startAnimate}
                  taskId={executing.taskId}
                />
              </div>
            </div>
            <div className="button-swapper">
              <Button title="Start" activeClass={!startAnimate ? 'active' : undefined} _callback={startTimer} />
              <Button title="Pause" activeClass={startAnimate ? 'active' : undefined} _callback={pauseTimer} />
            </div>
        
            <TaskList />
          </>
        ) : (
          <SetPomodoro />
        )}
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#e4e4e4' }}>
      <Sider theme="light" width={280}>
        <Logo />
        <MenuList />
        <Profile />
      </Sider>
      <Content>
        <SocketProvider>
          <Routes>
            <Route path="/dashboard" element={<ProductivityDashboard />} />
            <Route path="/engagement-hub" element={<EngagementHub />} />
            <Route path="/health-habit-tracker" element={<HealthHabit />} />
            <Route path="/habit-info" element={<HabitInfo />} />
            <Route path="/global-sync" element={<ClockDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route path="/pane/profile" element={<ProfilePage />} />
            <Route path="/rewards" element={<Rewards />} /> 

            {/* Task Management Routes */}
            <Route path="/my-projects-manager" element={<MyProjectsManager projects={projects} setProjects={setProjects} />} />
            <Route path="/project-form" element={<ProjectForm />} />
            <Route path="/task-manager/:projectId" element={<TaskManage projects={projects} setProjects={setProjects} />} />
            <Route path="/task-form" element={<TaskForm />} />
            <Route path="/task-manager/:projectId/:taskId" element={<TaskManage projects={projects} setProjects={setProjects} />} />
            <Route path="/task-information" element={<TaskInformation />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/my-projects" element={<MyProjects projects={projects} />} />
            <Route path="/my-tasks-employee" element={<MyTasksEmployee />} />
        
            {/* Focus Mode Route - with the integrated component */}
            <Route path="/focus-mode" element={
              <TaskProvider>
                <SettingContextProvider>
                  <FocusMode />
                </SettingContextProvider>
              </TaskProvider>
            } />
          </Routes>
        </SocketProvider>
      </Content>
    </Layout>
  );
};

export default PanePage;