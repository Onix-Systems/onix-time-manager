<template lang="pug">
.schedule-dropdown
  dropdown-component(:disable="disable")
    template(v-slot:selectedItem="props")
      .selected-option(v-if="UserData.selectOption !== Options.Weekly") {{ UserData.selectOption }}
      .selected-option(v-else) {{ showText(props) }}
    template(v-slot:content="props")
      .option-item(
        v-if="isShow(Options.Today)",
        @click="selectItem(Options.Today, props)"
      ) {{ Options.Today }}
      .option-item(
        v-if="isShow(Options.EveryDay)",
        @click="selectItem(Options.EveryDay, props)"
      ) {{ Options.EveryDay }}
      .option-item-line
      .option-item(
        v-if="isShow(Options.Daily)",
        @click="selectItem(Options.Daily)"
      ) {{ Options.Daily }}
      .option-item(
        v-if="isShow(Options.Weekly)",
        @click="selectItem(Options.Weekly)"
      ) {{ Options.Weekly }}
      .option-item.option-item-column(
        v-if="UserData.selectOption.includes(Options.Daily)"
      )
        .option-item-actions
          .option-item-text {{ "Every" }}
          input.option-item-input(
            v-model="storage.daily",
            @keypress="parseInput($event)",
            type="number"
          )
          .option-item-text {{ "day(s)" }}
        .option-item--btns
          button.option-item--btns-cancel(@click="selectItem(Options.Today)") {{ "Cancel" }}
          button.option-item--btns-save(
            @click="save('daily', storage.daily, props)"
          ) {{ "Save" }}
      .option-item.option-item-column(
        v-if="UserData.selectOption.includes(Options.Weekly)"
      )
        .option-item-actions
          .option-item-text {{ "Every week(s) on" }}
        .option-item-days
          button.option-item-day(
            v-for="item in Object.keys(DayOfWeek)",
            @click="check(item)",
            :class="{ active: isActiveDay(item) }"
          )
            .option-item-day-text {{ item.slice(0, 1) }}
        .option-item--btns
          button.option-item--btns-cancel(@click="selectItem(Options.Today)") {{ "Cancel" }}
          button.option-item--btns-save(
            @click="save('weekly', storage.weekly, props)"
          ) {{ "Save" }}
</template>

<script setup lang="ts">
import DropdownComponent from "@/components/common/DropdownComponent";
import { editSchedule, UserData } from "@/composables/scheduleComp";
import { ref, defineProps } from "vue";
import { DayOfWeek, Options } from "@/constants/DateEnum";
import { ScheduleInterface } from "@/types/dataInterfaces";
import { dayData } from "@/composables/common/dateComposable";

const propsFirst = defineProps({
  disable: Boolean,
});
const storage = ref({ ...UserData.value } as ScheduleInterface);
storage.value.weekly = Object.entries(storage.value.weekly).map(
  ([key, value]) => value
);

const showText = (props: any) => {
  if (storage.value.weekly.length && !props.openMenu) {
    const data = Object.entries(UserData.value.weekly).map(
      ([key, value]) => `${value.slice(0, 3)}.`
    );
    data.join(",");
    return `Every ${data}`;
  } else {
    return Options.Weekly;
  }
};

const isShow = (item: Options) => {
  if (
    UserData.value.selectOption.includes(Options.Daily) ||
    UserData.value.selectOption.includes(Options.Weekly)
  ) {
    return false;
  }
  return !UserData.value.selectOption.includes(item);
};

const isActiveDay = (item: string) => {
  if (storage.value.weekly.length) {
    return storage.value.weekly.find((i) => i === item);
  }
  return false;
};

const check = (item: string) => {
  const data = storage.value.weekly;
  if (isActiveDay(item)) {
    let index = data.indexOf(item);
    data.splice(index, 1);
  } else {
    data.push(item);
  }
  storage.value.weekly = data;
};

const save = (key: string, data: any, props: any) => {
  if (data) {
    editSchedule(key, data);
  }
  props.toggleVisibility();
};

const parseInput = (evt: any) => {
  const condition = Number(String(storage.value.daily) + String(evt.key));
  if (condition && condition <= 7) {
    return;
  }
  evt.preventDefault();
};

const selectItem = (name: string, props?: any) => {
  editSchedule("isAllDay", false);
  editSchedule(
    "date",
    `${String(dayData.value.month).padStart(2, "0")}.${String(
      dayData.value.day
    ).padStart(2, "0")}.${dayData.value.year}`
  );
  editSchedule("selectOption", name);
  if (props) {
    props.toggleVisibility();
  }
};
</script>

<style scoped lang="scss">
.schedule-dropdown {
  cursor: pointer;
  &::v-deep(.selected-option) {
    text-align: start;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 180px;
  }
  &::v-deep(.selected-item) {
    display: flex;
    padding-left: 16px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: var(--txt-dark-grey);
    &.active {
      padding-left: 16px;
    }
  }
  &::v-deep(.option-item-line) {
    height: 1px;
    background: #d9d9d9;
    width: 100%;
  }
  &::v-deep(.option-item-column) {
    overflow: hidden;
    height: max-content !important;
    padding: 0 !important;
  }
  &::v-deep(.option-item) {
    box-sizing: border-box;
    padding-top: 5px;
    padding-left: 16px;
    height: 32px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: var(--txt-dark-grey);
    .option-item {
      &-days {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 37px;
      }
      &-day {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 20px;
        width: 20px;
        font-style: normal;
        font-weight: 400;
        font-size: 11px;
        line-height: 13px;
        color: var(--txt-light-grey);
        background: var(--white);
        border: 1px solid var(--backgr-card-lightgrey2);
        border-radius: 4px;
        &.active {
          color: var(--txt-dark-grey);
          background: var(--bttn-active-lightblue);
          border: 1px solid var(--bttn-active-lightblue);
          border-radius: 4px;
        }
        &-text {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 2px;
        }
      }
      &-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        box-sizing: border-box;
        height: 32px;
        padding: 7px 0 0 16px;
      }

      &-text {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 19px;
        color: var(--txt-dark-grey);
      }

      &-input {
        display: flex;
        align-items: center;
        text-align: center;
        box-sizing: border-box;
        outline: none !important;
        height: 20px;
        width: 21px;
        padding: 0;
        font-style: normal;
        font-weight: 400;
        font-size: 13px;
        line-height: 16px;
        color: var(--txt-dark-grey);
        background: var(--white);
        border: 1px solid var(--backgr-card-lightgrey2);
        border-radius: 4px;
      }

      &--btns {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        height: 40px;

        &-cancel {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          width: 84px;
          background: #ffffff;
          border-radius: 4px;
        }

        &-save {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          width: 84px;
          background: var(--txt-dark-blue);
          border-radius: 4px;
          color: var(--white);
        }
      }
    }
  }
}
</style>
