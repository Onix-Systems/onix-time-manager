<template lang="pug">
section.option-page(
  v-if="(settingsData && !settingsData.password) || showContent"
)
  .option-page--position
    .left-nav
      .left-nav--logo-section
        h2.left-nav--text {{ "BrowserTime" }}
      ul.navigation
        li.navigation-tab(
          v-for="(_, tab) in dashboardTabs",
          :class="[{ active: dashboardTab === tab as MenuItemsEnum }, tab]",
          @click="dashboardTab = tab"
        )
          span.navigation-tab--text {{ SidebarNamesEnum[tab] }}
    .option-page--content
      component(:is="dashboardTabs[dashboardTab] as string")
section.password(v-if="settingsData && settingsData.password && !showContent")
  unlock-content-modal
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import UnlockContentModal from "@/modals/UnlockContentModal.vue";
import {
  settingsData,
  getBytes,
  updateSettingsData,
  showContent,
} from "@/composables/settingsComp";

import { MenuItemsEnum, SidebarNamesEnum } from "@/constants/menuItemsEnum";
import { dashboardTab, dashboardTabs } from "@/composables/tabsActions";

onMounted(() => {
  if (window.location.hash) {
    dashboardTab.value = window.location.hash.slice(1) as MenuItemsEnum;
  } else {
    dashboardTab.value = MenuItemsEnum.TrackingView;
  }
  showContent.value = false;
  updateSettingsData();
  getBytes();
});
</script>

<style scoped lang="scss">
.option-page {
  min-height: 100vh;
  min-width: 100%;
  &--position {
    display: flex;
    width: 100%;
    height: 100vh;

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
          &.TrackingView,
          &.PermissionsView,
          &.LimitsView,
          &.RedirectView,
          &.HistoryView,
          &.SettingsView,
          &.UsageView {
            &:before {
              position: absolute;
              content: "";
              top: 11px;
              left: 10px;
              width: 24px;
              height: 24px;
            }
          }
          &.TrackingView {
            &:before {
              background: url("@/assets/icons/options-nav/clock-circle.svg");
            }
            &.active {
              &:before {
                background: url("@/assets/icons/options-nav/clock-circle-active.svg");
              }
            }
          }
          &.PermissionsView {
            &:before {
              background: url("@/assets/icons/options-nav/browser.svg");
            }
            &.active {
              &:before {
                background: url("@/assets/icons/options-nav/browser-active.svg");
              }
            }
          }
          &.LimitsView {
            &:before {
              background: url("@/assets/icons/options-nav/warning-polygon.svg");
            }
            &.active {
              &:before {
                background: url("@/assets/icons/options-nav/warning-polygon-active.svg");
              }
            }
          }
          &.RedirectView {
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
          &.HistoryView {
            &:before {
              background: url("@/assets/icons/options-nav/user-polygon.svg");
            }
            &.active {
              &:before {
                background: url("@/assets/icons/options-nav/user-polygon-active.svg");
              }
            }
          }
          &.SettingsView {
            &:before {
              background: url("@/assets/icons/options-nav/setting.svg");
            }
            &.active {
              &:before {
                background: url("@/assets/icons/options-nav/setting-active.svg");
              }
            }
          }
          &.UsageView {
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
  }
  &--content {
    overflow: auto;
    box-sizing: border-box;
    width: 100%;
    padding: 40px 24px 0 24px;
  }
}
</style>
