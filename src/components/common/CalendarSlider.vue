<template lang="pug">
.calendar
  button.prev(v-if="!isTotal", @click="changeDate(-1)")
  .date {{ currentDate }}
  button.next(v-if="!isTotal", @click="changeDate(1)")
</template>

<script setup lang="ts">
import {
  historyStorage,
  isTotal,
  selectedNavItem,
  sinceData,
} from "@/composables/common/trackerPageActions";
import {
  currentData,
  changeDate,
  parseDate,
} from "@/composables/common/dateComposable";
import { computed } from "vue";
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
      data = `Since ${
        sinceData.value
          ? parseDate(sinceData.value)
          : parseDate(new Date().toString())
      }`;
      break;
  }
  return data;
});
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
