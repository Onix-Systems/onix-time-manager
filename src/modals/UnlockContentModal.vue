<template lang="pug">
teleport(to="body")
  .background
    .close
    parent-control(:isEnterPassword="true", @setPassword="save($event)")
</template>

<script setup lang="ts">
import ParentControl from "@/components/ParentControl.vue";
import { settingsData, showContent } from "@/composables/settingsComp";
const save = (event: any) => {
  if (
    event &&
    settingsData.value.password &&
    settingsData.value.code === event
  ) {
    showContent.value = true;
  }
};
</script>

<style scoped lang="scss">
html {
  overflow: hidden;
}
.background {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  .close {
    width: 100%;
    height: 100%;
  }
  &::v-deep(.parent-control) {
    position: absolute;
    border-color: initial;
    background-color: initial;
  }
}
</style>
