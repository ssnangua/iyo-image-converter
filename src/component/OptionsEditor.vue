<template>
  <el-form v-if="editorOptions" label-width="auto" class="editor">
    <template v-for="item in editorOptions">
      <template v-if="!isTask || !item.hideIfTask">
        <!-- divider -->
        <el-divider
          v-if="item.type === 'divider'"
          content-position="left"
          :key="item.key + '-divider'"
          >{{ $t(`${config.type}.${item.key}`) }}</el-divider
        >

        <!-- hide -->
        <div
          v-else-if="item.hideWhen && item.hideWhen(value)"
          :key="item.key + '-hide'"
        ></div>

        <!-- normal -->
        <el-form-item
          v-else-if="!item.lockWhen || !item.lockWhen(value)"
          :label="$t(`${config.type}.${item.key}`)"
          :key="item.key + '-normal'"
        >
          <div style="width: 100%">
            <!-- editor -->
            <FitPicker
              v-if="item.type === 'fitMode'"
              v-model="value[item.key]"
              :forceSize="item.forceSize"
            />
            <ColorPicker
              v-else-if="item.type === 'color'"
              v-model="value[item.key]"
              :showAlpha="item.showAlpha"
              :predefine="item.predefine"
            />
            <FilePicker
              v-else-if="item.type === 'file'"
              v-model="value[item.key]"
              :placeholder="$t(`${config.type}.${item.placeholder}`)"
              :rule="item.rule"
              :handleOpen="item.handleOpen"
              :handleDrop="item.handleDrop"
              :options="item.dialog"
            />
            <PosPicker
              v-else-if="item.type === 'pos'"
              v-model="value[item.key]"
            />
            <StyledText
              v-else-if="item.type === 'styled-text'"
              :model-value="value[item.key]"
            />
            <el-select
              v-else-if="item.type === 'select'"
              v-model="value[item.key]"
              placeholder=" "
            >
              <el-option
                v-for="option in item.options"
                :key="option.value"
                :label="option.label || $t(option.labelKey)"
                :value="option.value"
                :title="option.desc || (option.descKey && $t(option.descKey))"
              />
            </el-select>
            <el-radio-group
              v-else-if="item.type === 'radio'"
              v-model="value[item.key]"
            >
              <el-radio
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                :title="option.desc || (option.descKey && $t(option.descKey))"
                >{{ option.label || $t(option.labelKey) }}</el-radio
              >
            </el-radio-group>
            <el-checkbox-group
              v-else-if="item.type === 'checkbox'"
              v-model="value[item.key]"
            >
              <el-checkbox
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                :title="option.desc || (option.descKey && $t(option.descKey))"
                >{{ option.label || $t(option.labelKey) }}</el-checkbox
              >
            </el-checkbox-group>
            <el-input
              v-else-if="item.type === 'string'"
              v-model="value[item.key]"
              clearable
              @clear="value[item.key] = ''"
            />
            <el-switch
              v-else-if="item.type === 'boolean'"
              v-model="value[item.key]"
            />
            <template v-else-if="item.type === 'number'">
              <el-input-number
                v-if="item.input"
                v-model="value[item.key]"
                :step="item.step"
                :step-strictly="!!item.step"
                :min="item.min"
                :max="item.max"
                controls-position="right"
                style="width: 100px"
              />
              <el-slider
                v-else
                v-model="value[item.key]"
                :step="item.step"
                :min="item.min"
                :max="item.max"
                :marks="getMarks(item)"
              />
            </template>
            <!-- description -->
            <div
              v-if="$t(`${config.type}.${item.key}_desc`)"
              class="description"
              v-html="$t(`${config.type}.${item.key}_desc`)"
            ></div>
          </div>
        </el-form-item>

        <!-- lock -->
        <el-form-item
          v-else-if="!item.hideWhenLock"
          :label="$t(`${config.type}.${item.key}`)"
          class="disabled"
          :key="item.key + '-lock'"
        >
          <div style="width: 100%">
            <!-- editor -->
            <FitPicker
              v-if="item.type === 'fitMode'"
              :model-value="item.lockValue || value[item.key]"
            />
            <ColorPicker
              v-else-if="item.type === 'color'"
              :model-value="item.lockValue || value[item.key]"
              :showAlpha="item.showAlpha"
              :predefine="item.predefine"
            />
            <FilePicker
              v-else-if="item.type === 'file'"
              :model-value="item.lockValue || value[item.key]"
              :placeholder="$t(`${config.type}.${item.placeholder}`)"
              :options="item.dialog"
            />
            <PosPicker
              v-else-if="item.type === 'pos'"
              :model-value="item.lockValue || value[item.key]"
            />
            <StyledText
              v-else-if="item.type === 'styled-text'"
              :model-value="item.lockValue || value[item.key]"
            />
            <el-select
              v-else-if="item.type === 'select'"
              :model-value="item.lockValue || value[item.key]"
              placeholder=" "
            >
            </el-select>
            <el-radio-group
              v-else-if="item.type === 'radio'"
              :model-value="item.lockValue || value[item.key]"
            >
              <el-radio
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                >{{ option.label || $t(option.labelKey) }}</el-radio
              >
            </el-radio-group>
            <el-checkbox-group
              v-else-if="item.type === 'checkbox'"
              :model-value="item.lockValue || value[item.key]"
            >
              <el-checkbox
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                >{{ option.label || $t(option.labelKey) }}</el-checkbox
              >
            </el-checkbox-group>
            <el-input
              v-else-if="item.type === 'string'"
              :model-value="item.lockValue || value[item.key]"
            />
            <el-switch
              v-else-if="item.type === 'boolean'"
              :model-value="item.lockValue || value[item.key]"
            />
            <template v-else-if="item.type === 'number'">
              <el-input-number
                v-if="item.input"
                :model-value="item.lockValue || value[item.key]"
                :step="item.step"
                :step-strictly="!!item.step"
                :min="item.min"
                :max="item.max"
                controls-position="right"
                style="width: 100px"
              />
              <el-slider
                v-else
                :model-value="item.lockValue || value[item.key]"
                :step="item.step"
                :min="item.min"
                :max="item.max"
                :marks="getMarks(item)"
              />
            </template>
            <!-- description -->
            <div
              v-if="$t(`${config.type}.${item.key}_desc`)"
              class="description"
              v-html="$t(`${config.type}.${item.key}_desc`)"
            ></div>
          </div>
        </el-form-item>
      </template>
    </template>
  </el-form>
  <div v-else class="no-options">{{ $t("setting.noOptions") }}</div>
</template>

<script>
import clone from "clone";
import FilePicker from "@/component/FilePicker.vue";
import FitPicker from "@/component/FitPicker.vue";
import ColorPicker from "@/component/ColorPicker.vue";
import PosPicker from "@/component/PosPicker.vue";
import StyledText from "@/component/StyledText.vue";

export default {
  name: "OptionsEditor",
  components: { FilePicker, FitPicker, ColorPicker, PosPicker, StyledText },
  props: {
    config: Object,
    setting: Object,
    unobtrusive: {
      type: Boolean,
      default: true,
    },
    isTask: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    editorOptions() {
      return this.config?.editor?.options;
    },
  },
  data() {
    return {
      value: {},
    };
  },
  watch: {
    setting: {
      immediate: true,
      handler(setting) {
        if (!setting) return;
        const { unobtrusive } = this;
        if (this.config?.editor?.setValue) {
          this.value = this.config.editor.setValue(
            unobtrusive ? clone(setting) : setting
          );
        } else if (unobtrusive) {
          const value = {};
          if (this.editorOptions) {
            this.editorOptions.forEach((opt) => {
              if (opt.type === "divider") return;
              value[opt.key] = setting[opt.key];
            });
          }
          this.value = clone(value);
        } else {
          this.value = setting;
        }
      },
    },
    // value: {
    //   deep: true,
    //   handler(value) {
    //     this.$emit("change", this.config, value);
    //   },
    // },
  },
  methods: {
    getMarks(item) {
      const { min, max, marks } = item;
      const enabled = !item.lockBy || this.value[item.lockBy] !== item.lockWhen;
      const value = enabled ? this.value[item.key] : item.lockValue;
      return {
        [min]: min + "",
        [max]: max + "",
        [item.default]: {
          style: { color: enabled ? "#E6A23C" : "#909399" },
          label: item.default + "",
        },
        [value]: {
          style: {
            color: enabled ? "#409EFF" : "#909399",
            background: "#FFFFFF",
            zIndex: 1000,
            padding: "0 4px",
          },
          label: value + "",
        },
        ...marks,
      };
    },
    getValue() {
      if (this.config?.editor?.getValue) {
        return this.config.editor.getValue(this.value);
      } else {
        return this.value;
      }
    },
  },
};
</script>

<style>
.editor .el-form .el-form-item:last-child {
  margin-bottom: 0;
  padding-bottom: 10px;
}

.editor .el-divider {
  margin-bottom: 40px;
}
.editor .el-form-item + .el-divider {
  margin-top: 40px;
}

.editor .form-item-label {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor .el-slider {
  margin-left: 10px;
  margin-bottom: 10px;
  width: calc(100% - 20px);
}
.editor .el-slider__marks .el-slider__marks-text {
  white-space: nowrap;
}
.editor .el-slider__button-wrapper {
  z-index: 1001;
}

.editor .folder .el-input-group__append:hover {
  --el-input-border-color: #c0c4cc;
  border-left: 1px solid #c0c4cc;
}

.editor .description {
  color: #909399;
  line-height: 24px;
  word-break: break-word;
}
.editor .el-slider + .description {
  margin-top: 24px;
}

.editor .disabled {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(1);
}
.editor .no-options {
  color: #909399;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
