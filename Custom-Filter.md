# Custom Filter

The filter files are in the `root/filters/` directory, and you can write your own filters.

```js
module.export  = {
    // languages
    en: {
        label: "Filter Group",
        fliter1: {
            label: "Filter1"
            option1: "Option1",
        },
    },
    'zh-CN': {
        label: "滤镜组",
        fliter1: {
            label: "滤镜1"
            option1: "选项1",
        },
    },
    // filters
    filters: {
        fliter1: {
            // filter options
            options: [
                {
                    key: "option1",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0,
                    max: 100,
                },
            ],
            // filter handler
            handler(imageData, options) {
                const { data, width, height } = imageData;
                const { option1 } = options;
                // processing pixels
                const n = data.length;
                for (let i = 0; i < n; i += 4) {
                    data[i + 0] = data[i + 0]; // r
                    data[i + 1] = data[i + 1]; // g
                    data[i + 2] = data[i + 2]; // b
                    data[i + 3] = data[i + 3]; // alpha
                }
                // returns the processed pixels
                return data;
            },
        },
    }
}
```

### filter option

- `options` `{Object[]}`
    - `key` `String`
    - `type` `String`
    - `default` `*`

#### option types

```js
// number
{
    key: "",
    type: "number",
    default: 0,
    step: 1,
    min: 0,
    max: 100,
}

// boolean
{
    key: "",
    type: "boolean",
    default: true,
},

// select
{
    key: "",
    type: "select",
    default: "value1",
    options: [
        {
            labelKey: "option1",
            value: "value1",
        },
    ],
}
```

### filter handler

- `handler(imageData, options)` `Function`
    - `imageData` `Object`
        - `data` `Uint8ClampedArray` - image pixels (RGBA)
        - `width` `Number` - image width
        - `height` `Number` - image height
    - `options` - `Object` options value

Returns the processed pixels
