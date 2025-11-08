import { memo, useEffect } from 'react'
import { Form } from 'antd'
import { isEqual } from 'lodash-es'
import JsonSchemaForm from './form/JsonSchemaForm'
import * as schemas from '@settings/schemas'
import { type Settings } from '@settings/Settings'
import { getSetting, setSetting } from '../stores/settingsStore'
import { emitter, PAGE_EVENT } from '../common/bus'

let timer: NodeJS.Timeout | null = null

function SettingForm({ tab }): React.JSX.Element {
  const [form] = Form.useForm()
  Form.useWatch((values) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      setSetting(tab, values)
      timer = null
    }, 100)
  }, form)

  useEffect(() => {
    form.setFieldsValue(getSetting(tab))

    function onSettingsInited(settings: Settings) {
      form.setFieldsValue(settings[tab])
    }

    function onSettingsChanged({ key, data }) {
      if (key !== tab) return
      if (isEqual(form.getFieldsValue(), data)) return
      form.setFieldsValue(data)
    }

    emitter.on(PAGE_EVENT.SETTINGS_INITED, onSettingsInited)
    emitter.on(PAGE_EVENT.SETTING_CHANGED, onSettingsChanged)
    return () => {
      emitter.off(PAGE_EVENT.SETTINGS_INITED, onSettingsInited)
      emitter.off(PAGE_EVENT.SETTING_CHANGED, onSettingsChanged)
    }
  }, [])

  return (
    <JsonSchemaForm
      form={form}
      schema={schemas[tab + 'Schema']}
      className={`setting-form-${tab}`}
    />
  )
}

export default memo(SettingForm)
