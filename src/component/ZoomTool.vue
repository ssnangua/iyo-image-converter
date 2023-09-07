<template>
  <div class="zoom-tool">
    <span
      class="icon-btn"
      @click="$emit('zoom', 'zoom-in')"
      :title="$t('zoomTool.zoomIn')"
      ><i class="iconfont icon-zoom-in"></i
    ></span>
    <span
      class="icon-btn"
      @click="$emit('zoom', 'zoom-out')"
      :title="$t('zoomTool.zoomOut')"
      ><i class="iconfont icon-zoom-out"></i
    ></span>
    <span
      class="icon-btn"
      @click="$emit('zoom', 'zoom-1')"
      :title="$t('zoomTool.zoom1')"
      ><i class="iconfont icon-zoom-1"></i
    ></span>
    <span
      class="icon-btn"
      @click="$emit('zoom', 'zoom-fit')"
      :title="$t('zoomTool.zoomFit')"
      ><i class="iconfont icon-zoom-fit"></i
    ></span>
  </div>
</template>

<script>
export default {
  name: "ZoomTool",
};
</script>

<style>
.zoom-tool {
  z-index: 100;
  padding: 8px 4px;
  opacity: 0.3;
  transition: 0.1s;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  color: #ffffff;
}
.zoom-tool:hover {
  opacity: 1;
}
.zoom-tool .icon-btn {
  padding: 0 10px;
}
.zoom-tool .icon-btn:hover {
  color: #f56c6c;
}
</style>
