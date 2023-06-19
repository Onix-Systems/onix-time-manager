<template lang="pug">
.modal-time
  .modal-time--padding
    .modal-time--title {{ "Enter time" }}
    .modal-time--timer
      .modal-time--input-section
        input.modal-time--input(
          @click="selectHours",
          v-model="storage.hour",
          placeholder="00",
          type="number",
          @keypress="parseInput($event)",
          @input="parseInput($event)",
          @blur="parseInput($event)"
        )
        .modal-time--subtitle {{ "Hour" }}
      .modal-time--dots
      .modal-time--input-section
        input.modal-time--input(
          @click="selectMinutes",
          v-model="storage.minute",
          placeholder="00",
          type="number",
          @keypress="parseInput($event)",
          @input="parseInput($event)",
          @blur="parseInput($event)"
        )
        .modal-time--subtitle {{ "Minutes" }}
    .modal-time--actions
      button.modal-time--btn(@click="cancel()") {{ "Cancel" }}
      button.modal-time--btn.save(@click="save()") {{ "Ok" }}
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { ObjectInterface } from "@/types/dataInterfaces";
import {
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "@/composables/common/dateComposable";

const props = defineProps({
  itemTimeLimits: {
    type: Object as () => { hour: number; minute: number },
    default: () => {
      return { hour: "", minute: "" };
    },
  },
});

enum TimeTypes {
  hour = "hour",
  minute = "minute",
}
const emit = defineEmits(["cancel", "saveLimits"]);
const storage = ref({
  hour: 0,
  minute: 0,
} as ObjectInterface);
const selected = ref("");
onMounted(() => {
  storage.value.hour = props.itemTimeLimits.hour;
  storage.value.minute = props.itemTimeLimits.minute;
  selected.value = "hour";
});

const parseInput = (evt: Event) => {
  if (selected.value) {
    const timeParser = (value: number) => {
      if (selected.value === TimeTypes.hour) {
        if (value > 24) {
          storage.value.hour = 24;
        } else {
          storage.value.hour = value;
        }
      }
    };

    switch (evt.type) {
      case "blur": {
        const value = (evt.target as EventTarget & { value: string }).value;
        if (!value) {
          storage.value[selected.value] = 0;
        } else {
          timeParser(+value);
          if (selected.value === TimeTypes.minute) {
            if (+value > 60) {
              if (+storage.value.hour < 24) {
                storage.value.hour += Math.floor(+value / 60);
              }
              storage.value.minute = +value % 60;
            } else {
              storage.value.minute = +value;
            }
          }
        }
        break;
      }
      case "input": {
        const value = (evt.target as EventTarget & { value: string }).value;
        if (+value < 0) {
          storage.value[selected.value] = 0;
        } else {
          timeParser(+value);
          if (selected.value === TimeTypes.minute) {
            if (+value > 60) {
              storage.value.hour = 60;
            } else {
              storage.value.minute = +value;
            }
          }
        }
        break;
      }
      case "keypress": {
        const selectInput = storage.value[selected.value];

        const condition = (input = "") => {
          const concatenatedValue =
            input + (evt as Event & { key: string }).key.toString();
          const condition = Number(concatenatedValue);
          if (concatenatedValue.match(/^0[0-9]$/) !== null) {
            evt.preventDefault();
          }
          storage.value[selected.value] = condition;
        };
        if (selectInput && selectInput.toString().length < 2) {
          condition(selectInput);
        } else {
          condition();
        }
        break;
      }
    }
  }

  evt.preventDefault();
};

const selectHours = () => {
  selected.value = TimeTypes.hour;
  storage.value.hour = null;
};
const selectMinutes = () => {
  selected.value = TimeTypes.minute;
  storage.value.minute = null;
};
const cancel = () => {
  emit("cancel");
};

const save = () => {
  let time = 0;
  if (!storage.value.minute) {
    storage.value.minute = "";
  } else {
    time += storage.value.minute * SECONDS_PER_MINUTE;
  }
  if (!storage.value.hour) {
    storage.value.hour = "";
  } else {
    time += storage.value.hour * SECONDS_PER_HOUR;
  }
  emit("saveLimits", time);
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
  left: -17px;
  width: 264px;
  height: 243px;
  background: var(--white);
  box-shadow: 1px 1px 40px rgba(56, 106, 241, 0.1);
  border-radius: 28px;
  &--title {
    margin-bottom: 24px;
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: var(--txt-dark-grey);
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
      background: var(--bttn-active-lightblue);
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
    color: var(--txt-dark-grey);
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
  button.modal-time--btn.save {
    color: var(--txt-dark-blue);
  }
}
</style>
