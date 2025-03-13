import { Menu } from 'antd';
import { AppstoreOutlined, BarsOutlined, SettingOutlined, CheckSquareOutlined, GlobalOutlined, ToolOutlined, TeamOutlined, AimOutlined, HeartOutlined, SolutionOutlined, FundProjectionScreenOutlined, ProfileOutlined, FolderOpenOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import "./MenuList.css";

const MenuList = () => {
  const navigate = useNavigate();

  const handleMenuClick = (key) => {
    switch (key) {
      case 'dashboard':
        navigate('/pane/dashboard');
        break;
      case 'projects':
        navigate('/pane/projects');
        break;
      case 'myTask':
        navigate('/pane/my-tasks');
        break;
      case 'global':
        navigate('/pane/global-sync');
        break;
      case 'settings':
        navigate('/pane/settings');
        break;
      case 'tool-2':
        navigate('/pane/rewards');
        break;
      default:
        break;
    }
  };

  return (
    <Menu mode="inline" className='sideBar' onClick={({ key }) => handleMenuClick(key)}>
      <Menu.Item style={{ marginTop: "10px", marginBottom: "10px" }} key="dashboard" icon={<BarsOutlined />}> Dashboard </Menu.Item>


      <Menu.SubMenu style={{ marginBottom: "10px" }} key="projects" icon={<AppstoreOutlined />} title="Projects">
        <Menu.Item style={{ marginBottom: "10px" }} key="p-1" icon={<SolutionOutlined />}> Project Management </Menu.Item>
        <Menu.Item style={{ marginBottom: "10px" }} key="p-2" icon={<FolderOpenOutlined />}> My Projects </Menu.Item>
      </Menu.SubMenu>

      <Menu.Item style={{ marginBottom: "10px" }} key="myTask" icon={<CheckSquareOutlined />}> My Task </Menu.Item>
      <Menu.Item style={{ marginBottom: "10px" }} key="global" icon={<GlobalOutlined />}> Global Time Sync </Menu.Item>

      <Menu.SubMenu style={{ marginBottom: "10px" }} key="tools" icon={<ToolOutlined />} title="Tools">
        <Menu.Item style={{ marginBottom: "10px" }} key="tool-1" icon={<TeamOutlined />}> Engagement Hub </Menu.Item>
        <Menu.Item style={{ marginBottom: "10px" }} key="tool-2" icon={<TrophyOutlined />}> My Rewards </Menu.Item>
        <Menu.Item style={{ marginBottom: "10px" }} key="tool-3" icon={<AimOutlined />}> Focus Mode </Menu.Item>
        <Menu.Item style={{ marginBottom: "10px" }} key="tool-4" icon={<HeartOutlined />}> Health Habit Tracker </Menu.Item>
      </Menu.SubMenu>

      <Menu.Item style={{ marginBottom: "10px" }} key="settings" icon={<SettingOutlined />}> Settings </Menu.Item>
    </Menu>
  );
};

export default MenuList;