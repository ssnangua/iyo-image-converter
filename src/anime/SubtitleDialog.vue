<template>
  <div>
    <el-drawer
      v-model="visible"
      direction="btt"
      custom-class="drawer-panel"
      modal-class="drawer-modal"
      :with-header="false"
      :size="222"
      @opened="onOpened"
      @closed="onClosed"
    >
      <div class="setting-title">
        <span>{{ $t("animeTool.subtitle.title") }}</span>
      </div>
      <el-scrollbar view-style="padding: 20px">
        <el-form label-width="auto" v-if="visible">
          <el-form-item :label="$t('animeTool.subtitle.text')">
            <el-input
              ref="input"
              v-model="data.text"
              @change="onChange"
              @keyup.enter="onWrap"
            >
              <template #append>
                <el-button
                  @click="
                    data.text += '\\n';
                    onChange();
                  "
                  tabindex="-1"
                >
                  <span v-html="$t('animeTool.subtitle.newline')"></span>
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.duration')">
            <el-input-number
              v-model="data.duration"
              :step="1"
              :step-strictly="true"
              :min="1"
              :max="maxDuration"
              controls-position="right"
            />
            <span style="margin-left: 10px">{{ $t("animeTool.frames") }}</span>
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.marginBottom')">
            <el-input-number
              v-model="data.marginBottom"
              :step="1"
              :step-strictly="true"
              :min="0"
              :max="maxMargin - data.fontSize"
              controls-position="right"
              @change="onChange"
            />
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.fontFamily')">
            <FontPicker v-model="data.fontFamily" @change="onChange" />
          </el-form-item>
          <el-form-item label=" ">
            <div>
              <el-button
                :title="$t('animeTool.subtitle.italic')"
                :type="data.bold ? 'primary' : ''"
                @click="
                  data.bold = !data.bold;
                  onChange();
                "
                class="font-btn"
              >
                <i class="iconfont icon-bold"></i>
              </el-button>
              <el-button
                :title="$t('animeTool.subtitle.bold')"
                :type="data.italic ? 'primary' : ''"
                @click="
                  data.italic = !data.italic;
                  onChange();
                "
                class="font-btn"
              >
                <i class="iconfont icon-italic"></i>
              </el-button>
            </div>
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.fontSize')">
            <el-input-number
              v-model="data.fontSize"
              :step="1"
              :step-strictly="true"
              :min="1"
              :max="1000"
              controls-position="right"
              @change="onChange"
            />
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.fontColor')">
            <ColorPicker
              v-model="data.fontColor"
              :predefine="['#000000', '#ffffff']"
              @change="onChange"
            />
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.strokeWidth')">
            <el-input-number
              v-model="data.strokeWidth"
              :step="1"
              :step-strictly="true"
              :min="0"
              :max="1000"
              controls-position="right"
              @change="onChange"
            />
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.strokeColor')">
            <ColorPicker
              v-model="data.strokeColor"
              :predefine="['#000000', '#ffffff']"
              @change="onChange"
            />
          </el-form-item>
          <el-form-item :label="$t('animeTool.subtitle.lineSpacing')">
            <el-input-number
              v-model="data.lineSpacing"
              :step="1"
              :step-strictly="true"
              :min="0"
              :max="maxMargin"
              controls-position="right"
              @change="onChange"
            />
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<script>
import FontPicker from "@/component/FontPicker.vue";
import ColorPicker from "@/component/ColorPicker.vue";

const defaultData = {
  marginBottom: 10,
  fontSize: 24,
  fontFamily: "Arial",
  italic: false,
  bold: false,
  fontColor: "#000000",
  strokeWidth: 0,
  strokeColor: "#ffffff",
  lineSpacing: 2,
  text: "",
  duration: 1,
};

export default {
  name: "SubtitleDialog",
  components: { ColorPicker, FontPicker },

  props: {
    maxDuration: Number,
    maxMargin: Number,
  },

  data() {
    return {
      visible: false,
      data: { ...defaultData },
    };
  },

  methods: {
    show(data) {
      this.data = data || { ...defaultData };
      this.visible = true;
    },
    onWrap() {
      const input = this.$refs.input.$el.querySelector("input");
      const { text } = this.data;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      this.data.text = text.substring(0, start) + "\\n" + text.substring(end);
      this.$nextTick(() => {
        input.selectionStart = input.selectionEnd = start + 2;
      });
    },
    onOpened() {
      this.$refs.input.focus();
    },
    onChange() {
      this.$emit("data-change", this.data);
    },
    onClosed() {
      this.$emit("closed", this.data);
      this.visible = false;
    },
  },
};
</script>
