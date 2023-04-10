<template lang="pug">
.activity
  h2 Todays Activity
  dought-chart(:chart-data="chartData")
  .activity__block
    .activity__block_box(v-for="item in currentItems")
      p {{ item }}
      h2 {{ dayData[item] }}
    .activity__block_box
      p in total
      h2 {{ formatTime(totalValue, true, true) }}
</template>
<script lang="ts" setup>
import { defineComponent, ref } from "vue";
import DoughtChart from "@/components/common/DoughtChart.vue";
import { computed } from "vue";
import {
  isWeek,
  topTasks,
  activeSite,
  formatTime,
  totalValue,
} from "@/composables/chartConfig";

const itemsDay = ["on this website"];

const activeItem = computed(() => topTasks.value[activeSite.value]);
const activeItemOneDay = computed(() => {
  if (activeItem.value) {
    return activeItem.value.history[0];
  } else return "";
});
const dayData = computed(() => {
  if (activeItem.value && isWeek.value) {
    return {
      "on this website": formatTime(
        activeItemOneDay.value.timeSpent,
        true,
        true
      ),
    };
  } else if (activeItem.value && !isWeek.value) {
    const time = activeItem.value.history.reduce(
      (acc: any, curr: any) => acc + curr.timeSpent,
      0
    );
    return {
      "on this website": formatTime(time, true, true),
    };
  }
  return "";
});

const currentItems = computed(() => {
  return itemsDay;
});
</script>

<style lang="scss">
.activity {
  background: #f7f7f7;
  padding: 16px 20px;
  h2 {
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 22px;
    color: #000000;
  }
  &__block {
    width: 385px;
    height: 85px;
    margin: 26px 0 16px;
    background: #ffffff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    &_box:first-child {
      border-right: 1px solid #e6e6e6;
      padding-right: 38px;
    }
    &_box:last-child {
      padding-left: 26px;
    }
    p {
      text-align: center;
      font-family: Inter, sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 15px;
      color: #585858;
      margin-bottom: 4px;
    }
    h2.activity__block_box {
      text-align: center;
    }
  }
}
</style>
