<template lang="pug">
.wrapper
  header.header
    img.header--logo(src="@/assets/logo.png")
    h2.header--text Extention
  .tabs
    .tabs--left
      h3.tabs--left--header Tabs
      ul.navigation
        li.navigation-tab(
          v-for="(item, index) in tabsArray",
          :class="{ active: activeTabIndex === index }",
          @click="activeTabIndex = index"
        )
          span.navigation-tab--text {{ item }}
    .tabs--right
      template(v-if="0 === activeTabIndex")
        h1 content {{ 0 }}
      template(v-if="1 === activeTabIndex")
        h1 content {{ 1 }}
      template(v-if="2 === activeTabIndex")
        h1 content {{ 2 }}
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const tabsArray = [
  "Daily Screen Time Usage",
  "Set Daily Screen Time Limit",
  "Notifications and Alerts",
];

const activeTabIndex = ref(0);
let data = ref([]);
let intervalId = 0;
onMounted(() => {
  intervalId = setInterval(() => {
    chrome.storage.local.get(["pages"], (result) => {
      data.value = result.pages;
    });
  }, 1000);
});
onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
  min-width: 100%;
  background: #dcd8d8;

  .header {
    display: flex;
    align-items: center;
    min-width: 100%;
    height: 60px;
    padding: 0 16px;
    margin-bottom: 30px;

    &--logo {
      height: 100%;
      margin-right: 16px;
    }
    &--text {
      font-size: 40px;
    }
  }

  .tabs {
    display: flex;
    min-height: 100vh;

    &--left,
    &--right {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    &--left {
      padding: 0 0 0 16px;
      &--header {
        font-size: 30px;
        color: #6c7772;
        text-transform: uppercase;
        font-weight: 500;
        margin-bottom: 30px;
      }
      .navigation {
        list-style: none;
        display: flex;
        flex-direction: column;

        &-tab {
          cursor: pointer;
          box-sizing: border-box;
          display: flex;
          align-items: center;

          height: 60px;
          padding: 10px 10px;
          border-radius: 10px;

          &:hover {
            background: #f0ecec;
          }

          &.active {
            background: #ffffff;
            border: 2px solid #504e4e;
            border-radius: 10px 0 0 10px;
            border-right: none;
          }
        }
      }
    }
    &--right {
      width: 100%;
      background: white;
    }
  }
}
</style>
