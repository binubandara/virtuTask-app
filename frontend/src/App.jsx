import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login"; 
import Register from "./components/Login/Register"; 
import Password from "./components/Login/Password"; 
import MyProjectsManager from "./components/Task-management/MyProjectsManager";
import ProjectForm from "./components/Task-management/ProjectForm";
import TaskManage from "./components/Task-management/TaskManage";
import TaskForm from "./components/Task-management/TaskForm";
import TaskInformation from "./components/Task-management/TaskInformation";
import HealthHabit from "./components/Health-habit Tracker/HealthHabit";
import HabitInfo from "./components/Health-habit Tracker/HabitInfo";
import MyTasks from "./components/Task-management-E/MyTasks";



function App() {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        socket.connect();
        
        socket.on('projectsUpdated', (updatedProjects) => {
          setProjects(updatedProjects);
        });
    
        return () => {
          socket.off('projectsUpdated');
          socket.disconnect();
        };
      }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/password" element={<Password />} />
                <Route path="/My-projects-manager" element={<MyProjectsManager projects={projects} />}/>
                <Route path="/Project-form" element={<ProjectForm />} />
                <Route path="/task-manager/:projectId" element={<TaskManage projects={projects} />} /> {/* Fixed route */}
                <Route path="/TaskForm" element={<TaskForm />} />
                <Route path="/task-info" element={<TaskInformation />} />
                <Route path="/health-habit" element={<HealthHabit />} />
                <Route path="/habit-info" element={<HabitInfo />} />
                <Route path="/my-tasks" element={<MyTasks />} />
                
                
            </Routes>
        </Router>
    );
}

export default App;
