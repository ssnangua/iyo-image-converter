<template>
  <div class="order-badge" :class="{ reverse }">
    <i
      class="iconfont"
      :class="type === 'join' ? 'icon-join' : 'icon-split'"
    ></i>
    {{ text }}
  </div>
</template>

<script>
export default {
  props: {
    type: String, //"join"|"split"
    reverse: Boolean,
    count: Number,
  },
  computed: {
    text() {
      const { reverse, count } = this;
      return reverse ? `${count}←1` : `1→${count}`;
    },
  },
};
</script>

<style scoped>
.order-badge {
  position: absolute;
  top: 0px;
  left: 0px;
  line-height: 20px;
  padding: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  pointer-events: none;
}
.order-badge.reverse {
  background-color: rgba(255, 0, 0, 0.5);
}
</style>
