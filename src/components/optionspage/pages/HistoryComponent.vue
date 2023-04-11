<template lang="pug">
.container
  .history(v-if="historyList.length > 0")
    .filter
      input.search(
        type="text",
        placeholder="Enter site name",
        v-model="searchText",
        @input="filterTasks"
      )
      .time-block
        .time(@click="showStartDatePicker = !showStartDatePicker")
          input(v-model="startDate", placeholder="From")
          img(src="@/assets/calendar.svg")
        date-picker.time-start(
          @formattedDateSelected="onStartDate",
          v-if="showStartDatePicker"
        )
        .time(@click="showEndDatePicker = !showEndDatePicker")
          input(v-model="endDate", placeholder="To")
          img(src="@/assets/calendar.svg")
        date-picker.time-end(
          v-if="showEndDatePicker",
          @formattedDateSelected="onEndDate"
        )
    table.history-page--table
      h4(@click="toggleSortBy", :class="{ active: showSortBy }") Sort by:
      .select(v-show="showSortBy")
        p(@click="sortByVisits") Visits
        p(@click="sortByLastVisit") Last Visit
        p(@click="sortByTime") Time
      tr.history-page--title
        th Domain
        th Visits
        th Last visit
        th Time spent
      tr.history-page--table(
        v-for="(task, index) in historyList",
        :key="`History_key__${index}`"
      )
        td {{ task.url }}
        td {{ task.visited }} visits
        td {{ task.firstOpen }}
        td {{ formatTime(task.timeSpent, true, true) }}
  .history(v-else-if="historyList.length === 0")
    .filter
      input.search(
        type="text",
        placeholder="Enter site name",
        v-model="searchText",
        @input="filterTasks"
      )
      .time-block
        .time(@click="showStartDatePicker = !showStartDatePicker")
          input(v-model="startDate")
          img(src="@/assets/calendar.svg")
        date-picker.time-start(
          @formattedDateSelected="onStartDate",
          v-if="showStartDatePicker"
        )
        .time(@click="showEndDatePicker = !showEndDatePicker")
          input(v-model="endDate")
          img(src="@/assets/calendar.svg")
        date-picker.time-end(
          v-if="showEndDatePicker",
          @formattedDateSelected="onEndDate"
        )
      button.reset(@click="resetFilters")
    .history-refresh
      img(src="@/assets/blue-screen.png")
      p We're sorry, but we couldn't find any results that match your search criteria.
      p Additionally, please check the date range you've selected to ensure that it includes current history listings. If you're still not finding what you're looking for, you can try searching without a date range or using different keywords. Or you can reset your filters .
      button(@click="resetFilters") Reset filters
  .history-refresh(v-else-if="!dataLoaded")
    img(src="@/assets/blue-screen-error.png")
    p No history found. It appears that this is your first time using this application.
    p P Please note that some features may not be available until you have built up a history of usage. We recommend using the application regularly to maximise your experience.
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, reactive } from "vue";
import moment, { Moment } from "moment";

import {
  isWeek,
  editWeek,
  topTasks,
  activeSite,
  sortedData,
  totalValue,
  formatTime,
} from "@/composables/chartConfig";
import DatePicker from "@/components/common/DatePicker.vue";
const tasks = topTasks.value.map((task: any) => task);
const showSortBy = ref(false);
const dataLoaded = ref(false);
const toggleSortBy = () => {
  showSortBy.value = !showSortBy.value;
};
const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);
const items = ref([{}]);
let startDate = ref<Moment | null>(null);
let endDate = ref<Moment | null>(null);
const searchText = ref("");
let sortOrder = ref("time-descending");

const activeAccordionIndex = ref(-1);
const onEndDate = (formattedDate: any) => {
  endDate.value = formattedDate;
};
const onStartDate = (formattedDate: any) => {
  startDate.value = formattedDate;
};
const toggleAccordion = (index: number) => {
  if (activeAccordionIndex.value === index) {
    activeAccordionIndex.value = -1;
  } else {
    activeAccordionIndex.value = index;
  }
};
let historyList = computed(() => {
  let filtered = searchMeth();
  if (startDate.value && endDate.value) {
    filtered = dateSearchMeth(filtered);
  }
  filtered = sorting(filtered);
  return filtered;
});

const searchMeth = () => {
  const search = searchText.value.toLowerCase();
  dataLoaded.value = true;
  return tasks.filter((task: { url: string }) =>
    task.url.toLowerCase().includes(search)
  );
};

const dateSearchMeth = (tasks: any) => {
  dataLoaded.value = true;
  const start = moment(startDate.value);
  const end = moment(endDate.value);
  return tasks.filter((task: any) =>
    moment(task.firstOpen, "DD.MM.YYYY").isBetween(start, end, null, "[]")
  );
};
enum Order {
  time = "time",
  visited = "visited",
  timeSpent = "timeSpent",
}
const sorting = (tasks: any) => {
  let condition = false;
  switch (sortOrder.value) {
    case Order.time: {
      return tasks.sort((a: any, b: any) =>
        moment(b.firstOpen).diff(a.firstOpen)
      );
    }
    case Order.visited: {
      return tasks.sort((a: any, b: any) => b.visited - a.visited);
    }
    default: {
      return tasks.sort((a: any, b: any) => b.timeSpent - a.timeSpent);
    }
  }
};
const sortByVisits = () => {
  sortOrder.value = Order.visited;
};
const sortByLastVisit = () => {
  sortOrder.value = Order.time;
};
const sortByTime = () => {
  sortOrder.value = Order.timeSpent;
};
const resetFilters = () => {
  startDate.value = null;
  endDate.value = null;
  searchText.value = "";
  sortOrder.value = "time-descending";
};
</script>

<style lang="scss">
.container {
  padding: 30px;
  .history {
    width: 700px;
    margin: 0 auto;
    &-refresh {
      margin: 32px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 674px;
      height: 403px;
      background: #ecf3fa;
      border-radius: 12px;
      p {
        font-family: Inter, sans-serif;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        color: #000000;
        margin: 0 74px 26px;
      }
      img {
        margin: 32px auto 26px;
      }
      button {
        padding: 0px 16px;
        height: 38px;
        background: #f0c020;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 4px;
        font-family: Inter, sans-serif;
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 17px;
        color: #000000;
      }
    }
    h2 {
      margin: 20px;
      font-weight: bold;
      font-size: 30px;
    }
    &-page {
      &--title {
        background: #dcdcdc;
        width: 674px;
        padding: 16px;
        th {
          text-align: left;
          padding: 16px;
        }
        h1:first-child {
          width: 243px;
        }
        h1 {
          font-family: Inter, sans-serif;
          font-style: normal;
          font-weight: 700;
          font-size: 18px;
          line-height: 22px;
          color: #000000;
        }
      }
      &--table {
        background: #ecf3fa;
        width: 674px;
        height: auto;
        margin-top: 32px;
        .select {
          position: absolute;
          width: 151px;
          height: 149px;
          background: #ffffff;
          box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.45);
          border-radius: 6px;
          padding: 12px 16px;
          p {
            font-family: "Inter";
            font-style: normal;
            font-weight: 600;
            font-size: 16px;
            line-height: 19px;
            color: #000000;
            cursor: pointer;
            margin: 22px 0 24px;
          }
        }
        td {
          padding: 16px;
          font-family: Inter, sans-serif;
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 17px;
          color: #000000;
        }
        h4 {
          cursor: pointer;
          font-family: Inter, sans-serif;
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 17px;
          color: #000000;
          padding: 16px;
        }
        h4::after {
          display: inline-block;
          content: "";
          background-image: url("@/assets/Vector.svg");
          width: 9px;
          height: 5px;
          margin: 0 0 2px 8px;
        }
        th {
          font-family: Inter, sans-serif;
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 17px;
          color: #000000;
          margin-right: 12px;
        }
      }
    }
    &__block {
      display: flex;
      justify-content: space-between;
      height: 40px;
      margin: 20px;
      box-shadow: 0 -1px 5px 0 rgb(0 0 0 / 9%), 0 1px 4px 0 rgb(0 0 0 / 12%);
      border-radius: 10px;
      padding: 5px;
      align-items: center;
      position: relative;
      z-index: 2;
      b {
        font-weight: bold;
        cursor: pointer;
        margin-left: 5px;
        width: 50%;
        display: flex;
        flex-direction: column;
      }
      p {
        width: 25%;
      }
    }
    &__accordion {
      height: 40px;
      margin: -10px 20px 20px;
      box-shadow: 0 -1px 5px 0 rgb(0 0 0 / 9%), 0 1px 4px 0 rgb(0 0 0 / 12%);
      padding: 15px;
      position: relative;
      z-index: 1;
    }
  }
  .block-img {
    width: 28px;
    height: 28px;
    margin: 3px 15px 5px 3px;
    img {
      height: 28px;
    }
  }
  .block-text {
    width: 300px;
  }
  .span {
    &-percent {
      color: black;
      font-size: 12px;
      text-align: right;
      margin-left: auto;
      margin-right: 50px;
    }
    &-time {
      color: #c5c3c3;
      font-weight: 700;
      text-align: right;
      margin-left: auto;
      margin-right: 15px;
    }
  }
  input.search {
    width: 331px;
    background: #ecf3fa;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    padding: 14px 14px 14px 12px;
    border: none;
    margin-right: 16px;
  }
  input::placeholder {
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: #3e4552;
    opacity: 0.5;
  }
  .filter {
    display: flex;
    margin-top: 77px;
    .time-block {
      position: relative;
      display: flex;
    }
    .time-start {
      position: absolute;
      right: 26px;
      top: 57px;
    }
    .time-end {
      position: absolute;
      right: 26px;
      top: 57px;
    }
    .time {
      display: flex;
      justify-content: space-between;
      align-self: center;
      padding: 14px 12px;
      width: 116px;
      background: #ecf3fa;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      border-radius: 4px;
      cursor: pointer;
      input {
        width: 77px;
        background: transparent;
        border: none;
        font-family: Inter, sans-serif;
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 17px;
        color: #3e4552;
      }
      &:first-child {
        margin-right: 16px;
      }
      img {
        height: 20px;
      }
      p {
        font-family: Inter, sans-serif;
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 17px;
        color: #3e4552;
      }
    }
    .reset {
      display: inline-block;
      background-image: url("@/assets/reset.svg");
      width: 28px;
      height: 28px;
      border: none;
      margin-top: 10px;
      cursor: pointer;
      margin-left: 16px;
    }
  }
}
</style>
