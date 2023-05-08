<template lang="pug">
teleport(to="body")
  transition(name="fade", appear)
    .modal(v-if="isOpen(currentKey)", :class="currentKey")
      .modal--backdrop(@click="close")
      .modal--container
        .modal--wrapper
          slot(name="content")
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from "vue";
import useDisableScroll from "@/features/useDisableScroll";
import {
  isOpen,
  currentKey,
  openModal,
  closeModal,
} from "@/composables/modalActions";

function close() {
  if (isOpen(currentKey.value)) {
    closeModal(currentKey.value);
  }
}

const keyPress = (event: KeyboardEvent) => {
  if (event && event.code === "Escape") {
    close();
  }
};
useDisableScroll();
document.addEventListener("keydown", keyPress);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", keyPress);
});
</script>

<style lang="scss" scoped>
.modal {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;

  &--backdrop {
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(0, 0, 0, 0.16);
    backdrop-filter: blur(8px);
    top: 0;
    left: 0;
  }

  &--container {
    max-height: 100%;
    overflow-y: auto;
    padding: 10px;
    z-index: 11;
  }

  &--wrapper {
    position: relative;
    background-color: #ffffff;
    padding: 32px 36px 40px;
    border-radius: 6px;
  }

  &--loader {
    top: calc(50% - 90px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
