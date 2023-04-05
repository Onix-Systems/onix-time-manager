<template lang="pug">
.home-page
  .home-page--switcher
    button.home-page--week(:class="isActive(0)", @click="editWeek(0)") {{ "Week" }}
    button.home-page--day(:class="isActive(1)", @click="editWeek(1)") {{ "Day" }}
  .home-page--prew
    span {{ `${isWeek ? "Today" : "Prev week"} (${sortedData.length} sites)` }}
    span {{ formatTime(totalValue, false) }}
  .home-page--chart
    dought-chart
    history-list
  .home-page--table
    .item(v-for="item in currentItems")
      .name {{ item }}
      .info {{ dayData[item] }}
</template>

<script setup lang="ts">
import DoughtChart from "./DoughtChart.vue";
import HistoryList from "./HistoryList.vue";
import { computed } from "vue";
import {
  isWeek,
  editWeek,
  topTasks,
  activeSite,
  sortedData,
  totalValue,
  formatTime,
} from "@/composables/chartConfig";

const itemsDay = [
  "Domain",
  "Visits",
  "Time spent",
  "Last visit",
  "First visit",
];
const activeItem = computed(() => topTasks.value[activeSite.value]);
const activeItemOneDay = computed(() => {
  if (activeItem.value) {
    return activeItem.value.history[0];
  } else return "";
});
const dayData = computed(() => {
  if (activeItem.value && isWeek.value) {
    return {
      Domain: activeItem.value.url,
      Visits: activeItemOneDay.value.visited,
      "Time spent": formatTime(activeItemOneDay.value.timeSpent, true, true),
      "Last visit": activeItem.value.lastOpen,
      "First visit": activeItem.value.firstOpen,
    };
  } else if (activeItem.value && !isWeek.value) {
    const time = activeItem.value.history.reduce(
      (acc: any, curr: any) => acc + curr.timeSpent,
      0
    );
    return {
      Domain: activeItem.value.url,
      Visits: activeItem.value.history.reduce(
        (acc: any, curr: any) => acc + curr.visited,
        0
      ),
      "Time spent": formatTime(time, true, true),
      "Last visit": activeItem.value.lastOpen,
      "First visit": activeItem.value.firstOpen,
      "Daily average": formatTime(
        time / activeItem.value.history.length,
        true,
        true
      ),
      "Most active day": activeItem.value.history.reduce(
        (acc: any, curr: any) => {
          if (curr.timeSpent > acc) {
            return curr.day;
          } else {
            return acc;
          }
        },
        0
      ),
    };
  }
  return "";
});

const itemsWeek = ["Daily average", "Most active day"];

const currentItems = computed(() => {
  return isWeek.value ? itemsDay : itemsDay.concat(itemsWeek);
});

const isActive = (index: number) => {
  return index === isWeek.value ? "active" : "";
};
</script>

<style scoped lang="scss">
.home-page {
  width: 669px;
  margin: 0 auto;
  padding: 20px 0 70px 0;
  &--switcher {
    padding: 2px;
    width: 324px;
    height: 37px;
    margin: 0 auto 38px;
    border-radius: 8px;
    background: #4196db;
    button {
      cursor: pointer;
      padding: 0;
      width: 50%;
      height: 100%;
      font-style: normal;
      font-weight: 700;
      font-size: 14px;
      line-height: 17px;
      color: white;
      background: inherit;
      border: none;
      &.active {
        background: white;
        border-radius: 6px;
        color: black;
      }
    }
  }
  &--prew {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: 100%;
    margin-bottom: 42px;
    padding: 16px 0;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    border-radius: 8px;
    background: #ecf3fa;
  }
  &--chart {
    display: flex;
    &::v-deep(.dought) {
      width: 50%;
    }
  }
  &--table {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 36px;
    padding: 32px;
    background: #ecf3fa;
    border-radius: 8px;
    .item {
      display: flex;
      justify-content: space-between;
      padding: 14px 16px 13px 16px;
      font-style: normal;
      font-size: 16px;
      line-height: 19px;
      border-bottom: 1px solid black;
      &:last-child {
        border-bottom: none;
        padding: 14px 16px;
      }
      .name {
        font-weight: 700;
      }
      .info {
        font-weight: 600;
      }
    }
  }
}
</style>
