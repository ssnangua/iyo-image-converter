<template>
  <div class="styled-text">
    <div
      v-if="innerValue.text.length > 0"
      class="text"
      :style="{
        'font-family': innerValue.fontFamily,
        'font-size': innerValue.fontSize + 'px',
        'line-height': lineHeight,
        color: innerValue.fontColor,
        'font-weight': innerValue.bold ? 'bold' : 'normal',
        'font-style': innerValue.italic ? 'italic' : 'normal',
        '-webkit-text-stroke': textStroke,
      }"
      :data-text="innerValue.text"
      @click="dialogVisible = true"
    >
      {{ innerValue.text }}
    </div>
    <div v-else class="text empty" @click="dialogVisible = true">
      {{ $t("message.empty") }}
    </div>

    <el-dialog
      v-model="dialogVisible"
      :append-to-body="true"
      :align-center="true"
      @close="onDialogClose"
      class="styled-text-dialog"
    >
      <div>
        <el-form label-width="auto">
          <el-form-item :label="$t('styledText.preview')">
            <div
              class="text-preview"
              :style="{
                'font-family': innerValue.fontFamily,
                'font-size': innerValue.fontSize + 'px',
                'line-height': lineHeight,
                color: innerValue.fontColor,
                'font-weight': innerValue.bold ? 'bold' : 'normal',
                'font-style': innerValue.italic ? 'italic' : 'normal',
                '-webkit-text-stroke': textStroke,
              }"
              :data-text="innerValue.text || $t('message.empty')"
            >
              {{ innerValue.text || $t("message.empty") }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('styledText.text')">
            <el-input v-model="innerValue.text"></el-input>
          </el-form-item>
          <el-form-item :label="$t('styledText.fontFamily')">
            <FontPicker v-model="innerValue.fontFamily" />
          </el-form-item>
          <el-form-item label=" ">
            <div>
              <el-button
                :title="$t('styledText.italic')"
                :type="innerValue.bold ? 'primary' : ''"
                @click="innerValue.bold = !innerValue.bold"
                class="font-btn"
              >
                <i class="iconfont icon-bold"></i>
              </el-button>
              <el-button
                :title="$t('styledText.bold')"
                :type="innerValue.italic ? 'primary' : ''"
                @click="innerValue.italic = !innerValue.italic"
                class="font-btn"
              >
                <i class="iconfont icon-italic"></i>
              </el-button>
            </div>
          </el-form-item>
          <el-form-item :label="$t('styledText.fontSize')">
            <el-input-number
              v-model="innerValue.fontSize"
              :step="1"
              :step-strictly="true"
              :min="1"
              :max="1000"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item :label="$t('styledText.fontColor')">
            <ColorPicker
              v-model="innerValue.fontColor"
              :predefine="['#000000', '#ffffff']"
            />
          </el-form-item>
          <el-form-item :label="$t('styledText.strokeWidth')">
            <el-input-number
              v-model="innerValue.strokeWidth"
              :step="1"
              :step-strictly="true"
              :min="0"
              :max="1000"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item :label="$t('styledText.strokeColor')">
            <ColorPicker
              v-model="innerValue.strokeColor"
              :predefine="['#000000', '#ffffff']"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span>
          <el-button @click="onCancel">
            {{ $t("message.cancel") }}
          </el-button>
          <el-button
            type="primary"
            style="margin-left: 10px"
            @click="onConfirm"
          >
            {{ $t("message.confirm") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import FontPicker from "@/component/FontPicker.vue";
import ColorPicker from "@/component/ColorPicker.vue";

export default {
  name: "StyledText",
  components: { ColorPicker, FontPicker },
  props: ["modelValue"],
  emits: ["update:modelValue", "change"],
  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        Object.assign(this.innerValue, value);
      },
    },
  },
  computed: {
    lineHeight() {
      return Math.max(this.innerValue.fontSize, 32) + 10 + "px";
    },
    textStroke() {
      const { strokeWidth, strokeColor } = this.innerValue;
      return strokeWidth && strokeColor
        ? `${strokeWidth}px ${strokeColor}`
        : "";
    },
  },
  data() {
    return {
      dialogVisible: false,
      innerValue: {
        text: "",
        fontFamily: "Arial",
        italic: false,
        bold: false,
        fontSize: 12,
        fontColor: "#FF0000",
        strokeWidth: 0,
        strokeColor: "#000000",
      },
      isConfirm: false,
    };
  },
  methods: {
    onConfirm() {
      this.isConfirm = true;
      this.dialogVisible = false;
    },
    onCancel() {
      this.dialogVisible = false;
    },
    onDialogClose() {
      if (this.isConfirm) {
        Object.assign(this.modelValue, this.innerValue);
        this.$emit("update:modelValue", this.innerValue);
        this.$emit("change", this.innerValue);
        this.isConfirm = false;
      } else {
        Object.assign(this.innerValue, this.modelValue);
      }
    },
  },
};
</script>

<style>
.styled-text-dialog .el-dialog__body {
  padding-bottom: 0;
}
.styled-text-dialog .el-form-item__content {
  overflow: hidden;
}
</style>

<style scoped>
.styled-text {
  display: flex;
}

.text {
  display: inline-block;
  padding: 0 10px;
  min-width: 50px;
  /* text-align: center; */
  cursor: pointer;
  border: 1.5px dashed rgba(0, 0, 0, 0);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}
.text:hover {
  border-color: #409eff;
}
.text.empty {
  font-style: italic;
  opacity: 0.5;
}

[data-text]::before {
  content: attr(data-text);
  position: absolute;
  -webkit-text-stroke: 0;
}
.text-preview {
  width: 100%;
  padding: 0 10px;
  /* text-align: center; */
  /* border: 1.5px solid #dcdfe6; */
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}
.font-btn {
  width: 32px;
}
.font-btn .iconfont {
  margin-right: 0;
}
.font-btn + .font-btn {
  margin-left: 12px;
}
</style>
