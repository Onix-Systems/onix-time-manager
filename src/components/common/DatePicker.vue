<template lang="pug">
.date-picker
  .date-picker-padding
    .date-picker-dates
      .date-picker--header
        .date-picker--year
          .current-date
            .current-date--info {{ `${months[currentDate.month]} ${currentDate.year}` }}
          .date-picker--actions
            button.date-picker--arrow-prev(
              v-if="(datePickerGroup && prevMonth) || !datePickerGroup",
              @click="datePrev(currentDate)"
            )
            button.date-picker--arrow-next(
              v-if="(datePickerGroup && nextMonth) || !datePickerGroup",
              @click="dateNext(currentDate)"
            )
      .date-picker--content
        .date-picker--week-days
          .date-picker--week-day(v-for="weekDay in days") {{ weekDay[0] }}
        .date-picker--days-content
          template(v-if="false")
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
          template(v-if="false")
            .date-picker--day-number-next(
              v-for="day in countDaysNext",
              :class="{ disable: true }"
            ) {{ day }}
    .date-picker--btns
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
import moment from "moment";
import { DayOfWeek, Month } from "@/constants/DateEnum";
import { useClickOutside } from "@/composables/clickOutside";
const emit = defineEmits([
  "updatePrev",
  "updateNext",
  "formattedDateSelected",
  "update:isOpen",
  "cancel",
]);
const cancel = () => {
  emit("cancel");
};
const save = () => {
  emit("update:isOpen");
  emit("formattedDateSelected", formattedDate.value);
};
const props = defineProps({
  isOpen: { type: Boolean, default: false },
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
  if (props.currentData) {
    const date = props.currentData;
    date.month = date.month - 1;
    useDataRange(date.day, date);
  } else {
    useDataRange(currentDate.value.day, currentDate.value);
  }
});

const initialState: DataPickerDate = {
  year: 0 as number,
  month: 0 as number,
  day: 0 as number,
};

const today = ref({ ...initialState });

const date = ref({ ...initialState });

const formattedDate = ref("");

const days: string[] = Object.keys(DayOfWeek);
const months: string[] = Object.keys(Month);
const useDataRange = (day: number, currentDate: DataPickerDate) => {
  const formatted = moment({
    day: day,
    month: currentDate.month,
    year: currentDate.year,
  }).format("MM.DD.YYYY");

  // Обновляем данные выбранной даты
  date.value.year = currentDate.year;
  date.value.month = currentDate.month;
  date.value.day = day;
  currentData.day = day;
  formattedDate.value = formatted;
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

const datePrev = (currentDate: DataPickerDate) => {
  if (!currentDate.month) {
    currentDate.month = 11;
    currentDate.year -= 1;
  } else {
    currentDate.month -= 1;
  }
  emit("updatePrev");
};

const dateNext = (currentDate: DataPickerDate) => {
  if (currentDate.month >= 11) {
    currentDate.month = 0;
    currentDate.year += 1;
  } else {
    currentDate.month += 1;
  }
  emit("updateNext");
};

let currentData = reactive({ ...initialState });
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
  top: 25px;
  height: 404px;
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
    display: flex;
    justify-content: flex-end;
    gap: 26px;
    padding: 0 13px;
  }
  .save,
  .cancel {
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
  .save {
    color: var(--txt-dark-blue);
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
      height: calc(100% - 2px);
      &.active,
      &:hover {
        position: relative;
        &::before {
          z-index: 1;
          content: "";
          position: absolute;
          background: var(--txt-dark-blue);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
        span {
          color: white;
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
