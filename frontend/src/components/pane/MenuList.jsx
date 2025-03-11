import { Menu } from 'antd';
import { AppstoreOutlined, ProjectOutlined, BarsOutlined, HomeOutlined, SettingOutlined, CheckSquareOutlined, GlobalOutlined, ToolOutlined, TeamOutlined, AimOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const MenuList = () => {
  const navigate = useNavigate();

  const handleMenuClick = (key) => {
    // Navigate to the corresponding route based on the key
    switch (key) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        navigate('/my-projects-manager');
        break;
      case 'myTask':
        navigate('/my-tasks');
        break;
      case 'global':
        navigate('/global-sync');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'tool-1':
        navigate('/engagement-hub');
        break;
      case 'tool-3':
        navigate('/health-habit-tracker');
        break;  
      // Add cases for other menu items if needed
      default:
        break;
    }
  };

  return (
    <Menu mode="inline" className='sideBar' onClick={({ key }) => handleMenuClick(key)}>
      <Menu.Item style={{ marginTop: "12px", marginBottom: "10px" }} key="dashboard" icon={<BarsOutlined />}> Dashboard </Menu.Item>
      <Menu.Item style={{ marginBottom: "10px" }} key="projects" icon={<ProjectOutlined />}> Projects </Menu.Item>
      <Menu.Item style={{ marginBottom: "10px" }} key="myTask" icon={<CheckSquareOutlined />}> My Task </Menu.Item>
      <Menu.Item style={{ marginBottom: "10px" }} key="global" icon={<GlobalOutlined />}> Global Time Sync </Menu.Item>

      <Menu.SubMenu style={{ marginBottom: "10px" }} key="tools" icon={<ToolOutlined />} title="Tools">
        <Menu.Item style={{ marginBottom: "10px" }} key="tool-1" icon={<TeamOutlined />}> Engagement Hub </Menu.Item>
        <Menu.Item style={{ marginBottom: "10px" }} key="tool-2" icon={<AimOutlined />}> Focus Mode </Menu.Item>
        <Menu.Item style={{ marginBottom: "10px" }} key="tool-3" icon={<HeartOutlined />}> Health Habit Tracker </Menu.Item>
      </Menu.SubMenu>

      <Menu.Item style={{ marginBottom: "10px" }} key="settings" icon={<SettingOutlined />}> Settings </Menu.Item>
    </Menu>
  );
};

export default MenuList;