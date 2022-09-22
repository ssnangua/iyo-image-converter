<template>
  <el-scrollbar
    ref="scrollbar"
    class="icon-list"
    @scroll="scrollLeft = $event.scrollLeft"
    @mousewheel="setScrollLeft"
  >
    <div
      v-if="iconList.length > 0"
      class="icon-wrapper"
      @contextmenu="$emit('list-contextmenu', $event)"
    >
      <div
        v-for="(icon, index) in iconList"
        :key="index"
        @contextmenu="
          $emit('item-contextmenu', $event, index);
          $event.stopPropagation();
          $event.preventDefault();
        "
        class="icon-item"
        :class="{ selected: selectedIndex === index }"
        @click.stop="$emit('item-click', index)"
      >
        <img :src="icon.base64" class="icon-img" />
        <div class="icon-size">{{ icon.width + " × " + icon.height }}</div>
      </div>
    </div>
    <div v-else-if="emptyText" class="nodata">{{ emptyText }}</div>
  </el-scrollbar>
</template>

<script>
export default {
  name: "IconList",

  props: {
    iconList: {
      type: Array,
      default: () => [],
    },
    selectedIndex: {
      type: Number,
      default: -1,
    },
    emptyText: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      scrollLeft: 0,
    };
  },

  methods: {
    setScrollLeft($event) {
      if (!$event.deltaX) {
        const list = this.$refs.scrollbar;
        list.setScrollLeft(this.scrollLeft + $event.deltaY);
      }
    },
  },
};
</script>

<style>
.icon-list {
  width: calc(100vw - 60px);
  height: 92px;
  border-radius: 4px;
  outline: 1px solid #dcdfe6;
  padding: 10px;
  display: flex;
  flex-shrink: 0;
}
.icon-list .el-scrollbar__wrap {
  width: 100%;
}
.icon-list .el-scrollbar__bar.is-horizontal {
  padding: 0 10px;
}
.icon-wrapper {
  white-space: nowrap;
}
.icon-item {
  display: inline-block;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
  transition: 0.1s;
}
.icon-item:hover,
.icon-item.selected {
  background-color: #dcdfe6;
}
.icon-item + .icon-item {
  margin-left: 10px;
}
.icon-img {
  max-width: 64px;
  max-height: 64px;
}
.icon-size {
  text-align: center;
  font-size: 12px;
  color: var(--text-color);
  white-space: nowrap;
}

.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #909399;
}
</style>
