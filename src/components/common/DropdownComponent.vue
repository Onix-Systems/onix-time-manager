<template lang="pug">
.drop-down
  .drop-down--section(ref="customSelect")
    button.selected-item(
      @click="toggleVisibility()",
      :class="[openMenu, { disable: !disable }]",
      aria-label="open dropdown"
    )
      .selected-item--arrow
      slot(name="selectedItem", :openMenu="openMenu")
    .drop-down--content(:class="openMenu")
      transition(name="dropdown-fade")
        .drop-down--bg
          ul.drop-down--list(v-if="isVisible", ref="dropdown")
            slot(name="content", :toggleVisibility="toggleVisibility")
</template>
<script setup lang="ts">
import { defineProps, ref } from "vue";
import { useClickOutside } from "@/composables/clickOutside";

const propsFirst = defineProps({
  disable: Boolean,
});

const isVisible = ref(false);
const openMenu = ref();

const toggleVisibility = () => {
  if (propsFirst.disable) {
    isVisible.value = !isVisible.value;
    if (openMenu.value === "active") {
      openMenu.value = "";
    } else {
      openMenu.value = "active";
    }
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
  height: 32px;
  width: 222px;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: #a9a9a9;
  background: var(--white);
  border-radius: 4px;
  border: 1px solid var(--backgr-card-lightgrey2);
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
      mask-image: url("@/assets/arrow.svg");
      mask-repeat: no-repeat;
      mask-size: cover;
      background: #a9a9a9;
    }
    &.disable {
      cursor: auto;
      .selected-item--arrow {
        display: none;
      }
    }
    &.active {
      border-bottom: none;
      .selected-item--arrow {
        transform: rotate(180deg);
        transition: all 0.3s;
      }
    }
  }
  &--list {
    overflow: auto;
    width: 100%;
    background: var(--white);
    border-radius: 0 0 4px 4px;
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
    left: -1px;
    position: absolute;
    top: 32px;
    width: 100%;
    border: 1px solid var(--backgr-card-lightgrey2);
    border-top: none;
    &.active {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
