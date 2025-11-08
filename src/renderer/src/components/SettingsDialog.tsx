import { useEffect, useMemo, useRef, useState, memo } from 'react'
import { Button, Flex, Modal } from 'antd'
import ScrollBar from './ScrollBar'
import SiderMenu, { typeItems } from './SiderMenu'
import SettingForm from './SettingForm'
import { emitter, PAGE_EVENT } from '../common/bus'
import {
  resetSettingsToDefault,
  resetSettingsToInitial,
  saveSettings
} from '../stores/settingsStore'
import * as schemas from '@settings/schemas'
import { MAIN_EVENTS, RENDERER_EVENTS } from '@ipc/events'

const menuItems = [{ label: <span className="General">常规</span>, key: 'General' }, ...typeItems]
let formCount = 0

function SettingsDialog(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState(menuItems[0]!.key as string)

  const menuScrollerRef = useRef<ScrollBar | null>(null)
  const contentScrollerRef = useRef<ScrollBar | null>(null)

  const [sliceTo, setSliceTo] = useState(formCount)

  const formList = useMemo(() => {
    return menuItems.slice(0, sliceTo).map((item) => {
      const tab = item!.key as string
      return (
        <div key={tab} style={{ display: tab === currentTab ? 'block' : 'none' }}>
          <SettingForm tab={tab} />
        </div>
      )
    })
  }, [sliceTo, currentTab])

  useEffect(() => {
    if (formCount >= menuItems.length - 1) return
    const renderNextForm = () => {
      requestIdleCallback(() => {
        setSliceTo(++formCount)
        if (formCount < menuItems.length - 1) renderNextForm()
      })
    }
    renderNextForm()
  }, [])

  useEffect(() => {
    function onOpenSetting(newTab?: any) {
      if (newTab) setCurrentTab(newTab)
      setIsOpen(true)
      requestAnimationFrame(() => {
        menuScrollerRef.current?.forceUpdate()
        contentScrollerRef.current?.forceUpdate()
      })
    }
    emitter.on(PAGE_EVENT.SHOW_SETTINGS, onOpenSetting)
    window.ipc.on(MAIN_EVENTS.SHOW_SETTINGS, onOpenSetting)

    return () => {
      emitter.off(PAGE_EVENT.SHOW_SETTINGS)
      window.ipc.off(MAIN_EVENTS.SHOW_SETTINGS)
    }
  }, [])

  const resetTab = () => resetSettingsToDefault(currentTab)
  const resetAll = () => resetSettingsToDefault()

  const handleMenuChange = (key: string) => {
    setCurrentTab(key)
    contentScrollerRef.current?.updateScrollPosition(0)
  }

  const handleOk = () => {
    saveSettings()
    setIsOpen(false)
  }

  const handleCancel = () => {
    resetSettingsToInitial()
    requestAnimationFrame(() => setIsOpen(false))
  }

  const [forceRender, setForceRender] = useState(false)
  useEffect(() => {
    window.ipc.invoke(RENDERER_EVENTS.GET_SHARP_CONCURRENCY).then((sharpConcurrency: number) => {
      Object.assign(schemas.GeneralSchema.properties!.concurrently, {
        maximum: sharpConcurrency,
        default: sharpConcurrency
      })
      setForceRender(true)
    })
  }, [])

  const tabs = useMemo(() => {
    return (
      <SiderMenu
        scrollerRef={menuScrollerRef}
        items={menuItems}
        selectedKey={currentTab}
        onChange={handleMenuChange}
      ></SiderMenu>
    )
  }, [currentTab])

  return (
    <Modal
      forceRender={forceRender}
      title="设置"
      okText="保存"
      cancelText="取消"
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={(_, { OkBtn, CancelBtn }) => (
        <Flex className="settings-footer">
          <Flex flex="auto">
            <Button onClick={resetAll} type="primary" danger>
              重置全部
            </Button>
            <Button onClick={resetTab}>重置当前</Button>
          </Flex>
          <div>
            <CancelBtn />
            <OkBtn />
          </div>
        </Flex>
      )}
      destroyOnHidden={false}
      maskClosable={false}
      width="80vw"
      style={{ top: '10vh' }}
      className="settings-dialog"
    >
      {/* {Math.random()} */}
      <Flex className="settings-wrapper">
        <div className="settings-sider">{tabs}</div>
        <Flex flex="auto">
          <ScrollBar flex="1" ref={contentScrollerRef}>
            <div className="settings-form-wrapper">{formList}</div>
          </ScrollBar>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default memo(SettingsDialog)
