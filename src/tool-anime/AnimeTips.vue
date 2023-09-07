<template>
  <el-dialog :title="$t('editor.tips.title')" width="80%" class="tips-dialog">
    <p>
      <span class="keyboard">Ctrl</span> + <span class="keyboard">O</span>：{{
        $t("animeTool.importImages")
      }}
    </p>
    <p>
      (<span class="keyboard">Ctrl</span> +)
      <span class="keyboard square">←</span> /
      <span class="keyboard square">→</span>：{{
        $t("animeTool.selectFirstFrame") +
        " / " +
        $t("animeTool.selectPrevFrame") +
        " / " +
        $t("animeTool.selectNextFrame") +
        " / " +
        $t("animeTool.selectLastFrame")
      }}
    </p>
    <p>
      <span class="keyboard"><i class="iconfont icon-space"></i></span>：{{
        $t("animeTool.play") + " / " + $t("animeTool.pause")
      }}
    </p>
    <p><span class="keyboard">Del</span>：{{ $t("animeTool.deleteFrames") }}</p>
    <el-divider content-position="left">{{
      $t("animeTool.tips.canvas")
    }}</el-divider>
    <p>
      <i class="iconfont icon-mouse-wheel"></i>：{{
        $t("animeTool.tips.zoomCanvas")
      }}
    </p>
    <p>
      <i class="iconfont icon-mouse-left"></i>：{{
        $t("animeTool.tips.moveCanvas")
      }}
    </p>
    <el-divider content-position="left">{{
      $t("animeTool.tips.frameList")
    }}</el-divider>
    <p>
      <i class="iconfont icon-mouse-right"></i>：{{
        $t("animeTool.tips.rightClick")
      }}
      <b>{{ $t("animeTool.tips.frame") }}</b>
      {{ $t("animeTool.tips.moreOperations") }}
    </p>
    <p>
      <i class="iconfont icon-mouse-left"></i>：<span
        v-html="$t('animeTool.tips.frameMove')"
      ></span>
    </p>
    <p>
      <span v-html="$t('animeTool.tips.frameDelay')"></span>
    </p>
    <p>
      <span v-html="$t('animeTool.tips.frameSubtitle')"></span>
    </p>
    <el-divider content-position="left">{{
      $t("animeTool.tips.toolbar")
    }}</el-divider>
    <p>
      <i class="iconfont icon-mouse-right"></i>：{{
        $t("animeTool.tips.rightClick")
      }}
      <span class="icon-btn" style="pointer-events: none; padding: 0">
        <i class="iconfont icon-f-insert"></i>
      </span>
      {{ $t("animeTool.tips.moreOperations") }}
    </p>
    <p>
      <i class="iconfont icon-mouse-right"></i>：{{
        $t("animeTool.tips.rightClick")
      }}
      <span class="icon-btn" style="pointer-events: none; padding: 0">
        <i class="iconfont icon-f-delete"></i>
      </span>
      {{ $t("animeTool.tips.moreOperations") }}
    </p>
  </el-dialog>
</template>

<script>
export default {
  name: "AnimeTips",
};
</script>

<style>
.tips {
  font-size: 12px;
  margin-right: 20px;
}
.tips-dialog {
  max-width: 600px;
}
.tips-dialog .el-dialog__body {
  padding-top: 0;
}

.keyboard {
  display: inline-block;
  border: 1px solid #cdd0d6;
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 4px;
}
.keyboard.square {
  width: 16px;
  padding: 2px;
  text-align: center;
}
.keyboard + .keyboard {
  margin-left: 2px;
}
</style>
