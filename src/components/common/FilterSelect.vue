<template lang="pug">
.filter
  button.filter--item(
    v-for="item in items",
    :class="{ active: selectedNavItem === item }",
    @click="selectNavItem(item)"
  ) {{ item }}
</template>

<script setup lang="ts">
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";

import {
  selectedNavItem,
  selectNavItem,
} from "@/composables/common/trackerPageActions";
const items = Object.values(PopupTrackerNavItemsEnum);
</script>

<style scoped lang="scss">
.filter {
  display: flex;
  box-sizing: border-box;
  height: 36px;
  max-width: 401px;
  padding: 2px;

  &--item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25%;
    font-style: normal;
    font-weight: 700;
    font-size: 15px;
    line-height: 20px;
    color: var(--txt-dark-grey);

    &.active {
      color: var(--txt-dark-blue);
      background: var(--bttn-active-lightblue);
      border-radius: 6px;
    }
  }
}
</style>
