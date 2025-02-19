import { Menu } from 'antd';
import { AppstoreOutlined, ProjectOutlined, BarsOutlined, DashboardOutlined, HomeOutlined, SettingOutlined, CheckSquareOutlined, GlobalOutlined, ToolOutlined, TeamOutlined, AimOutlined, HeartOutlined } from '@ant-design/icons';
const MenuList = () => {
    return (
        <Menu mode="inline">
            <Menu.Item key="home" icon={<DashboardOutlined />}>
            Dashboard
            </Menu.Item>

            <Menu.Item key="projects" icon={<ProjectOutlined />}>
            Projects
            </Menu.Item>

            <Menu.Item key="myTask" icon={<CheckSquareOutlined />}>
            My Task
            </Menu.Item>

            <Menu.Item key="global" icon={<GlobalOutlined />}>
            Global Time Sync
            </Menu.Item>

            <Menu.SubMenu key="tools" icon={<ToolOutlined />}
            title= "Tools">
            <Menu.Item key="tool-1" icon={<TeamOutlined />}>Engagement Hub</Menu.Item>
            <Menu.Item key="tool-2" icon={<AimOutlined />}>Focus Mode</Menu.Item>
            <Menu.Item key="tool-3" icon={<HeartOutlined />}>Health Habit Tracker</Menu.Item>
            </Menu.SubMenu>


            <Menu.Item key="settings" icon={<SettingOutlined />}>
            Settings
            </Menu.Item>

        </Menu>
    );
};

export default MenuList;