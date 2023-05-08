<template lang="pug">
.modal-time(v-if="show")
  .modal-time--padding
    .modal-time--title {{ "Enter time" }}
    .modal-time--timer
      .modal-time--input-section(:class="{ error: showErrors }")
        input.modal-time--input(
          @click="selected = 'from'",
          v-model="storage.from.time",
          placeholder="00",
          type="number",
          @keypress="parseInput($event)"
        )
        .modal-time--subtitle {{ "From" }}
      .modal-time--dots {{ ":" }}
      .modal-time--input-section(:class="{ error: showErrors }")
        input.modal-time--input(
          @click="selected = 'to'",
          v-model="storage.to.time",
          placeholder="00",
          type="number",
          @keypress="parseInput($event)"
        )
        .modal-time--subtitle {{ "To" }}
      .modal-time--periods(v-if="storage[selected]")
        button.modal-time--periods-am(
          @click="storage[selected].period = 'AM'",
          :class="{ active: storage[selected].period === 'AM' }"
        ) {{ "AM" }}
        button.modal-time--periods-pm(
          @click="storage[selected].period = 'PM'",
          :class="{ active: storage[selected].period === 'PM' }"
        ) {{ "PM" }}
    .modal-time--actions
      button.modal-time--btn(@click="cancel()") {{ "Cancel" }}
      button.modal-time--btn(@click="save()") {{ "Save" }}
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { ScheduleTimeObject } from "@/types/PermissionInterface";
import { timeAmTo24 } from "@/composables/common/dateComposable";

const props = defineProps({
  show: Boolean,
  itemTime: {
    type: Object as () => { from: string; to: string },
    default: () => {
      return { from: "", to: "" };
    },
  },
});

const emit = defineEmits(["cancel", "save"]);

onMounted(() => {
  setData(props.itemTime.from, 0);
  setData(props.itemTime.to, 1);
  selected.value = "from";
});

const parseInput = (evt: any) => {
  const condition = Number(
    String(storage.value[selected.value].time) + String(evt.key)
  );
  if (condition && condition <= 12) {
    return;
  }
  evt.preventDefault();
};

const setData = (item: string, key: number) => {
  const words = item.split(" ");
  const convertedObject: ScheduleTimeObject = {
    time: Number(words[0]),
    period: words[1],
  };
  if (!key) {
    storage.value.from = convertedObject;
  } else {
    storage.value.to = convertedObject;
  }
};

const cancel = () => {
  emit("cancel");
};

const showErrors = ref(false);
const storage = ref({
  from: { time: 0, period: "AM" },
  to: { time: 12, period: "PM" },
} as { from: ScheduleTimeObject; to: ScheduleTimeObject; [key: string]: ScheduleTimeObject });

const selected = ref();

const save = () => {
  const date = { from: "", to: "" };
  date.from = `${storage.value.from.time ? storage.value.from.time : 12} ${
    storage.value.from.period
  }`;
  date.to = `${storage.value.to.time ? storage.value.to.time : 12} ${
    storage.value.to.period
  }`;
  if (timeAmTo24(date.from) < timeAmTo24(date.to)) {
    showErrors.value = false;
    emit("save", date);
  } else {
    showErrors.value = true;
  }
};
</script>

<style scoped lang="scss">
.modal-time {
  z-index: 10;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  top: 25px;
  right: -116px;
  width: 328px;
  height: 243px;
  background: #eeeeee;
  border-radius: 28px;
  &--title {
    margin-bottom: 24px;
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: #49454f;
  }
  &--timer {
    display: flex;
    margin-bottom: 34px;
  }
  &--input {
    display: flex;
    align-items: center;
    text-align: center;
    outline: none !important;
    box-sizing: border-box;
    margin-bottom: 8px;
    width: 96px;
    height: 72px;
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 45px;
    line-height: 52px;
    color: #000000;
    background: #f9f9f9;
    border-radius: 8px;
    border: none;
    &::placeholder {
      color: #3e4552;
    }
    &:focus {
      border: 2px solid #5c5a5a;
    }
    &:focus::placeholder {
      color: transparent;
    }
    &-section {
      &.error {
        .modal-time {
          &--input {
            border: 1px solid #c72c2c;
            color: #c72c2c;
          }
          &--subtitle {
            color: #c72c2c;
          }
        }
      }
    }
  }
  &--subtitle {
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.4px;
    color: #49454f;
  }
  &--dots {
    display: flex;
    align-items: center;
    text-align: center;
    width: 24px;
    height: 72px;
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 57px;
    line-height: 64px;
    color: #1d1b20;
    justify-content: center;
  }
  &--actions {
    display: flex;
    justify-content: flex-end;
    gap: 26px;
  }
  &--periods {
    overflow: hidden;
    margin-left: 12px;
    width: 52px;
    height: 72px;
    background: #ece6f0;
    border: 1px solid #79747e;
    border-radius: 8px;
    &-am,
    &-pm {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 50%;
      font-family: Roboto, sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      text-align: center;
      letter-spacing: 0.15px;
      color: #49454f;
      &.active {
        background: #ffffff;
        color: #31111d;
      }
    }
    &-pm {
      border-top: 1px solid #79747e;
    }
  }
  &--btn {
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.1px;
    color: #5c5a5a;
  }
}
</style>
