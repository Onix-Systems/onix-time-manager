<template lang="pug">
.loader(v-if="showLoader || showTimeLoader")
    circul-loader
.tracker(v-else)
  template(v-if="popupView")
    .tracker--nav-section
      .filter
        button.filter--item(
          v-for="item in items",
          :class="{ active: selectedNavItem === item }",
          @click="selectedNavItem = item as PopupTrackerNavItemsEnum"
        ) {{ item }}
    .tracker--sites-list(
      v-if="isList"
    )
      sites-list(:is-show-current-session="true")
    .site-info(v-else)
      .site-info--header
        .site-info--usage
          .title Usage
          .time(v-if="!isTotal") {{ format(sessionMask(totalSessionTime(hostTabSelected.domain === selectedHostName), true), totalSessionTime(hostTabSelected.domain === selectedHostName), true, false) }}
        .site-info--calendar
          calendar-slider
      .site-info--content
        template(v-if="isTotal")
          .time-info
            .item(v-for="item in usageMask(totalSessionTime(hostTabSelected.domain === selectedHostName))") {{ format(item, totalSessionTime(hostTabSelected.domain === selectedHostName), true, false) }}
              span {{ item }}
        template(v-else)
          chart-bar
    button.content--button.tab-active.icon.icon--plus(
        @click="openOptions(MenuItemsEnum.Limits)"
    ) Add limit
  template(v-else)
    .tracking
      .option--header(v-if="isList")
        .option--header-left
          .option--header--title {{ MenuItemsEnum.Tracking }}
          .option--header--subtitle {{ "Statistic the spending time on the websites" }}
      .tracking--title.actions(v-else)
        button.tracking--back(@click="onBackClicked")
        .tracking--site-icon(
          :style="{ backgroundImage: `url(${hostTabSelected.icon})` }"
        )
        .tracking--site-name {{ hostTabSelected.domain }}
    .tracking--filter
      .filter
        button.filter--item(
            v-for="item in items",
            :class="{ active: selectedNavItem === item }",
            @click="selectedNavItem = item as PopupTrackerNavItemsEnum"
        ) {{ item }}
      calendar-slider
    template(v-if="isTotal")
      .site-info
        .site-info--usage
          .title Usage
        .time-info
          .item(v-for="item in usageMask(isList ? totalTime() : totalSessionTime())") {{ format(item, isList ? totalTime() : totalSessionTime(), true, false) }}
            span {{ item }}
        .tracker--sites-list(v-if="isList")
          sites-list(:is-show-current-session="false")
        .tracking--site-info(v-else)
            .tracking--site-board.total
                .tracking--site-title.total Visits
                .tracking--site-count.total {{ hostItem.sessions.length }}
            .tracking--site-board.total
                .tracking--site-title.total Longest Session
                .tracking--site-count.total {{ format(sessionMask(longestSession(hostItem), true), longestSession(hostItem), true, false) }}
            .tracking--site-board.total
                .tracking--site-title.total First visit
                .tracking--site-count.total {{format("DD.MM.YYYY", orderedSession([hostItem]))}}
            .tracking--site-board.total
                .tracking--site-title.total Last visit
                .tracking--site-count.total {{format("DD.MM.YYYY", orderedSession([hostItem], false))}}
            .tracking--site-board.total
                .tracking--site-title.total Most active day
                .tracking--site-count.total {{format("DD.MM.YYYY", activityOrder([hostItem]))}}
            .tracking--site-board.total
                .tracking--site-title.total Most inactive day
                .tracking--site-count.total {{format("DD.MM.YYYY", activityOrder([hostItem], false))}}
    template(v-else)
      template(v-if="isList")
        .site-info
          chart-bar
        .tracker--sites-list
            sites-list(:is-show-current-session="false")
      template(v-else)
        .tracking--site-info.board-between
          .tracking--site-board
            .tracking--site-title.total Usage
            .tracking--site-count.total {{ format(sessionMask(totalSessionTime(), true), totalSessionTime(), true, false) }}
          .tracking--site-board
            .tracking--site-title.total Visits
            .tracking--site-count.total {{ sessionCount(hostItem.sessions) }}
          .tracking--site-board
            .tracking--site-title.total Longest Session
            .tracking--site-count.total {{format(sessionMask(longestSession(hostItem), true), longestSession(hostItem), true, false)}}
        .site-info
           chart-bar
</template>

<script setup lang="ts">
import { defineProps, watch } from "vue";

import CirculLoader from "@/components/common/CirculLoader.vue";
import CalendarSlider from "@/components/common/CalendarSlider.vue";
import SitesList from "@/components/common/SitesList.vue";
import ChartBar from "@/components/common/ChartBar.vue";

import {
  isList,
  usageMask,
  PopupTrackerNavItemsEnum,
  selectedNavItem,
  isTotal,
  totalSessionTime,
  selectedHostName,
  hostTabSelected,
  showLoader,
  onBackClicked,
  totalTime,
  hostItem,
  longestSession,
  orderedSession,
  activityOrder,
  sessionCount,
  currentSession,
} from "@/composables/popupTrackerActions";
import { format, sessionMask } from "@/composables/common/dateComposable";
import { openOptions } from "@/composables/popup/popupActions";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { showTimeLoader } from "@/composables/common/timeCounter";

const props = defineProps({
  popupView: Boolean,
});

const items = Object.values(PopupTrackerNavItemsEnum);
</script>

<style scoped lang="scss">
.bar-chart {
  display: block;
  width: 381px;
  height: 283px;
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.filter {
  display: flex;
  box-sizing: border-box;
  height: 36px;
  max-width: 401px;

  &--item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25%;
    min-width: 100px;
    font-style: normal;
    font-weight: 700;
    font-size: 15px;
    line-height: 20px;
    color: var(--txt-dark-grey);

    &.active {
      color: var(--txt-dark-blue);
      background: var(--bttn-active-lightblue);
      border-radius: 6px;
    }
  }
}

.tracker {
  padding: 0 12px;

  &--nav-section {
    padding-bottom: 20px;
  }

  .tab-active {
    margin-top: 12px;
  }

  .site-info {
    &--header {
      display: flex;
      justify-content: space-between;
      height: 68px;
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
        font-weight: 400;
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

  &.dashboard {
    .sites {
      overflow: hidden;

      max-width: 540px;
      height: 100%;
      padding-bottom: 60px;
    }

    .tracking--site-info {
      &.board-between {
        .tracking--site-board {
          width: calc(33% - 8px);
        }
      }
    }
    .site-info {
      padding-bottom: 60px;

      .bar-chart {
        display: block;
        width: 100%;
        height: 320px;
      }

      .time-info {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;

        margin-bottom: 90px;

        .item {
          margin: 0 22px;

          &:nth-child(1),
          &:nth-child(2),
          &:nth-child(3) {
            font-weight: 700;
            font-size: 100px;
            line-height: 136px;
            text-align: center;
            color: var(--txt-main-darkblue);

            &::v-deep(span) {
              padding-left: 24px;

              font-weight: 700;
              font-size: 100px;
              line-height: 136px;
            }
          }

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
    }
  }
}
</style>
