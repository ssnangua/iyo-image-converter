import { Layout } from 'antd'
import ControlBar from './components/ControlBar'
import TypesMenu from './components/TypesMenu'
import TaskList from './components/TaskList'
import InfoBar from './components/InfoBar'
import SettingsDialog from './components/SettingsDialog'
const { Header, Footer, Sider, Content } = Layout

function App(): React.JSX.Element {
  return (
    <>
      <Layout>
        <Header>
          <ControlBar />
        </Header>
        <Layout>
          <Sider>
            <TypesMenu />
          </Sider>
          <Content>
            <TaskList />
          </Content>
        </Layout>
        <Footer>
          <InfoBar />
        </Footer>
      </Layout>

      <SettingsDialog />
    </>
  )
}

export default App
