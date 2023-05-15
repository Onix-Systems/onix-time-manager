<template lang="pug">
.left-nav
  .left-nav--logo-section
    h2.left-nav--text {{ "BrowserTime" }}
  ul.navigation
    li.navigation-tab(
      v-for="item in data",
      :class="[{ active: activeTabIndex === item }, item]",
      @click="setTabIndex(item)"
    )
      span.navigation-tab--text {{ item }}
</template>

<script setup lang="ts">
import { activeTabIndex, editTabIndex } from "@/composables/optionsActions";
import { computed } from "vue";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { openOptions } from "@/composables/popup/common/popupActions";
const data = computed(() => {
  return Object.keys(MenuItemsEnum);
});

const setTabIndex = (item: MenuItemsEnum) => {
  editTabIndex(item);
  openOptions(item, true);
};
</script>

<style scoped lang="scss">
.left-nav {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 261px;
  height: 100%;
  padding: 24px 12px;
  background: var(--bttn-active-lightblue);
  &--logo-section {
    margin-bottom: 56px;
  }
  &--text {
    display: flex;
    align-items: center;
    font-style: normal;
    font-weight: 700;
    font-size: 22px;
    line-height: 27px;
    &::before {
      content: "";
      display: block;
      width: 32px;
      height: 32px;
      margin-right: 8px;
      margin-left: 3px;
      background-image: url("@/assets/logo.svg");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  .navigation {
    list-style: none;
    display: flex;
    flex-direction: column;

    &-tab {
      cursor: pointer;
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      height: 46px;
      padding-left: 44px;

      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 19px;
      color: var(--txt-light-grey);

      &.active {
        background: var(--white);
        color: var(--txt-dark-blue);
        border-radius: 12px;
      }
      &.Tracking,
      &.Permissions,
      &.Limits,
      &.Redirect,
      &.History,
      &.Settings {
        &:before {
          position: absolute;
          content: "";
          top: 11px;
          left: 10px;
          width: 24px;
          height: 24px;
        }
      }
      &.Tracking {
        &:before {
          background: url("@/assets/icons/options-nav/clock-circle.svg");
        }
        &.active {
          &:before {
            background: url("@/assets/icons/options-nav/clock-circle-active.svg");
          }
        }
      }
      &.Permissions {
        &:before {
          background: url("@/assets/icons/options-nav/browser.svg");
        }
        &.active {
          &:before {
            background: url("@/assets/icons/options-nav/browser-active.svg");
          }
        }
      }
      &.Limits {
        &:before {
          background: url("@/assets/icons/options-nav/warning-polygon.svg");
        }
        &.active {
          &:before {
            background: url("@/assets/icons/options-nav/warning-polygon-active.svg");
          }
        }
      }
      &.Redirect {
        &:before {
          top: 12px;
          background: url("@/assets/icons/options-nav/arrow-return.svg");
        }
        &.active {
          &:before {
            background: url("@/assets/icons/options-nav/arrow-return-active.svg");
          }
        }
      }
      &.History {
        &:before {
          background: url("@/assets/icons/options-nav/user-polygon.svg");
        }
        &.active {
          &:before {
            background: url("@/assets/icons/options-nav/user-polygon-active.svg");
          }
        }
      }
      &.Settings {
        &:before {
          background: url("@/assets/icons/options-nav/setting.svg");
        }
        &.active {
          &:before {
            background: url("@/assets/icons/options-nav/setting-active.svg");
          }
        }
      }
    }
  }
}
</style>
