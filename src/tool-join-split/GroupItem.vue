<template>
  <div
    class="group-box"
    :class="[
      'join-' + group.join.direction,
      'split-' + group.split.direction,
      group.join.reverse ? 'reverse' : '',
      group.selected ? 'group-selected' : '',
      group.locked ? 'group-locked' : '',
    ]"
    :style="{
      width: width + 'px',
      'max-height': height + 'px',
    }"
    :data-group-index="group.index"
    @mousedown="$emit('group-mousedown', $event)"
    @click="onGroupClick"
  >
    <div
      class="group-content"
      :style="{
        background:
          group.join.background || (setting.format === 'JPEG' ? '#FFFFFF' : ''),
      }"
      @mouseleave="
        offsetX = -1;
        offsetY = -1;
      "
      @mousemove="
        offsetX = $event.offsetX;
        offsetY = $event.offsetY;
      "
      @click="addSplitLine"
    >
      <template v-for="(image, i) in group.images" :key="i">
        <div
          class="margin"
          v-if="i > 0"
          :style="{
            width:
              group.join.direction === 'horizontal'
                ? group.join.margin * zoom + 'px'
                : '0px',
            height:
              group.join.direction === 'vertical'
                ? group.join.margin * zoom + 'px'
                : '0px',
          }"
        ></div>
        <div
          class="img"
          :class="{ 'img-selected': image.selected }"
          :data-image-index="image.index"
          @mousedown="$emit('img-mousedown', $event)"
          @click="$emit('select-image', { $event, group, image })"
          :style="{
            width: image.width * zoom + 'px',
            height: image.height * zoom + 'px',
            'background-image': `url('${image.src}')`,
            'background-repeat': 'no-repeat',
            'background-size': `${image.width * zoom}px ${
              image.height * zoom
            }px`,
            opacity: draggingImageIndex === image.innerIndex ? 0.2 : 1,
          }"
        >
          <div class="img-name">{{ image.name }}</div>
          <div class="img-toolbar">
            <span
              class="control-btn"
              @click="
                $emit('remove-image', {
                  $event,
                  group,
                  image,
                  imageIndex: i,
                })
              "
            >
              <i class="iconfont icon-f-delete"></i>
            </span>
          </div>
        </div>
      </template>
      <div
        class="split-line"
        v-for="(v, i) in group.split.lines"
        :key="i"
        :style="
          group.split.direction === 'horizontal'
            ? `left: ${v * zoom}px`
            : `top: ${v * zoom}px`
        "
      ></div>
      <div
        class="split-line split-line-ghost"
        :style="
          splitLineGhost > 0
            ? group.split.direction === 'horizontal'
              ? `left: ${splitLineGhost}px`
              : `top: ${splitLineGhost}px`
            : 'display: none'
        "
      >
        <div
          class="split-line-size"
          :style="
            group.split.direction === 'horizontal'
              ? `top: ${offsetY}px`
              : `left: ${offsetX}px`
          "
        >
          {{ ghostSize }}
        </div>
      </div>
    </div>

    <div class="locked-badge" v-if="group.locked">
      <i class="iconfont icon-lock"></i>
    </div>

    <OrderBadge
      v-if="setting.joinOrder && group.join.reverse"
      class="join-order-badge"
      type="join"
      :reverse="group.join.reverse"
      :count="group.images.length"
    />
    <OrderBadge
      v-if="setting.splitOrder && splitCount > 0"
      class="split-order-badge"
      type="split"
      :reverse="group.split.reverse"
      :count="splitCount + 1"
    />

    <div class="group-toolbar">
      <span class="control-btn" @click="$emit('show-group-detail')">
        <i class="iconfont icon-detail"></i>
      </span>
      <span
        class="control-btn"
        @click="$emit('remove-group', { $event, group })"
      >
        <i class="iconfont icon-f-delete"></i>
      </span>
    </div>
  </div>
</template>

<script>
import OrderBadge from "./OrderBadge.vue";

export default {
  components: { OrderBadge },
  props: {
    group: {
      images: Array,
      join: {
        direction: String,
        count: Number,
        reverse: Boolean,
        resize: String,
        width: Number,
        height: Number,
        margin: Number,
        background: String,
      },
      split: {
        direction: String,
        count: Number,
        lines: Array,
      },
      zoom: Number,
      selected: Boolean,
    },
    setting: {
      groupWidth: Number,
      groupHeight: Number,
    },
    curGroupZoom: Number,
    draggingImageIndex: Number,
  },

  data() {
    return {
      offsetX: -1,
      offsetY: -1,
    };
  },

  computed: {
    zoom() {
      return this.curGroupZoom > 0 ? this.curGroupZoom : this.group.zoom;
    },
    width() {
      return this.curGroupZoom > 0
        ? this.group.totalWidth * this.curGroupZoom
        : this.setting.groupWidth;
    },
    height() {
      return this.curGroupZoom > 0
        ? this.group.totalHeight * this.curGroupZoom
        : this.setting.groupHeight;
    },
    splitCount() {
      return this.group.split.lines.length;
    },
    splitLineGhost() {
      return this.group.split.direction === "horizontal"
        ? this.offsetX
        : this.offsetY;
    },
    ghostSize() {
      const ghostValue = this.splitLineGhost / this.zoom;
      const prevValue =
        this.group.split.lines.findLast((v) => v < ghostValue) || 0;
      return Math.round(ghostValue - prevValue);
    },
  },
  methods: {
    onGroupClick($event) {
      const contains = (c) => $event.target.classList.contains(c);
      if (contains("group-box") || contains("group-content")) {
        this.$emit("select-group", { $event, group: this.group });
      }
    },
    addSplitLine($event) {
      if ($event.button === 0) {
        const offset =
          this.group.split.direction === "horizontal"
            ? $event.offsetX
            : $event.offsetY;
        this.$emit("add-split-line", {
          group: this.group,
          value: offset / this.zoom,
          onAdded: () => $event.stopPropagation(),
        });
      }
    },
  },
};
</script>

<style scoped>
.group-box {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 6px;
  background: rgba(255, 255, 255, 0.001);
  overflow: hidden;
  min-height: 80px;
}
.group-box:hover,
.group-box.group-locked:hover {
  background: rgba(255, 255, 255, 0.3);
  outline: 4px dashed #f56c6c;
}
.group-box.group-selected,
.group-box.group-selected.group-locked {
  outline: 4px solid var(--group-selected-border-color);
}
.group-box.group-selected:hover,
.group-box.group-selected.group-locked:hover {
  outline-color: #f56c6c;
}

.group-box.group-locked {
  opacity: 0.5 !important;
  outline: 2px solid #bbb;
  outline-width: 2px !important;
}
.group-box.group-locked .group-content,
.group-box.group-locked .img {
  pointer-events: none !important;
  outline: none !important;
}
.group-box.group-locked .group-toolbar,
.group-box.group-locked .img-name {
  display: none !important;
}

.group-content {
  display: inline-flex;
  position: relative;
  align-items: center;
}
.join-horizontal .group-content {
  flex-flow: row;
}
.join-horizontal.reverse .group-content {
  flex-flow: row-reverse;
}
.join-vertical .group-content {
  flex-flow: column;
}
.join-vertical.reverse .group-content {
  flex-flow: column-reverse;
}

.group-box .img {
  position: relative;
  vertical-align: bottom;
  height: 300px;
  pointer-events: none;
  outline-offset: -4px;
}
.group-box .img.img-selected,
.group-box:hover .img.img-selected {
  outline: 4px solid var(--image-selected-border-color);
}

.img-name {
  display: none;
  position: absolute;
  bottom: 2px;
  left: 2px;
  padding: 2px 4px;
  width: calc(100% - 12px);
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  font-size: 12px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}
.always-show-filename .img-name,
.hover-show-filename .group-box:hover .img-name {
  display: block;
}

.locked-badge {
  width: 28px;
  line-height: 28px;
  text-align: center;
  /* background: rgba(0, 0, 0, 0.5);
  color: #ffffff; */
  position: absolute;
  top: 0;
  right: 0;
}

.img-toolbar {
  display: none;
  position: absolute;
  top: 2px;
  right: 2px;
}

.group-toolbar {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
}
.group-box:hover .group-toolbar {
  display: block;
}

.control-btn {
  display: inline-block;
  width: 28px;
  line-height: 28px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  cursor: pointer;
}
.control-btn:hover {
  background: #649cfa;
}
.control-btn + .control-btn {
  margin-left: 2px;
}

.split-line {
  position: absolute;
  pointer-events: none;
}
.split-horizontal .split-line {
  top: 0;
  height: 100%;
  border-left: 1px solid var(--split-line-color);
}
.split-vertical .split-line {
  left: 0;
  width: 100%;
  border-top: 1px solid var(--split-line-color);
}
.split-line-ghost {
  display: none;
  opacity: 0.5;
  background: none;
}
.split-horizontal .split-line-ghost {
  border-left-style: dashed;
}
.split-vertical .split-line-ghost {
  border-top-style: dashed;
}
.split-mode.manual-split .split-line-ghost {
  display: block;
}
.split-mode.manual-split .group-box {
  outline: none !important;
}
.split-mode.manual-split .img {
  outline: none !important;
  pointer-events: none !important;
}

.split-line-size {
  font-size: 12px;
  padding: 2px 4px;
  background: #000000;
  color: #ffffff;
  position: absolute;
}
.split-horizontal .split-line-size {
  right: 2px;
  transform: translateY(-50%);
}
.split-vertical .split-line-size {
  bottom: 2px;
  transform: translateX(-50%);
}

.join-order-badge,
.split-order-badge {
  display: none;
}
.join-mode .join-order-badge,
.split-mode .split-order-badge {
  display: block;
}

.is-alt .group-box:not(.group-locked),
.group-box.group-locked .img {
  outline: none !important;
}
.is-alt .group-box:hover .group-toolbar {
  display: none;
}
.is-alt .group-box:hover .img {
  outline: 4px dashed rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
.is-alt .group-box:hover .img.img-selected {
  outline: 4px solid var(--image-selected-border-color);
}
.is-alt .group-box:hover .img:hover,
.is-alt .group-box:hover .img.img-selected:hover {
  outline-color: #f56c6c;
}
.is-alt .group-box .img:hover > .img-toolbar {
  display: block;
}

.group-detail-modal .group-box {
  outline: none !important;
  background: none !important;
}
.group-detail-modal .img {
  outline: none !important;
  pointer-events: none !important;
}
.group-detail-modal .join-order-badge,
.group-detail-modal .split-order-badge {
  display: none !important;
}
.group-detail-modal .group-toolbar,
.group-detail-modal .img-toolbar,
.group-detail-modal .img-name,
.is-space .split-line-ghost,
.moving .split-line-ghost {
  display: none !important;
}

.dragging .group-box,
.is-alt .dragging .group-box {
  pointer-events: none;
  outline: 2px dashed #bbb !important;
}
.dragging .group-box.group-locked {
  outline-style: solid !important;
}
.dragging .img {
  outline: none !important;
}
.dragging.dragging-image .img {
  pointer-events: none;
  outline: 2px dashed #bbb !important;
}
.dragging .img {
  outline-offset: -2px;
}
.dragging .group-toolbar {
  display: none !important;
}
.always-show-filename .dragging .img-name,
.hover-show-filename .dragging .img-name {
  display: block;
}
</style>
