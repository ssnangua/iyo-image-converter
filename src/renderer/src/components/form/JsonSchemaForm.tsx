import { Fragment, memo, type JSX } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Slider,
  Switch,
  Radio,
  Divider,
  Checkbox,
  type SliderSingleProps,
  type FormProps,
  type FormInstance
} from 'antd'
import Path from './Path'
import { type Schema } from '@settings/Schema'

function getComponent(name: string, field: Schema, form?: FormInstance) {
  const FormItem = (component: JSX.Element) => (
    <Form.Item noStyle name={name}>
      {component}
    </Form.Item>
  )

  let props: { [prop: string]: any } = {}
  if (field.dependencies && form) {
    const data = {}
    for (const name of field.dependencies.fields) {
      data[name] = form.getFieldValue(name)
    }
    const { value, ...rest } = field.dependencies.handler(data)
    if (value !== undefined) form.setFieldValue(name, value)
    props = rest
  }

  if (field.enum) {
    const options = field.enum.map((value, index) => {
      return {
        value,
        label: <span>{field.enumLabels?.[index] || value}</span>
      }
    })
    if (field.type === 'array') {
      return FormItem(<Checkbox.Group options={options} {...props} />)
    } else {
      if (field.component === 'Select') {
        return FormItem(<Select options={options} {...props} />)
      } else {
        return FormItem(<Radio.Group options={options} {...props} />)
      }
    }
  }

  if (field.type === 'string') {
    if (field.component === 'Path') {
      return FormItem(<Path {...props} />)
    } else {
      return FormItem(<Input {...props} />)
    }
  }

  if (field.type === 'boolean') {
    return FormItem(<Switch {...props} />)
  }

  if (field.type === 'number') {
    const { minimum: min, maximum: max, step, default: def } = field
    const limits = { min, max, step }
    if (field.component === 'Slider') {
      const marks: SliderSingleProps['marks'] = {
        [String(min)]: min,
        [String(max)]: max,
        [String(def)]: {
          style: { color: '#E6A23C' },
          label: <strong>{def}</strong>
        }
      }
      return FormItem(<Slider marks={marks} {...limits} {...props} />)
    } else {
      return FormItem(<InputNumber {...limits} {...props} />)
    }
  }

  if (field.type === 'array') {
    // TODO: 数组表单
  }

  if (field.type === 'object') {
    // TODO: 嵌套表单
  }

  return FormItem(<div {...props}>Not supported</div>)
}

export interface JSFormProps extends FormProps {
  schema: Schema
}

const JsonSchemaForm: React.FC<JSFormProps> = ({ schema, ...otherProps }) => {
  if (Object.keys(schema.properties!).length === 0) {
    return <div {...(otherProps as any)}>没有选项</div>
  }

  return (
    <Form autoComplete="off" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} {...otherProps}>
      {/* {Math.random()} */}
      {Object.entries(schema.properties!).map(([name, field]) => {
        const shouldUpdate = field.dependencies
          ? (prevValues: any, curValues: any) => {
              for (let name of field.dependencies!.fields) {
                if (prevValues[name] !== curValues[name]) {
                  return true
                }
              }
              return false
            }
          : undefined
        return (
          <Fragment key={name}>
            {field.divider ? <Divider>{field.divider}</Divider> : null}
            <Form.Item label={field.title} help={field.description} shouldUpdate={shouldUpdate}>
              {field.dependencies
                ? (form) => getComponent(name, field, form)
                : getComponent(name, field)}
            </Form.Item>
          </Fragment>
        )
      })}
    </Form>
  )
}

export default memo(JsonSchemaForm)
