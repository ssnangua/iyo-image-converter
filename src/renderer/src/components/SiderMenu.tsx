import { memo } from 'react'
import ScrollBar from './ScrollBar'
import { TYPES } from '@common/format'

export type MenuItem = {
  key: string
  label: string | React.ReactNode
}

export const typeItems: MenuItem[] = TYPES.map((item) => {
  ;(item.label as React.ReactNode) = <span className={item.key}>{item.label}</span>
  return item
})

interface SiderMenuProps {
  items?: MenuItem[]
  selectedKey?: string
  scrollerRef?: React.RefObject<ScrollBar | null>
  onChange?(key: string): void
  onItemHover?(key: string): void
}

function SiderMenu({
  items = typeItems,
  selectedKey = items[0].key,
  scrollerRef,
  onChange = () => {},
  onItemHover = () => {}
}: SiderMenuProps): React.JSX.Element {
  return (
    <div className="sider-menu">
      <ScrollBar flex="1" ref={scrollerRef}>
        {/* {Math.random()} */}
        <div className="menu-list">
          {items.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${selectedKey === item.key ? 'selected' : ''}`}
              onClick={() => onChange(item.key)}
              onMouseOver={() => onItemHover(item.key)}
              onMouseOut={() => onItemHover('')}
            >
              {item.label}
            </div>
          ))}
        </div>
      </ScrollBar>
    </div>
  )
}

export default memo(SiderMenu)
