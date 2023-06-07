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
import { computed, defineProps, onMounted, ref, watch } from "vue";

import { openOptions } from "@/composables/popup/popupActions";
import {
  counter,
  isTotal,
  selectedNavItem,
  sessionMask,
  totalTimeCalculation,
} from "@/composables/common/trackerPageActions";
import ChartBar from "@/components/common/ChartBar.vue";
import CalendarSlider from "@/components/common/CalendarSlider.vue";
import {
  currentData,
  format,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "@/composables/common/dateComposable";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import {
  HistoryListInterface,
  SessionInterface,
} from "@/types/TrackingInterface";
import { getSiteData } from "@/composables/common/chartBar";

const filteredSessions = ref<SessionInterface[]>([]);
const props = defineProps({
  item: {
    type: Object as () => HistoryListInterface,
    required: true,
  },
});

watch(
  () => currentData.value,
  () => {
    filteredSessions.value = filteredByPeriod();
    getSiteData(filteredSessions.value);
  }
);

const totalTime = computed(() => {
  if (selectedNavItem.value === PopupTrackerNavItemsEnum.total) {
    return totalTimeCalculation(filteredSessions.value) + counter.value;
  } else {
    if (filteredSessions.value.length) {
      const sum = totalTimeCalculation(filteredSessions.value);
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
      if (currentRange) {
        return sum + counter.value;
      }
      return sum;
    }
  }
  return 0;
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

const filteredByPeriod = (): SessionInterface[] => {
  if (selectedNavItem.value === PopupTrackerNavItemsEnum.total) {
    return [...props.item.sessions];
  } else {
    return [...props.item.sessions].filter((session) => {
      return session.activity.filter((activity) => {
        switch (selectedNavItem.value) {
          case PopupTrackerNavItemsEnum.day: {
            const condition = (date: number) => {
              return currentData.value.getDate() === new Date(date).getDate();
            };
            return condition(activity.begin);
          }
          case PopupTrackerNavItemsEnum.month: {
            const condition = (date: number) => {
              return currentData.value.getMonth() === new Date(date).getMonth();
            };
            return condition(activity.begin);
          }
          default: {
            // const monday = new Date(currentData.value);
            // const sa;
            const day = currentData.value.getDay();
            const diff = currentData.value.getDate() - day + (!day ? -6 : 1);
            const monday = new Date(currentData.value.setDate(diff));
            const condition = (date: number) => {
              return new Date(date).getDate() - monday.getDate() <= 7;
            };
            return condition(activity.begin);
          }
        }
      }).length;
    });
  }
};

onMounted(() => {
  filteredSessions.value = filteredByPeriod();
  getSiteData(filteredSessions.value);
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
