export interface Schema {
  divider?: string
  name?: string
  title?: string
  description?: string
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  default?: any
  component?: string
  step?: number
  minimum?: number
  maximum?: number
  properties?: {
    [name: string]: Schema
  }
  enum?: any[]
  enumLabels?: any[]
  dependencies?: {
    fields: string[]
    handler: (data: { [name: string]: any }) => { [prop: string]: any }
  }
}

export function getSchemaDefaultValue(schema: Schema): any {
  const value: any = {}
  for (const key in schema.properties) {
    const prop = schema.properties[key]
    switch (prop.type) {
      case 'string':
        value[key] = prop.default ?? ''
        break
      case 'number':
        value[key] = prop.default ?? prop.minimum ?? 0
        break
      case 'boolean':
        value[key] = prop.default ?? false
        break
      case 'array':
        value[key] = prop.default ?? []
        break
      case 'object':
        value[key] = getSchemaDefaultValue(prop)
        break
      default:
        value[key] = prop.default ?? null
        break
    }
  }
  return value
}
