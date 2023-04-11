<template lang="pug">
.date-picker(v-if="isOpen")
  .date-picker--title {{ "Select date" }}
  .date-picker--header
    .date-picker--year
      button.date-picker--arrow-prev(
        v-if="(datePickerGroup && prevMonth) || !datePickerGroup",
        @click="datePrev(currentDate, false)"
      )
      .current-date
        .current-date--year {{ currentDate.year }}
      button.date-picker--arrow-next(
        v-if="(datePickerGroup && nextMonth) || !datePickerGroup",
        @click="dateNext(currentDate, false)"
      )
    .date-picker--month
      button.date-picker--arrow-prev(
        v-if="(datePickerGroup && prevMonth) || !datePickerGroup",
        @click="datePrev(currentDate, true)"
      )
      .current-date
        .current-date--month {{ months[currentDate.month] }}
      button.date-picker--arrow-next(
        v-if="(datePickerGroup && nextMonth) || !datePickerGroup",
        @click="dateNext(currentDate, true)"
      )
  .date-picker--content
    .date-picker--week-days
      .date-picker--week-day(v-for="weekDay in days") {{ weekDay[0] }}
    .date-picker--days-content
      .date-picker--day-number-prev(
        v-for="day in countDaysPrev",
        :class="{ disable: true }"
      ) {{ day }}
      .date-picker--day-number(
        v-for="day in countDaysCurrent",
        @click="useDataRange(day, currentDate)"
      )
        .date-picker--day-number-useble(:class="isUseRange(day)")
          span {{ day }}
      .date-picker--day-number-next(
        v-for="day in countDaysNext",
        :class="{ disable: true }"
      ) {{ day }}
  .date-picker--btns
    button.cancel(@click="cancel") {{ "Cancel" }}
    button.save(@click="save") {{ "Save" }}
</template>

<script lang="ts" setup>
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  reactive,
  ref,
} from "vue";
import { DataPickerDate, DataPickerRange } from "@/types/dataPicker";
import moment from "moment";
const emit = defineEmits(["updatePrev", "updateNext", "formattedDateSelected"]);
const isOpen = ref(true);
const cancel = () => {
  isOpen.value = false;
};
const save = () => {
  isOpen.value = false;
};
const props = defineProps({
  width: { type: Number, default: 312 },
  datePickerGroup: { type: Boolean, default: false },
  prevMonth: { type: Boolean, default: false },
  nextMonth: { type: Boolean, default: false },
  currentData: Object as () => DataPickerDate,
  dateRange: Object as () => DataPickerRange,
});

onMounted(() => {
  currentDate.value.year = Number(new Date().getFullYear());
  currentDate.value.month = Number(new Date().getMonth());
  currentDate.value.day = Number(new Date().getDate());
  today.value = { ...currentDate.value };
});

const initialState: DataPickerDate = {
  year: 0 as number,
  month: 0 as number,
  day: 0 as number,
};

const today = ref({ ...initialState });

const date = ref({ ...initialState });

const days: string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const months: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const useDataRange = (day: number, currentDate: DataPickerDate) => {
  const formattedDate = moment({
    day: day,
    month: currentDate.month,
    year: currentDate.year,
  }).format("DD.MM.YYYY");

  // Обновляем данные выбранной даты
  date.value.year = currentDate.year;
  date.value.month = currentDate.month;
  date.value.day = day;
  currentData.day = day;
  emit("formattedDateSelected", formattedDate);
};

const isUseRange = (day: number) => {
  const classes: string[] = [];
  if (
    currentDate.value.year === date.value.year &&
    currentDate.value.month === date.value.month &&
    day === date.value.day
  ) {
    classes.push("active");
  }
  if (
    currentDate.value.year === today.value.year &&
    currentDate.value.month === today.value.month &&
    day === today.value.day
  ) {
    classes.push("today");
  }
  return classes;
};

const datePrev = (currentDate: DataPickerDate, isMonth: boolean) => {
  if (!currentDate.month && isMonth) {
    currentDate.month = 11;
  } else if (isMonth) {
    currentDate.month -= 1;
  }
  if (!isMonth) {
    currentDate.year -= 1;
  }
  emit("updatePrev");
};

const dateNext = (currentDate: DataPickerDate, isMonth: boolean) => {
  if (currentDate.month >= 11 && isMonth) {
    currentDate.month = 0;
  } else if (isMonth) {
    currentDate.month += 1;
  }
  if (!isMonth) {
    currentDate.year += 1;
  }
  emit("updateNext");
};

const currentData = reactive({ ...initialState });
const currentDate = computed(() => {
  return props.currentData ? props.currentData : currentData;
});

const firstDayOfMonth = computed((): any => {
  return new Date(currentDate.value.year, currentDate.value.month, 0).getDay();
});
const lastDayOfMonth = computed((): any => {
  return new Date(
    currentDate.value.year,
    currentDate.value.month,
    countDaysCurrent.value
  ).getDay();
});

const countDaysCurrent = computed(() => {
  return new Date(
    currentDate.value.year,
    currentDate.value.month + 1,
    0
  ).getDate();
});
const countDaysPrev = computed(() => {
  const countDays = new Date(
    currentDate.value.year,
    currentDate.value.year + 1,
    0
  ).getDate();
  const arrayDays: number[] = Array.from(
    { length: countDays },
    (_, i) => i + 1
  );
  return arrayDays.slice(countDays - firstDayOfMonth.value, countDays);
});
const countDaysNext = computed(() => {
  const countDays = new Date(
    currentDate.value.year,
    currentDate.value.month + 2,
    0
  ).getDate();
  const column: number =
    (countDaysPrev.value.length +
      countDaysCurrent.value +
      7 -
      lastDayOfMonth.value) /
    7;
  const arrayDays: number[] = Array.from(
    { length: countDays },
    (_, i) => i + 1
  );
  return arrayDays.slice(0, (column < 6 ? 14 : 7) - lastDayOfMonth.value);
});
</script>

<style scoped lang="scss">
.date-picker {
  height: max-content;
  box-sizing: border-box;
  width: 312px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  border-radius: 6px;

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                              not supported by any browser */
  &--title {
    margin-bottom: 12px;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    color: #000000;
  }
  &--header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    .current-date {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      &--month {
        margin-right: 5px;
      }
    }
  }
  .current-date--year {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    text-align: center;
    color: #000000;
  }
  .current-date--month {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    text-align: center;
    color: #000000;
  }
  &--year,
  &--month {
    display: flex;
  }
  &--btns {
    display: flex;
    justify-content: flex-end;
    gap: 26px;
  }
  .save,
  .cancel {
    cursor: pointer;
    padding: 0;
    border: none;
    background: inherit;
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #4477d4;
  }
  &--current-date {
    width: 100%;
  }
  &--arrow {
    &-prev,
    &-next {
      cursor: pointer;
      width: 26px;
      height: 26px;
      border: none;
      padding: 5px 0 0;
      background: inherit;
      &:before {
        content: "";
        border: solid black;
        border-width: 0 2px 2px 0;
        display: inline-block;
        padding: 2px;
      }
    }
    &-prev {
      &:before {
        transform: rotate(135deg);
        -webkit-transform: rotate(135deg);
      }
    }
    &-next {
      &:before {
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
      }
    }
  }
  &--content {
    display: flex;
    flex-direction: column;
    margin: 12px 0 21px 0;
  }
  &--week-day {
    cursor: default;
    -webkit-user-select: none;
    user-select: none;
    overflow: hidden;

    width: 26px;
    height: auto;

    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    text-align: center;

    color: #76797d;
  }
  &--week-days {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  &--days-content {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    min-width: 272px;
  }
  &--day-number,
  &--day-number-prev,
  &--day-number-next {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 17px;
    width: 26px;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    text-align: center;
  }
  &--day-number {
    &-useble {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: calc(100% - 2px);
      &.active,
      &:hover {
        position: relative;
        &::before {
          z-index: 1;
          content: "";
          position: absolute;
          background: #4477d4;
          border: none;
          border-radius: 50%;
          width: 26px;
          height: 26px;
        }
        span {
          color: white;
          z-index: 2;
        }
      }
      &.today {
        position: relative;
        &::before {
          z-index: 1;
          content: "";
          position: absolute;
          border: 1px solid #4477d4;
          border-radius: 50%;
          width: 26px;
          height: 26px;
        }
        span {
          z-index: 2;
        }
      }
    }
    &-next,
    &-prev {
      &.disable {
        color: #c3c3c3;
      }
    }
  }
}
</style>
