<template lang="pug">
.site-info
  .site-info--header
    .site-info--usage
      .title {{ "Usage" }}
      .time(v-if="!isTotal") {{ formatDuration(totalData.timeSpent) || "0m" }}
    .site-info--calendar
      calendar-slider
  .site-info--content
    chart-bar(v-if="!isTotal")
    .time-info(v-else)
      template(v-for="item in 3")
        .item(
          v-if="getTimeTotal(item, timeForTotal)",
          v-html="getTimeTotal(item, timeForTotal)"
        )
  button.content--button.tab-active.icon.icon--plus(
    @click="openOptions(MenuItemsEnum.Limits)"
  ) Add limit
</template>

<script setup lang="ts">
import { timeForTotal, totalData } from "@/composables/common/chartBar";
import { openOptions } from "@/composables/popup/common/popupActions";
import {
  formatDuration,
  isTotal,
} from "@/composables/common/trackerPageActions";
import ChartBar from "@/components/common/ChartBar.vue";
import CalendarSlider from "@/components/common/CalendarSlider.vue";
import { getTimeTotal, st } from "@/composables/common/dateComposable";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
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
