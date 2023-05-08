<template lang="pug">
header.header
  .header--logo-section(@click="editTabIndex(MenuItemsEnum.Home)")
    img.header--logo(src="@/assets/logo.svg")
    h2.header--text
      span {{ "Time" }}
      | {{ "Management" }}
  ul.navigation
    li.navigation-tab(
      v-for="item in data",
      :class="{ active: activeTabIndex === item }",
      @click="editTabIndex(item)"
    )
      span.navigation-tab--text {{ item }}
</template>

<script setup lang="ts">
import { activeTabIndex, editTabIndex } from "@/composables/optionsActions";
import { computed } from "vue";
import { settingsData } from "@/composables/settingsComp";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
const data = computed(() => {
  const itemsKeys = Object.keys(MenuItemsEnum);
  if (!settingsData.value.limits || !settingsData.value.password) {
    return itemsKeys.slice(0, 1).concat(itemsKeys.slice(2));
  } else {
    return itemsKeys;
  }
});
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  height: 89px;
  padding: 0 20px;
  border-bottom: 1px solid #d9d9d9;

  &--logo {
    height: 100%;
    width: 46px;
    margin-right: 13px;
    &-section {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
  }
  &--text {
    display: flex;
    gap: 6px;
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    span {
      font-weight: 900;
    }
  }

  .navigation {
    list-style: none;
    display: flex;
    gap: 46px;
    margin-left: 66px;

    &-tab {
      cursor: pointer;
      box-sizing: border-box;
      display: flex;
      align-items: center;

      font-style: normal;
      font-weight: 500;
      font-size: 20px;
      line-height: 30px;
      text-align: center;

      &.active,
      &:hover {
        color: #4196db;
        border-bottom: 2px solid #4196db;
      }
    }
  }
}
</style>
