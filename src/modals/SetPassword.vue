<template lang="pug">
teleport(to="body")
  .background
    .close(@click="showSetPassword = false")
    parent-control(:isSettings="true", @setPassword="save($event)")
</template>

<script setup lang="ts">
import ParentControl from "@/components/ParentControl.vue";
import {
  editShowSetPassword,
  setSettings,
  settingsData,
  updateSettings,
  showSetPassword,
  showContent,
} from "@/composables/settingsComp";
const save = (event: any) => {
  if (event) {
    if (settingsData.value.password) {
      editShowSetPassword(true);
    } else {
      editShowSetPassword();
      updateSettings("password", true);
    }
    showContent.value = true;
    updateSettings("code", event);
    setSettings();
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
  background: rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(8px);

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
