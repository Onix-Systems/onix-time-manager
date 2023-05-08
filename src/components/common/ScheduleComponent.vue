<template lang="pug">
.schedule(
  :class="{ open: isActive || UserData.selectOption === Options.Weekly }"
)
  .schedule--left-section
    .schedule--title {{ title }}
    .schedule--flex.first
      template(
        v-if="UserData.selectOption !== Options.Weekly && UserData.selectOption !== Options.EveryDay"
      )
        button.schedule--date(
          :class="{ disable: !isActive }",
          :style="{ cursor: UserData.selectOption !== Options.Today ? 'pointer' : 'auto' }",
          @click="UserData.selectOption !== Options.Today ? editDate() : ''"
        )
          .schedule--date-title {{ "Date: " }}
          .schedule--date-info {{ convertDateToString(UserData.date) }}
        date-picker(
          v-if="isOpenCalendar",
          :currentData="convertStringToDate(UserData.date)",
          @update:isOpen="editDate()",
          @formattedDateSelected="setDate($event)",
          @cancel="cancelSchedule()"
        )
      button.schedule--time(
        v-if="!UserData.isAllDay && UserData.time",
        :class="{ disable: !isActive }",
        @click="openTimeLimit()"
      ) {{ `${UserData.time.from} - ${UserData.time.to}` }}
      button.schedule--time(
        v-if="!UserData.isAllDay && UserData.timeLimits",
        :class="{ disable: !isActive }",
        @click="openTimeLimit()"
      ) {{ `${String({ ...UserData.timeLimits }.hour).padStart(2, "0")} h ${String({ ...UserData.timeLimits }.minute).padStart(2, "0")} m` }}
      time-modal-permission(
        v-if="isOpenTimeLimit && UserData.time",
        :show="isOpenTimeLimit",
        :itemTime="UserData.time",
        @cancel="cancelTimeLimit()",
        @save="saveTimeLimit($event)"
      )
      time-modal-limits(
        v-if="isOpenTimeLimit && UserData.timeLimits",
        :show="isOpenTimeLimit",
        :itemTimeLimits="UserData.timeLimits",
        @cancel="cancelTimeLimit()",
        @saveLimits="saveTimeLimits($event)"
      )
    .schedule--flex(
      v-if="isActive || UserData.selectOption === Options.Weekly"
    )
      .schedule--check(v-if="isActive")
        custom-checkbox(
          :isChecked="UserData.isAllDay",
          @update:check="editSchedule('isAllDay', $event)"
        )
        | {{ "All Day" }}
      .schedule-dropdown(
        v-if="isActive || UserData.selectOption === Options.Weekly"
      )
        schedule-dropdown(:disable="isActive")
  .schedule--right-section(:class="{ active: isActive }")
    button.schedule--close(v-if="isActive", @click="closeSchedule")
    button.schedule--open(
      v-if="isChecked",
      :class="{ active: isActive }",
      @click="openSchedule"
    ) {{ isActive ? "Save" : "Edit" }}
    button.schedule--opens(
      v-else,
      :class="{ active: isActive }",
      @click="openSchedule"
    ) {{ "Edit" }}
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, onMounted } from "vue";
import CustomCheckbox from "@/components/common/CustomCheckbox.vue";
import {
  convertDateToString,
  convertStringToDate,
  editSchedule,
  UserData,
} from "@/composables/scheduleComp";
import DatePicker from "@/components/common/DatePicker.vue";
import { currentSchedule } from "@/composables/permissionComp";
import TimeModalPermission from "@/modals/TimeModalPermission.vue";
import TimeModalLimits from "@/modals/TimeModalLimits.vue";
import {
  ScheduleTimeLimitsObject,
  ScheduleTimeObject,
} from "@/types/PermissionInterface";
import ScheduleDropdown from "@/components/ScheduleDropdown.vue";
import { Options } from "@/constants/DateEnum";
import { dayData } from "@/composables/common/dateComposable";
const props = defineProps({
  title: String,
  isChecked: Boolean,
});
const emit = defineEmits(["close", "save"]);

watch(
  () => props.title,
  () => {
    closeSchedule();
  }
);

const isActive = ref(false as boolean);
const isOpenCalendar = ref(false);
const isOpenTimeLimit = ref(false);

const openTimeLimit = () => {
  if (isActive.value) {
    if (isOpenCalendar.value) {
      cancelSchedule();
    }
    isOpenTimeLimit.value = true;
  }
};

const closeTimeLimit = () => {
  isOpenTimeLimit.value = false;
};

const cancelTimeLimit = () => {
  closeTimeLimit();
  editSchedule("time", currentSchedule.value.time);
};

const saveTimeLimit = (data: ScheduleTimeObject) => {
  isOpenTimeLimit.value = false;
  editSchedule("time", data);
};
const saveTimeLimits = (data: ScheduleTimeLimitsObject) => {
  isOpenTimeLimit.value = false;
  editSchedule("timeLimits", data);
};
const openSchedule = () => {
  if (UserData.value.selectOption === Options.Today) {
    editSchedule(
      "date",
      `${String(dayData.value.month).padStart(2, "0")}.${String(
        dayData.value.day
      ).padStart(2, "0")}.${dayData.value.year}`
    );
  }
  if (isActive.value) {
    emit("save");
  }
  isActive.value = !isActive.value;
};

const cancelSchedule = () => {
  editSchedule("date", currentSchedule.value.date);
  isOpenCalendar.value = false;
};

const editDate = () => {
  if (isOpenTimeLimit.value) {
    closeTimeLimit();
  }
  if (isActive.value) {
    isOpenCalendar.value = !isOpenCalendar.value;
  }
};

const setDate = (date: string) => {
  editSchedule("date", date);
};

const closeSchedule = () => {
  isActive.value = false;
  closeTimeLimit();
  cancelSchedule();
  emit("close");
};
</script>

<style scoped lang="scss">
.schedule {
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  height: max-content;
  padding: 10px 16px 14px;
  background: var(--backgr-card-lightgrey2);
  border-radius: 6px;
  &.open {
    background: var(--bttn-delete-lightblue);
    .schedule {
      &--title {
        color: var(--txt-main-darkblue);
      }
      &--date {
        &-title {
          color: var(--txt-dark-grey);
        }
        &-info {
          color: var(--txt-main-darkblue);
        }
      }
      &--time {
        color: var(--txt-main-darkblue);
      }
    }
  }

  .disable {
    cursor: default;
  }
  &--left-section {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  &--right-section {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
    &.active {
      justify-content: space-between;
    }
  }
  &--title {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 19px;
    color: var(--txt-dark-grey);
  }
  &--date,
  &--time {
    display: flex;
    align-items: center;
    background: inherit;
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    color: var(--txt-light-grey);
  }
  &--date {
    gap: 4px;
  }
  &--check {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 23px;
  }
  &--flex {
    display: flex;
    align-items: center;
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    color: var(--txt-dark-grey);
    &.first {
      position: relative;
      justify-content: space-between;
      width: 297px;
      margin-top: 0;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
    }
  }
  &-dropdown {
    height: 32px;
    width: 222px;
    background: var(--white);
    border-radius: 4px;
  }
  &--open {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 82px;
    height: 32px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    color: var(--txt-dark-blue);
    background: inherit;
    border: 1px solid var(--txt-dark-blue);
    border-radius: 8px;
    &.active {
      color: var(--white);
      background: var(--txt-dark-blue);
    }
  }
  &--opens {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 82px;
    height: 32px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    color: var(--txt-light-grey);
    background: inherit;
    border: 1px solid var(--txt-light-grey);
    border-radius: 8px;
  }
  &--close {
    display: block;

    width: 22px;
    height: 22px;
    padding: 0;
    margin: 0;

    mask-image: url("@/assets/icons/cross.svg");
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    background: #a9a9a9;
    border: none;
  }
}
</style>
