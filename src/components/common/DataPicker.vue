<template lang="pug">
.date-picker
  .date-picker-padding
    .date-picker-dates
      .date-picker--header
        .date-picker--year
          .current-date
            .current-date--info {{ `${months[currentDate.month]} ${currentDate.year}` }}
          .date-picker--actions
            button.date-picker--arrow-prev(@click="datePrev(currentDate)")
            button.date-picker--arrow-next(@click="dateNext(currentDate)")
      .date-picker--content
        .date-picker--week-days
          .date-picker--week-day(v-for="weekDay in days") {{ weekDay[0] }}
        .date-picker--days-content
          .date-picker--day-number-prev(
            v-for="day in countDaysPrev",
            :class="{ disable: true }"
          )
          .date-picker--day-number(
            v-for="day in countDaysCurrent",
            @click="useDataRange(day, currentDate)"
          )
            .date-picker--day-number-useble(
              :class="isUseRange(day, currentDate)"
            )
              span {{ day }}
          .date-picker--day-number-next(
            v-for="day in countDaysNext",
            :class="{ disable: true }"
          )
    .date-picker--btns
      button.clear(@click="$emit('update:clear')") {{ "Clear" }}
      button.cancel(@click="cancel") {{ "Cancel" }}
      button.save(@click="save") {{ "OK" }}
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
import { DayOfWeek, Month } from "@/constants/DateEnum";

const props = defineProps({
  dateRange: Object as () => DataPickerRange,
});

const emit = defineEmits(["update:save", "update:cancel", "update:clear"]);
const cancel = () => {
  emit("update:cancel");
};
const save = () => {
  if (dateRange.from.year && !dateRange.to.year) {
    dateRange.to = dateRange.from;
  }
  emit("update:save", dateRange);
};

onMounted(() => {
  currentDate.value.year = Number(new Date().getFullYear());
  currentDate.value.month = Number(new Date().getMonth());
  currentDate.value.day = Number(new Date().getDate());

  if (props.dateRange) {
    dateRange.from = props.dateRange.from;
    dateRange.to = props.dateRange.to;
  }
});

const initialState: DataPickerDate = {
  year: 0 as number,
  month: 0 as number,
  day: 0 as number,
};

const days: string[] = Object.keys(DayOfWeek);
const months: string[] = Object.keys(Month);

const dateRange: DataPickerRange = reactive({
  from: { ...initialState },
  to: { ...initialState },
});

const dateFrom = computed(() => {
  return new Date(
    dateRange.from.year,
    dateRange.from.month,
    dateRange.from.day
  );
});

const dateTo = computed(() => {
  return new Date(dateRange.to.year, dateRange.to.month, dateRange.to.day);
});

const isFrom = ref(true);
const useDataRange = (day: number, currentDate: DataPickerDate) => {
  if (dateRange.from.year && dateRange.to.year) {
    dateRange.from = { ...initialState };
    dateRange.to = { ...initialState };
  }
  if (!dateRange.from.year) {
    dateRange.from.year = currentDate.year;
    dateRange.from.month = currentDate.month;
    dateRange.from.day = day;
    dateRange.to = { ...initialState };
  } else {
    dateRange.to.year = currentDate.year;
    dateRange.to.month = currentDate.month;
    dateRange.to.day = day;
  }
  const copyFrom = { ...dateRange.from };
  const copyTo = { ...dateRange.to };

  if (
    dateRange.from.day &&
    dateRange.to.day &&
    dateFrom.value.valueOf() < dateTo.value.valueOf()
  ) {
    dateRange.from = copyTo;
    dateRange.to = copyFrom;
  }
  isFrom.value = !isFrom.value;
};

const forDay = (day: number, currentDate: DataPickerDate) => {
  return new Date(currentDate.year, currentDate.month, day);
};

const isUseRange = (day: number, currentDate: DataPickerDate) => {
  const classes: string[] = [];
  if (
    dateRange.from.day &&
    dateRange.to.day &&
    dateFrom.value.valueOf() >= forDay(day, currentDate).valueOf() &&
    forDay(day, currentDate).valueOf() >= dateTo.value.valueOf()
  ) {
    classes.push("active");
    if (forDay(day, currentDate).valueOf() === dateFrom.value.valueOf()) {
      classes.push("to");
    }
    if (forDay(day, currentDate).valueOf() === dateTo.value.valueOf()) {
      classes.push("from");
    }
  }
  if (
    forDay(day, currentDate).valueOf() ===
    new Date().setHours(0, 0, 0, 0).valueOf()
  ) {
    classes.push("today");
  }
  if (
    forDay(day, currentDate).valueOf() === dateFrom.value.valueOf() ||
    forDay(day, currentDate).valueOf() === dateTo.value.valueOf()
  ) {
    classes.push("ball");
  }
  return classes;
};

const datePrev = (currentDate: DataPickerDate) => {
  if (!currentDate.month) {
    currentDate.month = 11;
    currentDate.year -= 1;
  } else {
    currentDate.month -= 1;
  }
};

const dateNext = (currentDate: DataPickerDate) => {
  if (currentDate.month >= 11) {
    currentDate.month = 0;
    currentDate.year += 1;
  } else {
    currentDate.month += 1;
  }
};

const currentData = reactive({ ...initialState });
const currentDate = computed(() => {
  return currentData;
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  position: absolute;
  top: 52px;
  box-sizing: border-box;
  width: 360px;
  padding: 20px;
  background: var(--white);
  border: 1px solid var(--bttn-active-lightblue);
  border-radius: 6px;

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                              not supported by any browser */

  &-padding {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  &-dates {
    display: flex;
    flex-direction: column;
  }
  &--title {
    margin-bottom: 12px;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    color: var(--txt-dark-blue);
  }
  &--header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 15px;
    .current-date {
      display: flex;
      justify-content: center;
      align-items: center;
      width: max-content;
      &--info {
        font-family: Roboto, sans-serif;
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        color: var(--txt-dark-blue);
      }
    }
  }
  &--year,
  &--month {
    display: flex;
    justify-content: space-between;
    padding: 0 13px;
  }
  &--btns {
    position: relative;
    display: flex;
    justify-content: flex-end;
    gap: 26px;
    padding: 0 13px;
  }
  .save,
  .cancel,
  .clear {
    cursor: pointer;
    padding: 0;
    border: none;
    background: inherit;
    font-family: Roboto, sans-serif !important;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;

    color: var(--txt-dark-grey);
  }
  .save,
  .clear {
    color: var(--txt-dark-blue);
  }
  .clear {
    position: absolute;
    left: 13px;
  }
  &--current-date {
    width: 100%;
  }
  &--actions {
    display: flex;
    gap: 20px;
  }
  &--arrow {
    &-prev,
    &-next {
      cursor: pointer;
      width: 26px;
      height: 26px;
      border: none;
      background: inherit;
      &:before {
        content: "";
        border: solid black;
        border-width: 0 2px 2px 0;
        display: inline-block;
        padding: 3px;
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
  }
  &--week-day {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    -webkit-user-select: none;
    user-select: none;
    overflow: hidden;

    width: 48px;
    height: 48px;

    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    color: var(--txt-dark-grey);
  }
  &--week-days {
    display: flex;
  }
  &--days-content {
    display: flex;
    flex-wrap: wrap;
    min-width: 272px;
  }
  &--day-number,
  &--day-number-prev,
  &--day-number-next {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;

    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    color: var(--txt-dark-grey);
  }
  &--day-number {
    &-useble {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      &.ball,
      &.today {
        position: relative;
        &:hover {
          background: inherit;
        }
        &::before {
          z-index: 1;
          content: "";
          position: absolute;
          background: var(--txt-dark-blue);
          border: none;
          border-radius: 8px;
          width: 100%;
          height: 100%;
          &:hover {
            background: #ceddf2;
          }
        }
        &.from,
        &.from.today {
          &::before {
            border-bottom-right-radius: 0;
            border-top-right-radius: 0;
          }
        }
        &.to,
        &.to.today {
          &::before {
            border-bottom-left-radius: 0;
            border-top-left-radius: 0;
          }
        }
        span {
          color: white;
          z-index: 2;
        }
      }

      &:hover {
        background-color: #ceddf2;
      }

      &.today {
        &::before {
          border-radius: 50%;
        }
        &.active {
          &::before {
            background: inherit;
          }
          span {
            color: var(--txt-dark-grey);
          }
        }
        &.ball {
          &::before {
            border-radius: 8px;
          }
        }
      }

      &.active {
        background-color: #e5f0ff;
        &:hover {
          background-color: #ceddf2;
        }
        &.from.to {
          &::before {
            border-radius: 8px;
          }
        }
      }
      &.from,
      &.to {
        background-color: inherit;
        &:hover {
          background-color: inherit;
        }
        &.today {
          &::before {
            border-radius: 8px;
            background: var(--txt-dark-blue);
          }
          span {
            color: white;
          }
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
