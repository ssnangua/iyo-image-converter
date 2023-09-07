<template>
  <div class="infobar">
    <div class="info" v-html="tips || info || ''"></div>
    <div class="right-content">
      <span v-if="totalSize.input > 0" class="size-info">
        {{ formatSize(totalSize.input) }} / {{ formatSize(totalSize.output) }}
        <span v-if="totalSize.output !== totalSize.input" class="size-diff">
          /
          <el-icon class="result-icon">
            <Top v-if="totalSize.output > totalSize.input" class="gt" />
            <Bottom v-else class="lt" />
          </el-icon>
          {{ getSizeDiff(totalSize.output) }}
        </span>
      </span>
      <span v-if="progress.total > 0" class="percentage">
        <span>{{ progress.processed }} / {{ progress.total }}</span>
        <span v-if="progress.failed > 0" class="failed-info">
          <el-icon><CircleCloseFilled /></el-icon>
          <span class="failed-count">{{ progress.failed }}</span>
        </span>
      </span>
      <span v-if="showTime" class="elapsed">
        {{ $t("infobar.elapsedTime") }}：{{ time }}
      </span>
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
import { formatTime, humanFileSize } from "@/util/util";
import { Top, Bottom, CircleCloseFilled } from "@element-plus/icons-vue";

let timer = -1;
let timestamp;

export default {
  name: "FooterInfobar",
  components: { Top, Bottom, CircleCloseFilled },
  props: {
    completeNotify: Boolean,
    info: String,
    tips: String,
    progress: Object,
    totalSize: Object,
  },
  data() {
    return {
      showTime: false,
      time: formatTime(0),
    };
  },
  methods: {
    formatSize(size) {
      return humanFileSize(size);
    },
    getSizeDiff() {
      const { input, output } = this.totalSize;
      if (input > 0) {
        const diff = Math.abs(output - input);
        const percentage = Math.round((diff / input) * 100);
        return `${humanFileSize(diff, 2)} (${percentage}%)`;
      }
      return "";
    },

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

<style scoped>
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

.right-content > span {
  padding: 0 10px;
  border-right: 1px solid var(--el-border-color);
}

.size-diff,
.percentage,
.failed-info {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.failed-info {
  margin-left: 5px;
  color: #f56c6c;
}
.failed-count {
  margin-left: 2px;
}
.result-icon {
  margin-right: 2px;
}
.gt {
  color: #f56c6c;
}
.lt {
  color: #67c23a;
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
