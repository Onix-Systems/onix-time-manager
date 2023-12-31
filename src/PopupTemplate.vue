<template lang="pug">
.popup
  header.popup--header
    .popup--header-title(v-if="view === TrackerViews.list") {{ "BrowserTime" }}
    .popup--header-actions(v-else)
      button.popup--back(@click="onBackClicked")
      .popup--site-icon(
        :style="{ backgroundImage: `url(${hostTabSelected.icon})` }"
      )
      .popup--site-name {{ hostTabSelected.domain }}
    button.popup--header-settings(@click="openOptions()")
  section.popup--content
    template(v-if="popupNavigationSelected === PopupNavItemsEnum.tracker")
      tracker-data(:popup-view="true")
    template(
      v-else-if="popupNavigationSelected === PopupNavItemsEnum.permissions && settingsData.permission"
    )
      permissions-component
    template(
      v-else-if="popupNavigationSelected === PopupNavItemsEnum.timeLimits"
    )
      limits-component
  footer.popup--footer
    template(v-for="item in popupNavigations")
      button.popup--footer-item(
        v-if="item === PopupNavItemsEnum.permissions ? settingsData.permission : true"
        :class="[{ active: popupNavigationSelected === item }, item]",
        @click="selectNavItem(item as PopupNavItemsEnum)"
      ) {{ item }}
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from "vue";

import TrackerData from "@/components/common/TrackerData.vue";

import {
  TrackerViews,
  view,
  hostTabSelected,
  onBackClicked,
  setToday,
  selectedNavItem,
  isDay,
  currentData,
  loadData,
  isDetails,
} from "@/composables/popupTrackerActions";

import {
  openOptions,
  selectNavItem,
  popupNavigations,
  popupNavigationSelected,
} from "@/composables/popup/popupActions";
import PermissionsComponent from "@/components/popup/PermissionsComponent.vue";
import LimitsComponent from "@/components/popup/LimitsComponent.vue";
import { PopupNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";

import { getPermission } from "@/composables/permissionComp";
import { settingsData, updateSettingsData } from "@/composables/settingsComp";
import { destroyTrackerInterval } from "@/composables/common/timeCounter";

onMounted(() => {
  setToday();
  loadData(isDetails.value);
  getPermission();
  updateSettingsData();
});
onUnmounted(() => {
  destroyTrackerInterval();
});
watch(
  () => selectedNavItem.value,
  () => {
    if (isDay.value) {
      setToday();
    }
    loadData(isDetails.value);
  }
);
watch(
  () => currentData.value,
  () => {
    loadData(isDetails.value);
  }
);
</script>

<style lang="scss">
.popup {
  width: 425px;
  height: 600px;
  overflow: hidden;
  &--back {
    background-size: 14px 10px;
    height: 28px;
    width: 20px;
    background-image: url("@/assets/icons/arrow-back.svg");
    background-repeat: no-repeat;
    background-position: center;
  }
  &--site {
    &-name {
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
    }
    &-icon {
      min-width: 32px;
      min-height: 32px;
      margin-left: 18px;
      margin-right: 12px;
      background-repeat: no-repeat;
      background-size: contain;
    }
  }
  &--header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 16px 16px 16px 12px;
    height: 56px;
    &-actions {
      display: flex;
      align-items: center;
    }
    &-title {
      display: flex;
      align-items: center;
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 24px;
      &::before {
        content: "";
        width: 32px;
        height: 32px;
        margin-right: 18px;
        margin-left: 6px;
        background-image: url("@/assets/logo.svg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      }
    }
    &-settings {
      height: 18px;
      width: 18px;
      background: url("@/assets/icons/settings.svg"), no-repeat;
      background-size: contain;
    }
  }
  &--content {
    height: calc(100% - 128px);
  }
  &--footer {
    display: flex;
    position: relative;
    gap: 8px;
    box-sizing: border-box;
    height: 72px;
    padding: 16px 12px;
    background: white;
    border-top: 1px solid #eeeeee;
    &-item {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      width: 100%;
      height: 40px;
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 19px;
      border-radius: 6px;
      color: var(--txt-light-grey);
      &.Tracker,
      &.Permissions,
      &.Time {
        &:before {
          content: "";
          width: 24px;
          height: 24px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
      }

      &.Tracker {
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

      &.Time {
        &:before {
          background: url("@/assets/icons/options-nav/warning-polygon.svg");
        }
        &.active {
          &:before {
            background: url("@/assets/icons/options-nav/warning-polygon-active.svg");
          }
        }
      }

      &.active {
        color: var(--txt-dark-blue);
        background: var(--bttn-active-lightblue);
      }
    }
  }
}
</style>
