import { memo } from 'react'
import { Button, type ButtonProps } from 'antd'
import IconFont from './IconFont'

interface IconTextButtonProps extends ButtonProps {
  icon: string
  text?: string
}

const IconTextButton: React.FC<IconTextButtonProps> = ({ icon, text, ...otherProps }) => {
  return (
    <Button {...otherProps}>
      <IconFont icon={icon} />
      {text}
      {/* {Math.random()} */}
    </Button>
  )
}

export default memo(IconTextButton)
