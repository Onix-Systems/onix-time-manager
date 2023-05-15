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
  button.site-info--limit {{ "Add limit" }}
</template>

<script setup lang="ts">
import { timeForTotal, totalData } from "@/composables/common/chartBar";
import {
  formatDuration,
  isTotal,
} from "@/composables/common/trackerPageActions";
import ChartBar from "@/components/common/ChartBar.vue";
import CalendarSlider from "@/components/common/CalendarSlider.vue";
import { getTimeTotal, st } from "@/composables/common/dateComposable";
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
  &--limit {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin-top: 6px;
    height: 40px;
    width: 100%;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: #8d9297;
    border: 1px solid #f1f1f3;
    border-radius: 6px;
    background: inherit;
    &::before {
      content: "";
      margin-right: 11px;
      background: url("@/assets/icons/plus.svg"), no-repeat center;
      background-size: contain;
      width: 14px;
      height: 14px;
    }
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
