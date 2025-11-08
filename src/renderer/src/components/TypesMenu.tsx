import { setHoverType, setType, useGlobalStore } from '../stores/globalStore'
import SiderMenu from './SiderMenu'

function TypesMenu(): React.JSX.Element {
  const { type } = useGlobalStore()
  return <SiderMenu selectedKey={type} onChange={setType} onItemHover={setHoverType} />
}

export default TypesMenu
