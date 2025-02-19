import { useState } from 'react'
import { Layout } from 'antd'
import Logo from './assets/components/pane/Logo';
import MenuList from './assets/components/pane/MenuList';

const { Header, Sider } = Layout;
function App() {
  return (
    <Layout>
      <Sider className='sidebar'>
        <Logo />
        <MenuList />
      </Sider>
    </Layout>
  )
}

export default App
