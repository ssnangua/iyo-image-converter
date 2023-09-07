<template>
  <el-form label-width="auto" class="modifier-editor">
    <!-- crop start -->
    <el-divider content-position="left">
      <el-checkbox v-model="value.enableCrop" :label="$t('modifier.crop')" />
    </el-divider>

    <el-form-item v-if="value.enableCrop" label=" ">
      <el-radio-group v-model="value.cropType">
        <el-radio label="trim">{{ $t("modifier.trim") }}</el-radio>
        <el-radio label="custom">{{ $t("modifier.custom") }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- <el-form-item
      v-if="value.enableCrop && value.cropType === 'trim'"
      :label="$t('modifier.trimColor')"
    >
      <div style="width: 100%">
        <ColorPicker
          v-model="value.trimColor"
          :predefine="['#000000', '#ffffff']"
        />
        <div class="description" v-html="$t('modifier.trimColor_desc')"></div>
      </div>
    </el-form-item> -->
    <el-form-item
      v-if="value.enableCrop && value.cropType === 'trim'"
      :label="$t('modifier.trimThreshold')"
    >
      <div style="width: 100%">
        <el-input-number
          v-model="value.trimThreshold"
          controls-position="right"
          :step="1"
          :step-strictly="true"
          :min="0"
          :max="255"
          style="width: 100px"
        />
        <div
          class="description"
          v-html="$t('modifier.trimThreshold_desc')"
        ></div>
      </div>
    </el-form-item>

    <el-form-item
      v-if="value.enableCrop && value.cropType === 'custom'"
      :label="$t('rectInput.bound')"
    >
      <RectInput
        v-model="crop"
        :width="value.cropWidth"
        :height="value.cropHeight"
        @change="onCropChange"
      />
    </el-form-item>

    <el-form-item
      v-if="value.enableCrop && value.cropType === 'custom'"
      :label="$t('rectInput.size')"
    >
      <el-input-number
        v-model="value.cropWidth"
        :step="1"
        :step-strictly="true"
        :min="0"
        :max="100000"
        :disabled="!!(crop.left && crop.right)"
        controls-position="right"
        style="width: 100px"
      />
      <span style="margin: 0 10px">×</span>
      <el-input-number
        v-model="value.cropHeight"
        :step="1"
        :step-strictly="true"
        :min="0"
        :max="100000"
        :disabled="!!(crop.top && crop.bottom)"
        controls-position="right"
        style="width: 100px"
      />
    </el-form-item>

    <!-- rotate start -->
    <el-divider content-position="left">
      <el-checkbox
        v-model="value.enableRotate"
        :label="$t('modifier.rotate')"
      />
    </el-divider>

    <el-form-item v-if="value.enableRotate" :label="$t('modifier.angle')">
      <el-input-number
        v-model="value.angle"
        :step="1"
        :step-strictly="true"
        :min="-180"
        :max="180"
        controls-position="right"
        style="width: 100px"
      />
      <el-button
        :icon="MoreFilled"
        @click="onAnglePreset"
        style="min-width: 20px; padding: 8px; margin: 0 10px"
      />
    </el-form-item>

    <el-form-item v-if="value.enableRotate" :label="$t('modifier.flop')">
      <div style="width: 100%">
        <el-switch v-model="value.flop" />
        <div class="description" v-html="$t('modifier.flop_desc')"></div>
      </div>
    </el-form-item>

    <el-form-item v-if="value.enableRotate" :label="$t('modifier.flip')">
      <div style="width: 100%">
        <el-switch v-model="value.flip" />
        <div class="description" v-html="$t('modifier.flip_desc')"></div>
      </div>
    </el-form-item>

    <el-form-item v-if="value.enableRotate" :label="$t('modifier.background')">
      <ColorPicker
        v-model="value.background"
        :predefine="['#000000', '#ffffff']"
      />
    </el-form-item>
    <!-- rotate end -->

    <!-- resize start -->
    <el-divider content-position="left">
      <el-checkbox
        v-model="value.enableResize"
        :label="$t('modifier.resize')"
      />
    </el-divider>

    <el-form-item v-if="value.enableResize" label=" ">
      <el-radio-group v-model="value.resizeType">
        <el-radio label="pixels">{{ $t("modifier.pixels") }}</el-radio>
        <el-radio label="percent">{{ $t("modifier.percent") }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="value.enableResize" :label="$t('modifier.size')">
      <div style="white-space: nowrap">
        <span>
          <el-input-number
            ref="width"
            v-model="value.width"
            :step="1"
            :step-strictly="true"
            :min="0"
            :max="100000"
            controls-position="right"
            style="width: 100px"
          />
          <span v-if="value.resizeType === 'percent'" style="margin-left: 4px"
            >%</span
          >
        </span>
        <span style="margin: 0 10px">×</span>
        <span>
          <el-input-number
            v-model="value.height"
            controls-position="right"
            :step="1"
            :step-strictly="true"
            :min="0"
            :max="100000"
            style="width: 100px"
          />
          <span v-if="value.resizeType === 'percent'" style="margin-left: 4px"
            >%</span
          >
        </span>
        <el-button
          :icon="MoreFilled"
          @click="onSizePreset"
          style="min-width: 20px; padding: 8px; margin: 0 10px"
        />
      </div>
    </el-form-item>

    <el-form-item v-if="value.enableResize" :label="$t('modifier.fit')">
      <div style="width: 100%">
        <FitPicker v-model="value.fit" />
      </div>
    </el-form-item>

    <el-form-item v-if="value.enableResize" :label="$t('modifier.kernel')">
      <el-select v-model="value.kernel">
        <el-option
          v-for="option in kernelOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-if="value.enableResize" :label="$t('modifier.background')">
      <ColorPicker
        v-model="value.background"
        :predefine="['#000000', '#ffffff']"
      />
    </el-form-item>
    <!-- resize end -->

    <!-- density start -->
    <el-divider content-position="left">
      <el-checkbox
        v-model="value.forceDensity"
        :label="$t('modifier.forceDensity')"
      />
    </el-divider>

    <el-form-item v-if="value.forceDensity" :label="$t('modifier.density')">
      <div style="width: 100%">
        <el-input-number
          v-model="value.density"
          controls-position="right"
          :step="1"
          :step-strictly="true"
          :min="0"
          :max="100000"
          style="width: 100px"
        />
        <div class="description" v-html="$t('modifier.density_desc')"></div>
      </div>
    </el-form-item>
    <!-- density end -->
  </el-form>
</template>

<script>
import { shallowRef } from "vue";
import { MoreFilled } from "@element-plus/icons-vue";
import clone from "clone";
import FitPicker from "@/component/FitPicker.vue";
import ColorPicker from "@/component/ColorPicker.vue";
import RectInput from "@/component/RectInput.vue";
import { pixelsMenu, percentMenu, anglesMenu } from "./contextmenu";

export default {
  name: "ModifierEditor",
  components: { FitPicker, ColorPicker, RectInput },
  props: {
    setting: Object,
  },
  data() {
    return {
      MoreFilled: shallowRef(MoreFilled),
      kernelOptions: [
        {
          label: "Nearest",
          value: "nearest",
        },
        {
          label: "Cubic",
          value: "cubic",
        },
        {
          label: "Mitchell",
          value: "mitchell",
        },
        {
          label: "Lanczos2",
          value: "lanczos2",
        },
        {
          label: "Lanczos3",
          value: "lanczos3",
        },
      ],
      value: {},
      crop: {},
    };
  },
  computed: {
    isPercent() {
      return this.value.resizeType === "percent";
    },
  },
  watch: {
    setting: {
      immediate: true,
      handler(setting) {
        this.value = clone(setting);
        this.crop = {
          top: setting.cropTop,
          right: setting.cropRight,
          bottom: setting.cropBottom,
          left: setting.cropLeft,
        };
      },
    },
    "value.resizeType"(type) {
      if (type === "pixels") {
        this.value.width = 0;
        this.value.height = 0;
      } else {
        this.value.width = 100;
        this.value.height = 100;
      }
      this.$refs.width.focus();
    },
    "value.aspectRatio"(aspectRatio) {
      if (aspectRatio && this.isPercent) {
        this.value.height = this.value.width;
      }
    },
    "value.width"(width) {
      if (this.value.aspectRatio && this.isPercent) {
        this.value.height = width;
      }
    },
    "value.height"(height) {
      if (this.value.aspectRatio && this.isPercent) {
        this.value.width = height;
      }
    },
  },
  methods: {
    onSizePreset($event) {
      const menu =
        this.value.resizeType === "pixels" ? pixelsMenu : percentMenu;
      menu.popup($event, (item) => {
        this.value.width = item.value[0];
        this.value.height = item.value[1];
      });
    },
    onAnglePreset($event) {
      anglesMenu.popup($event, (item) => {
        this.value.angle = item.value;
      });
    },
    getValue() {
      return this.value;
    },
    onCropChange() {
      const { top, right, bottom, left } = this.crop;
      Object.assign(this.value, {
        cropTop: top,
        cropRight: right,
        cropBottom: bottom,
        cropLeft: left,
      });
    },
  },
};
</script>

<style>
.modifier-editor .el-divider {
  margin-bottom: 30px;
}
.modifier-editor .el-divider + .el-divider {
  margin-top: 40px;
}
.modifier-editor .el-form-item + .el-divider {
  margin-top: 40px;
}
.modifier-editor .el-form-item:last-child {
  margin-bottom: 0;
  padding-bottom: 10px;
}

.form-item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  color: #909399;
  line-height: 24px;
  word-break: break-word;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(1);
}
</style>
