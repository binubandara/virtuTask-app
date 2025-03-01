import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, ProjectOutlined, BarsOutlined, HomeOutlined, SettingOutlined, CheckSquareOutlined, GlobalOutlined, ToolOutlined, TeamOutlined, AimOutlined, HeartOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';

const MenuList = () => {
    return (
        <Menu mode="inline" className='sideBar'>
            <Menu.Item style={{marginTop:10, marginBottom: 15}} key="home" icon={<HomeOutlined />}>
                <Link to="/">Home</Link>
            </Menu.Item>

            <Menu.Item style={{marginBottom: 15}} key="dashboard" icon={<BarsOutlined />}>
                <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>

            <Menu.Item style={{ marginBottom: 15 }} key="projects" icon={<ProjectOutlined />}>
                <Link to="/projects">Projects</Link>
            </Menu.Item>

            <Menu.Item style={{ marginBottom: 15 }} key="myTask" icon={<CheckSquareOutlined />}>
                <Link to="/tasks">My Task</Link>
            </Menu.Item>

            <Menu.Item style={{ marginBottom: 15 }} key="global" icon={<GlobalOutlined />}>
                <Link to="/global">Global Time Sync</Link>
            </Menu.Item>

            <Menu.SubMenu style={{ marginBottom: 15 }} key="tools" icon={<ToolOutlined />} title="Tools">
                <Menu.Item style={{ marginBottom: 15 }} key="tool-1" icon={<TeamOutlined />}>
                    <Link to="/tools/engagement-hub">Engagement Hub</Link>
                </Menu.Item>
                <Menu.Item style={{ marginBottom: 15 }} key="tool-2" icon={<AimOutlined />}>
                    <Link to="/tools/focus-mode">Focus Mode</Link>
                </Menu.Item>
                <Menu.Item style={{ marginBottom: 15 }} key="tool-3" icon={<HeartOutlined />}>
                    <Link to="/tools/health-tracker">Health Habit Tracker</Link>
                </Menu.Item>
            </Menu.SubMenu>

            <Menu.Item style={{ marginBottom: 15 }} key="settings" icon={<SettingOutlined />}>
                <Link to="/settings">Settings</Link>
            </Menu.Item>

            {/* Testing Links */}
            <Menu.Divider />
            <Menu.Item style={{ marginBottom: 15 }} key="login" icon={<UserOutlined />}>
                <Link to="/login">Login</Link>
            </Menu.Item>
            
            <Menu.Item style={{ marginBottom: 15 }} key="register" icon={<UserAddOutlined />}>
                <Link to="/register">Register</Link>
            </Menu.Item>
        </Menu>
    );
};

export default MenuList;