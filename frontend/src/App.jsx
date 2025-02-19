import { useState } from 'react'
import { Layout } from 'antd'
import Logo from './assets/components/pane/Logo';
import MenuList from './assets/components/pane/MenuList';
import Profile from './assets/components/pane/Profile';


const { Sider } = Layout;
function App() {
  return (
    <Layout>
      <Sider className='sidebar' width={240}>
        <Logo />
        <MenuList />
        <Profile />
      </Sider>
    </Layout>
  )
}

export default App
