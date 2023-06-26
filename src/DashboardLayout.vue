<template lang="pug">
section.option-page(
    v-if="(settingsData && !settingsData.password) || showContent"
)
    .option-page--position
        .left-nav
            .left-nav--logo-section
                h2.left-nav--text BrowserTime
            ul.navigation
              template(v-for="(_, tab) in dashboardTabs",)
                li.navigation-tab(
                    v-if="tab === 'PermissionsView' ? settingsData.permission : true"
                    :class="[{ active: dashboardTab === tab as MenuItemsEnum}, tab]",
                    @click="setTabIndex(tab as MenuItemsEnum)"
                )
                    span.navigation-tab--text {{ SidebarNamesEnum[tab] }}
        .option-page--content
            component(:is="dashboardTabs[dashboardTab] as string")
section.password(v-if="settingsData && settingsData.password && !showContent")
    unlock-content-modal
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import { dashboardTab, dashboardTabs } from "@/composables/tabsActions";
import {
  getBytes,
  settingsData,
  showContent,
  updateSettingsData,
} from "@/composables/settingsComp";
import { openOptions } from "@/composables/popup/popupActions";
import { getPermission } from "@/composables/permissionComp";

import { MenuItemsEnum, SidebarNamesEnum } from "@/constants/menuItemsEnum";
import UnlockContentModal from "@/modals/UnlockContentModal.vue";

const setTabIndex = (tab: MenuItemsEnum) => {
  dashboardTab.value = tab;
  openOptions(tab, true);
};
onMounted(() => {
  if (window.location.hash) {
    dashboardTab.value = window.location.hash.slice(1) as MenuItemsEnum;
  } else {
    dashboardTab.value = MenuItemsEnum.TrackingView;
  }
  showContent.value = false;
  updateSettingsData();
  getBytes();
  getPermission();
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

              background-position: center;
              background-size: 22px;
              background-repeat: no-repeat;
            }
          }
          &.TrackingView {
            &:before {
              background-image: url("@/assets/icons/options-nav/clock-circle.svg");
            }
            &.active {
              &:before {
                background-image: url("@/assets/icons/options-nav/clock-circle-active.svg");
              }
            }
          }
          &.PermissionsView {
            &:before {
              background-image: url("@/assets/icons/options-nav/browser.svg");
            }
            &.active {
              &:before {
                background-image: url("@/assets/icons/options-nav/browser-active.svg");
              }
            }
          }
          &.LimitsView {
            &:before {
              background-image: url("@/assets/icons/options-nav/warning-polygon.svg");
            }
            &.active {
              &:before {
                background-image: url("@/assets/icons/options-nav/warning-polygon-active.svg");
              }
            }
          }
          &.RedirectView {
            &:before {
              top: 12px;
              background-image: url("@/assets/icons/options-nav/arrow-return.svg");
            }
            &.active {
              &:before {
                background-image: url("@/assets/icons/options-nav/arrow-return-active.svg");
              }
            }
          }
          &.HistoryView {
            &:before {
              background-image: url("@/assets/icons/options-nav/user-polygon.svg");
            }
            &.active {
              &:before {
                background-image: url("@/assets/icons/options-nav/user-polygon-active.svg");
              }
            }
          }
          &.SettingsView {
            &:before {
              background-image: url("@/assets/icons/options-nav/setting.svg");
            }
            &.active {
              &:before {
                background-image: url("@/assets/icons/options-nav/setting-active.svg");
              }
            }
          }
          &.UsageView {
            &:before {
              background-image: url("@/assets/icons/options-nav/usage.svg");
              background-size: 19px;
            }
            &.active {
              &:before {
                background-image: url("@/assets/icons/options-nav/usage-active.svg");
                background-size: 19px;
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
