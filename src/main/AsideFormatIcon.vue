<template>
  <div class="icon" :class="{ selected }">
    <img src="@/assets/image-file.png" class="icon-image" />
    <div class="type" :style="{ background: format.color }">
      {{ $t(`${format.type}.name`) }}
    </div>
  </div>
</template>

<script>
export default {
  name: "AsideFormatIcon",
  props: {
    format: Object,
    selected: Boolean,
  },
};
</script>

<style scoped>
.icon {
  display: inline-block;
  position: relative;
  padding: 5px;
  transition: 0.1s;
}

.icon:hover {
  background-color: #dcdfe6;
  outline: 1px solid #cdd0d6;
}

.icon.selected {
  background-color: #cdd0d6;
  outline: 1px solid #a8abb2;
}

.icon-image {
  width: 60px;
  filter: drop-shadow(1px 1px 1px #000);
}

.type {
  position: absolute;
  width: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 5px);
  background-color: #000;
  color: #fff;
  font-weight: bold;
  text-align: center;
  padding: 2px 0;
  border-radius: 4px;
  opacity: 0.95;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.5);
}
</style>
