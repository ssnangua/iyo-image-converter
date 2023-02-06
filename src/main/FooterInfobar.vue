<template>
  <div class="infobar">
    <div class="info" v-html="tips || info || ''"></div>
    <div>
      <span v-if="progress.total > 0" class="percentage"
        >{{ progress.processed }} / {{ progress.total }}</span
      >
      <span v-if="showTime" class="elapsed"
        >{{ $t("infobar.elapsedTime") }}：{{ time }}</span
      >
      <el-checkbox
        :label="$t('infobar.completeNotify')"
        :model-value="completeNotify"
        @change="$emit('complete-notify-changed', $event)"
        class="complete-notify"
      />
    </div>
  </div>
</template>

<script>
import { formatTime } from "@/util/util";
let timer = -1;
let timestamp;

export default {
  name: "FooterInfobar",
  props: {
    completeNotify: Boolean,
    info: String,
    tips: String,
    progress: Object,
  },
  data() {
    return {
      showTime: false,
      time: formatTime(0),
    };
  },
  methods: {
    startTimer() {
      this.stopTimer();
      timestamp = Date.now();
      this.time = formatTime(0);
      this.showTime = true;
      timer = setInterval(() => this.updateTime(), 1000);
    },

    stopTimer() {
      this.updateTime();
      clearInterval(timer);
    },

    updateTime() {
      const elapsed = ((Date.now() - timestamp) / 1000) << 0;
      this.time = formatTime(elapsed);
    },
  },
};
</script>

<style>
.infobar {
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
  overflow: hidden;
  font-size: var(--el-font-size-base);
}

.infobar > div {
  display: flex;
  line-height: 32px;
}

.output {
  border-radius: 0;
}

.output > span {
  font-size: 12px;
}

.info {
  flex: auto;
  padding: 0 10px;
}

.percentage {
  margin-right: 10px;
}

.elapsed {
  margin-right: 10px;
}

.el-checkbox {
  cursor: default;
}

.el-checkbox__input.is-checked + .el-checkbox__label {
  --el-checkbox-checked-text-color: var(--el-checkbox-text-color);
}

.complete-notify {
  padding: 0 10px;
}

.complete-notify:hover {
  background-color: #dcdfe6;
}
</style>
