import { Menu } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
const MenuList = () => {
    return (
        <Menu>
            <Menu.Item key="home" icon={<HomeOutlined />}>
            Home
            </Menu.Item>
        </Menu>
    );
};

export default MenuList;