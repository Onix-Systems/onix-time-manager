<template lang="pug">
header.header
  img.header--logo(src="@/assets/logo.svg")
  h2.header--text
    span {{ "Time" }}
    | {{ "Management" }}
  ul.navigation
    li.navigation-tab(
      v-for="(item, index) in homeSections",
      :class="{ active: activeTabIndex === index }",
      @click="editTabIndex(index)"
    )
      span.navigation-tab--text {{ item }}
</template>

<script setup lang="ts">
import { activeTabIndex, editTabIndex } from "@/composables/OptionsActions";
const homeSections = ["Home", "Limits", "Blocker", "History", "Settings"];
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

      font-family: Inter, sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: 20px;
      line-height: 30px;
      text-align: center;

      &.active {
        font-weight: 700;
        color: #4196db;
        border-bottom: 3px solid #4196db;
      }
    }
  }
}
</style>
