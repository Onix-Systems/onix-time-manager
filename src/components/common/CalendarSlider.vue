<template lang="pug">
.calendar
  template(v-if="isTotal")
    .date {{ currentDate }}
  template(v-else)
    button.prev(@click="changeDate(-1)")
    .date {{ currentDate }}
    button.next(@click="changeDate(1)")
</template>

<script setup lang="ts">
import { computed } from "vue";

import {
  currentData,
  orderedSession,
  historyList,
  isTotal,
  selectedNavItem,
  isDetails,
  hostItem,
} from "@/composables/popupTrackerActions";
import { format } from "@/composables/common/dateComposable";

import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";

const currentDate = computed(() => {
  let data = "";
  const month = new Date(
    Date.UTC(2000, currentData.value.getMonth(), 1)
  ).toLocaleString("default", { month: "long" });
  const dayNumber = currentData.value.getDate().toString();
  const weekDayName = currentData.value.toLocaleString("en-US", {
    weekday: "long",
  });
  switch (selectedNavItem.value) {
    case PopupTrackerNavItemsEnum.day:
    case PopupTrackerNavItemsEnum.week:
      data = `${weekDayName}, ${dayNumber} ${month}`;
      break;
    case PopupTrackerNavItemsEnum.month:
      data = `${month} ${currentData.value.getFullYear()}`;
      break;
    case PopupTrackerNavItemsEnum.total:
      data = `Since ${format(
        "DD.MM.YYYY",
        isDetails.value
          ? orderedSession([hostItem.value])
          : orderedSession(historyList.value)
      )}`;
      break;
  }
  return data;
});

const changeDate = (direction: number) => {
  const newDate = new Date(currentData.value);
  switch (selectedNavItem.value) {
    case PopupTrackerNavItemsEnum.day: {
      newDate.setDate(currentData.value.getDate() + direction);
      break;
    }
    case PopupTrackerNavItemsEnum.week: {
      newDate.setDate(currentData.value.getDate() + direction * 7);
      break;
    }
    case PopupTrackerNavItemsEnum.month: {
      newDate.setMonth(currentData.value.getMonth() + direction);
      break;
    }
  }
  currentData.value = newDate;
};
</script>

<style scoped lang="scss">
.calendar {
  display: flex;
  align-items: center;
  height: 32px;
  button {
    width: 32px;
    height: 32px;
  }
  .prev {
    background-size: contain;
    background: url("@/assets/icons/arrow-left.svg") no-repeat center;
  }
  .next {
    background: url("@/assets/icons/arrow-left.svg") no-repeat center;
    transform: scaleX(-1);
  }
  .date {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 116px;
    height: 32px;
    padding: 0 12.5px;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 19px;
    color: var(--txt-dark-grey);
    background: var(--bttn-active-lightblue);
    border-radius: 6px;
  }
}
</style>
