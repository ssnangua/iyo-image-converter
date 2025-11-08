import { memo } from 'react'
import '../assets/iconfont/iconfont.css'

function IconFont({ icon }): React.JSX.Element {
  return <i className={`iconfont ${icon}`}></i>
}
export default memo(IconFont)
