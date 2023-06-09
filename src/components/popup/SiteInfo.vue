<template lang="pug">
.site-info
  .site-info--header
    .site-info--usage
      .title {{ "Usage" }}
      .time(v-if="!isTotal") {{ format(sessionMask(totalTime, true), totalTime, true, false) }}
    .site-info--calendar
      calendar-slider
  .site-info--content
    chart-bar(v-if="!isTotal")
    .time-info(v-else)
      template(v-for="item in usageMask")
        .item {{ format(item, totalTime, true, false) }}
          span {{ item }}
  button.content--button.tab-active.icon.icon--plus(
    @click="openOptions(MenuItemsEnum.Limits)"
  ) Add limit
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from "vue";

import { openOptions } from "@/composables/popup/popupActions";
import {
  counter,
  currentData,
  hostTabSelected,
  isTotal,
  selectedHostName,
  selectedNavItem,
  sessionMask,
  totalTimeCalculation,
} from "@/composables/common/trackerPageActions";
import ChartBar from "@/components/common/ChartBar.vue";
import CalendarSlider from "@/components/common/CalendarSlider.vue";
import {
  format,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "@/composables/common/dateComposable";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { getSiteData } from "@/composables/common/chartBar";

const usage = ref("");
const totalTime = computed(() => {
  if (selectedNavItem.value === PopupTrackerNavItemsEnum.total) {
    return (
      totalTimeCalculation(hostTabSelected.value.item.sessions) + counter.value
    );
  } else {
    const sum = totalTimeCalculation(hostTabSelected.value.item.sessions);
    let currentRange = false;
    switch (selectedNavItem.value) {
      case PopupTrackerNavItemsEnum.day: {
        currentRange = new Date().getDate() === currentData.value.getDate();
        break;
      }
      case PopupTrackerNavItemsEnum.month: {
        currentRange = new Date().getMonth() === currentData.value.getMonth();
        break;
      }
      default: {
        const day = new Date().getDay();
        const diff = new Date().getDate() - day + (!day ? -6 : 1);
        const monday = new Date(new Date().setDate(diff));
        currentRange = currentData.value.getDate() - monday.getDate() <= 7;
        break;
      }
    }
    if (
      currentRange &&
      selectedHostName.value === hostTabSelected.value.domain
    ) {
      return sum + counter.value;
    }
    return sum;
  }
});

const usageMask = computed(() => {
  const keys = [SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE];
  const total = totalTime.value;
  const filter = keys.filter((key) => total >= key);
  if (filter.length) {
    return filter
      .reverse()
      .map((v, i) => {
        switch (i) {
          case 0: {
            return "minutes";
          }
          case 1: {
            return "hours";
          }
          case 2: {
            return "days";
          }
        }
      })
      .reverse();
  } else {
    return ["seconds"];
  }
});
</script>

<style scoped lang="scss">
.site-info {
  padding: 12px 12px 0;

  &--header {
    display: flex;
    justify-content: space-between;
    height: 68px;
    padding-left: 12px;
  }
  &--content {
    width: 381px;
    height: 283px;
  }
  &--usage {
    display: flex;
    flex-direction: column;
    .title {
      margin-bottom: 2px;
      font-style: normal;
      font-weight: 500;
      font-size: 22px;
      line-height: 30px;
      color: var(--txt-light-grey);
    }
    .time {
      font-style: normal;
      font-weight: 500;
      font-size: 36px;
      line-height: 44px;
      color: #000000;
    }
  }
  .tab-active {
    margin: 12px 0;
  }

  .time-info {
    display: flex;
    flex-direction: column;
    .item {
      &:nth-child(1) {
        font-weight: 500;
        font-size: 120px;
        line-height: 100%;
        color: var(--txt-main-darkblue);
        &::v-deep(span) {
          font-size: 60px;
          line-height: 72.61px;
        }
      }
      &:nth-child(2) {
        margin-left: 12px;
        font-weight: 500;
        font-size: 80px;
        line-height: 100%;
        color: var(--txt-dark-grey);
        &::v-deep(span) {
          font-size: 40px;
          line-height: 48.41px;
        }
      }
      &:nth-child(3) {
        margin-left: 24px;
        font-weight: 500;
        font-size: 40px;
        line-height: 2;
        color: var(--txt-light-grey);
        &::v-deep(span) {
          font-size: 30px;
          line-height: 36.31px;
        }
      }
    }
  }
}
</style>
