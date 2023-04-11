<template lang="pug">
.drop-down
  .drop-down--section(ref="customSelect")
    button.selected-item(
      @click="toggleVisibility()",
      :class="openMenu === 'active' ? 'active' : ''",
      aria-label="open dropdown"
    )
      .selected-item--arrow
      slot(name="selectedItem")
    .drop-down--content(:class="openMenu === 'active' ? 'active' : ''")
      transition(name="dropdown-fade")
        .drop-down--bg
          ul.drop-down--list(v-if="isVisible", ref="dropdown")
            slot(name="content", :toggleVisibility="toggleVisibility")
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useClickOutside } from "@/composables/clickOutside";

const isVisible = ref(false);
const openMenu = ref();

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
  if (openMenu.value === "active") {
    openMenu.value = "";
  } else {
    openMenu.value = "active";
  }
};
const customSelect = ref(null);
useClickOutside(customSelect, () => {
  if (openMenu.value === "active") {
    toggleVisibility();
  }
});
</script>

<style scoped lang="scss">
.drop-down {
  width: 140px;
  height: 45px;
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  background: #ecf3fa;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  &--section {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .selected-item {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 0 20px 0 18px;
    background: inherit;
    border: none;
    &--arrow {
      position: absolute;
      right: 8px;
      width: 10px;
      height: 6px;
      background: url("@/assets/arrow.svg") no-repeat;
      background-size: contain;
    }
    &.active {
      .coins-section--arrow {
        transform: rotate(180deg);
        transition: all 0.3s;
      }
    }
  }
  &--list {
    overflow: auto;
    padding: 8px 0;
    width: 100%;
    border-radius: 4px;
    background: white;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    &::v-deep(.item--name) {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding-left: 10px;
      height: 36px;
      &.active {
        background: #ecf3fa;
      }
    }
  }
  &--content {
    z-index: 100;
    display: none;
    left: 0;
    position: absolute;
    top: 55px;
    width: 100%;
    &.active {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
