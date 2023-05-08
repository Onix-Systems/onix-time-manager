<template lang="pug">
.tracking
  .option--header(v-if="!isSelectedSite")
    .option--header-left
      .option--header--title {{ MenuItemsEnum.Tracking }}
      .option--header--subtitle {{ "Statistic the spending time on the websites" }}
  .tracking--title.actions(v-else)
    button.tracking--back(@click="selectSite({})")
    .tracking--site-icon(
      :style="{ backgroundImage: `url(${selectedSite.icon})` }"
    )
    .tracking--site-name {{ selectedSite.domain }}
  .tracking--filter
    filter-select
    calendar-slider
  .tracking--site-info(v-if="isSelectedSite && !isTotal")
    .tracking--site-board
      .tracking--site-title {{ "Usage" }}
      .tracking--site-count {{ formatDuration(currentSite.timeSpent) }}
    .tracking--site-board
      .tracking--site-title {{ "Session" }}
      .tracking--site-count {{ currentSite.visited }}
    .tracking--site-board
      .tracking--site-title {{ "Last visit" }}
      .tracking--site-count {{ currentSite.lastVisit }}
    .tracking--site-board
      .tracking--site-title {{ "Longest Session" }}
      .tracking--site-count {{ formatDuration(Math.max(...currentSite.sessions)) }}
  .tracking--chart-bar(:class="{ selected: isSelectedSite }")
    template(v-if="!isTotal")
      chart-bar
    template(v-else)
      .time-info--title(v-if="isSelectedSite && isTotal") {{ "Usage" }}
      .time-info
        template(v-for="item in 3")
          .item(
            v-if="getTimeTotal(item, timeForTotal)",
            v-html="getTimeTotal(item, timeForTotal)"
          )
  .tracking--sites(v-show="!isSelectedSite")
    sites-list(:isShowCurrentSession="false")
  .tracking--site-info(v-if="isSelectedSite && isTotal")
    .tracking--site-board.total
      .tracking--site-title.total {{ "Session" }}
      .tracking--site-count.total {{ currentSite.visited }}
    .tracking--site-board.total
      .tracking--site-title.total {{ "Longest Session" }}
      .tracking--site-count.total {{ formatDuration(Math.max(...currentSite.sessions)) }}
    .tracking--site-board.total
      .tracking--site-title.total {{ "First visit" }}
      .tracking--site-count.total {{ currentSite.firstVisit }}
    .tracking--site-board.total
      .tracking--site-title.total {{ "Last visit" }}
      .tracking--site-count.total {{ currentSite.lastVisit }}
    .tracking--site-board.total
      .tracking--site-title.total {{ "Most active day" }}
      .tracking--site-count.total {{ formatDuration(currentSite.mostActive) }}
    .tracking--site-board.total
      .tracking--site-title.total {{ "Most inactive day" }}
      .tracking--site-count.total {{ formatDuration(currentSite.mostInactive) }}
</template>

<script setup lang="ts">
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import FilterSelect from "@/components/common/FilterSelect.vue";
import CalendarSlider from "@/components/common/CalendarSlider.vue";
import ChartBar from "@/components/common/ChartBar.vue";
import { computed, onMounted } from "vue";
import {
  filteringData,
  formatDuration,
  getHistory,
  isTotal,
  selectNavItem,
} from "@/composables/popup/pages/trackerPageActions";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import SitesList from "@/components/common/SitesList.vue";
import {
  isSelectedSite,
  selectedSite,
  selectSite,
  timeForTotal,
} from "@/composables/common/chartBar";
import { getTimeTotal, st } from "@/composables/common/dateComposable";
onMounted(() => {
  getHistory();
  selectSite({});
  selectNavItem(PopupTrackerNavItemsEnum.day);
});

const currentSite = computed(() => {
  if (selectedSite.value) {
    return Object.values(filteringData.value).find((item: any) => {
      return item.domain === selectedSite.value.domain;
    });
  }
  return {};
});
</script>

<style scoped lang="scss">
.tracking {
  .option--header {
    margin-bottom: 24px;
  }
  &--title {
    margin-bottom: 24px;
    font-style: normal;
    font-weight: 600;
    font-size: 28px;
    line-height: 34px;
    color: #545d64;
    &.actions {
      display: flex;
      align-items: center;
    }
  }
  &--back {
    background-size: 14px 10px;
    height: 28px;
    width: 20px;
    background: url("@/assets/icons/arrow-back.svg") no-repeat center;
  }
  &--site {
    &-name {
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      color: #071122;
    }
    &-icon {
      min-width: 28px;
      min-height: 28px;
      margin-left: 22px;
      margin-right: 12px;
      background-repeat: no-repeat;
      background-size: contain;
    }
    &-info {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 30px;
    }
    &-board {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      box-sizing: border-box;
      height: 102px;
      min-width: 235px;
      width: calc(25% - 13px);
      padding: 15px 17px 14px;
      background: #f5f6fc;
      border-radius: 6px;
      &.total {
        gap: 0;
        height: 86px;
        width: calc(50% - 8px);
        padding: 7px 12px 5px 12px;
      }
    }
    &-title {
      margin-bottom: 6px;
      font-style: normal;
      font-weight: 600;
      font-size: 18px;
      line-height: 25px;
      text-align: right;
      color: var(--txt-dark-grey);
      &.total {
        margin-bottom: 6px;
      }
    }
    &-count {
      font-style: normal;
      font-weight: 600;
      font-size: 40px;
      line-height: 55px;
      text-align: right;
      color: var(--txt-main-darkblue);
      &.total {
        margin-bottom: 0;
        font-size: 38px;
        line-height: 46px;
      }
    }
  }
  .time-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 30px;
    height: 100%;
    margin: 0 70px;
    &--title {
      font-style: normal;
      font-weight: 400;
      font-size: 22px;
      line-height: 27px;
      text-align: left;
      color: #7d8794;
    }
    .item {
      min-width: max-content;
      font-style: normal;
      font-weight: 500;
      font-size: 100px;
      line-height: 121px;
      text-align: center;
      &:nth-child(1) {
        color: var(--txt-main-darkblue);
      }
      &:nth-child(2) {
        color: var(--txt-dark-grey);
      }
      &:nth-child(3) {
        color: var(--txt-light-grey);
      }
    }
  }
  &--filter {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 32px;
    &::v-deep(.filter) {
      width: 100%;
    }
    &::v-deep(.calendar) {
      display: flex;
      align-items: center;
      height: 36px;
      button {
        height: 36px;
      }
      .date {
        min-width: 163px;
        height: 32px;
        width: max-content;
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 17px;
        background: var(--bttn-active-lightblue);
      }
    }
  }
  &--chart-bar {
    width: 100%;
    min-height: 230px;
    margin-bottom: 42px;
    &::v-deep(.bar-chart) {
      width: 100%;
      height: 230px;
    }
    &.selected {
      &::v-deep(.bar-chart) {
        width: 100%;
        height: 423px;
      }
    }
  }
  &--sites {
    &::v-deep(.sites) {
      width: 100%;
    }
  }
}
</style>
