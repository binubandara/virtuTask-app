import { Menu } from 'antd';
import { AppstoreOutlined, ProjectOutlined, BarsOutlined, DashboardOutlined, HomeOutlined, SettingOutlined, CheckSquareOutlined, GlobalOutlined, ToolOutlined, TeamOutlined, AimOutlined, HeartOutlined } from '@ant-design/icons';
const MenuList = () => {
    return (
        <Menu mode="inline" className='sideBar' >
            <Menu.Item style={{marginTop:10, marginBottom: 15 }}key="home" icon={<DashboardOutlined />}>
            Dashboard
            </Menu.Item>
            <Menu.Item style={{ marginBottom: 15 }} key="projects" icon={<ProjectOutlined />}>
            Projects
            </Menu.Item>

            <Menu.Item style={{ marginBottom: 15 }}key="myTask" icon={<CheckSquareOutlined />}>
            My Task
            </Menu.Item>

            <Menu.Item style={{ marginBottom: 15 }}key="global" icon={<GlobalOutlined />}>
            Global Time Sync
            </Menu.Item>

            <Menu.SubMenu style={{ marginBottom: 15 }}key="tools" icon={<ToolOutlined />}
            title= "Tools">
            <Menu.Item style={{ marginBottom: 15 }} key="tool-1" icon={<TeamOutlined />}>Engagement Hub</Menu.Item>
            <Menu.Item style={{ marginBottom: 15 }} key="tool-2" icon={<AimOutlined />}>Focus Mode</Menu.Item>
            <Menu.Item style={{ marginBottom: 15 }} key="tool-3" icon={<HeartOutlined />}>Health Habit Tracker</Menu.Item>
            </Menu.SubMenu>


            <Menu.Item style={{ marginBottom: 15 }} key="settings" icon={<SettingOutlined />}>
            Settings
            </Menu.Item>

        </Menu>
    );
};

export default MenuList;