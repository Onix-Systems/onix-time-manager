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
  height: 40px;
  width: 222px;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: #a9a9a9;
  background: inherit;
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
    padding: 0 25px 0 10px;

    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: var(--txt-dark-grey);

    background: inherit;
    border: none;
    border-radius: 4px;

    &--arrow {
      position: absolute;
      right: 15px;

      width: 10px;
      height: 6px;

      mask-image: url("@/assets/arrow.svg");
      mask-repeat: no-repeat;
      mask-size: cover;
      background: var(--txt-dark-grey);
    }

    &.disable {
      cursor: auto;
      .selected-item--arrow {
        display: none;
      }
    }
    &.active {
      border-bottom: 1px solid var(--white);
      border-radius: 4px 4px 0 0;

      .selected-item--arrow {
        transform: rotate(180deg);
        transition: all 0.3s;
      }
    }
  }
  &--list {
    overflow: inherit;
    width: 100%;
    background: var(--white);
    border-radius: 0 0 4px 4px;

    ::v-deep(li) {
      cursor: pointer;
      display: flex;
      align-items: center;

      height: 40px;
      padding-left: 10px;

      font-family: var(--font-nunito);
      font-size: 14px;
      font-weight: 400;
      line-height: 19px;

      color: var(--txt-dark-grey);
      border-top: 1px solid var(--backgr-card-lightgrey2);
    }
  }
  &--content {
    z-index: 100;
    position: absolute;
    left: -1px;
    top: 40px;
    display: none;

    width: 100%;

    background: var(--white);
    border: 1px solid var(--backgr-card-lightgrey2);
    border-top: 0;
    border-radius: 0 0 4px 4px;

    &.active {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
