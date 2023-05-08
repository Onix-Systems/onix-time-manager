<template lang="pug">
.modal-time(v-if="(isActive && !itemModal) || (show && itemModal)")
  .modal-time--title {{ "Enter time" }}
  .modal-time--timer
    .modal-time--input-section(:class="{ error: hourError || timeError }")
      input.modal-time--input(
        v-model="time.hours",
        placeholder="00",
        maxlength="2"
      )
      .modal-time--subtitle {{ "Hour" }}
    .modal-time--dots {{ ":" }}
    .modal-time--input-section(:class="{ error: minutesError || timeError }")
      input.modal-time--input(
        v-model="time.minutes",
        placeholder="00",
        maxlength="2"
      )
      .modal-time--subtitle {{ "Minute" }}
    .modal-time--dots {{ ":" }}
    .modal-time--input-section(:class="{ error: secondsError || timeError }")
      input.modal-time--input(
        v-model="time.seconds",
        placeholder="00",
        maxlength="2"
      )
      .modal-time--subtitle {{ "Second" }}
  .modal-time--actions
    button.modal-time--btn(@click="cancel()") {{ "Cancel" }}
    button.modal-time--btn(@click="save()") {{ "Save" }}
</template>

<script setup lang="ts">
import {
  isActive,
  openModal,
  defineTime,
  editTime,
  modalTime,
  timeToSeconds,
} from "@/composables/optionsActions";
import { computed, ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  show: Boolean,
  itemModal: { type: Boolean, default: false },
  itemTime: Number,
  itemTimeLimits: Number,
});

const emit = defineEmits(["cancel", "updateTime"]);

const cancel = () => {
  if (isActive && !props.itemModal) {
    openModal();
  } else if (props.show && props.itemModal) {
    emit("cancel");
  }
};

watch(
  () => isActive.value,
  () => {
    if (isActive.value) {
      showErrors.value = false;
      const timeInSeconds = timeToSeconds(modalTime);
      time.value.hours = timeInSeconds
        ? Math.floor(timeInSeconds / 3600)
        : null;
      time.value.minutes = timeInSeconds
        ? Math.floor((timeInSeconds % 3600) / 60)
        : null;
      time.value.seconds = timeInSeconds ? timeInSeconds % 60 : null;
    }
  }
);

watch(
  () => props.show,
  () => {
    if (props.show) {
      showErrors.value = false;
      time.value.hours = props.itemTime
        ? Math.floor(props.itemTime / 3600)
        : null;
      time.value.minutes = props.itemTime
        ? Math.floor((props.itemTime % 3600) / 60)
        : null;
      time.value.seconds = props.itemTime ? props.itemTime % 60 : null;
    } else {
      Object.assign(time.value, defineTime);
    }
  }
);
const showErrors = ref(false);
const time: any = ref({ ...defineTime });

const hourError = computed(() => {
  return showErrors.value && time.value.hours > 24;
});
const minutesError = computed(() => {
  return (
    (showErrors.value && time.value.minutes > 60) ||
    (showErrors.value && time.value.hours > 23 && time.value.minutes)
  );
});
const secondsError = computed(() => {
  return (
    (showErrors.value && time.value.seconds > 60) ||
    (showErrors.value && time.value.hours > 23 && time.value.seconds)
  );
});
const timeError = computed(() => {
  return (
    showErrors.value &&
    !time.value.hours &&
    !time.value.minutes &&
    !time.value.seconds
  );
});

const save = () => {
  showErrors.value = true;
  if (
    hourError.value ||
    minutesError.value ||
    secondsError.value ||
    timeError.value
  ) {
    return;
  } else {
    if (isActive && !props.itemModal) {
      editTime("hours", time.value.hours);
      editTime("minutes", time.value.minutes);
      editTime("seconds", time.value.seconds);
      openModal();
    } else if (props.show && props.itemModal) {
      emit("updateTime", timeToSeconds(time.value));
      emit("cancel");
    }
  }
};
</script>

<style scoped lang="scss">
.modal-time {
  position: absolute;
  top: 40px;
  right: 55px;
  padding: 20px 30px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  border-radius: 6px;
  &--title {
    margin-bottom: 16px;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
  }
  &--timer {
    display: flex;
    gap: 4px;
    margin-bottom: 55px;
  }
  &--input {
    display: flex;
    align-items: center;
    text-align: center;
    outline: none !important;
    box-sizing: border-box;
    margin-bottom: 8px;
    width: 80px;
    height: 58px;
    font-style: normal;
    font-weight: 700;
    font-size: 28px;
    line-height: 34px;
    background: #e0e0e0;
    color: #3e4552;
    border-radius: 4px;
    border: none;
    &::placeholder {
      color: #3e4552;
    }
    &:focus {
      border: 1px solid #4477d4;
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
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    color: #3e4552;
  }
  &--dots {
    padding-top: 11px;
    font-style: normal;
    font-weight: 500;
    font-size: 28px;
    line-height: 34px;
  }
  &--actions {
    display: flex;
    justify-content: flex-end;
    gap: 26px;
  }
  &--btn {
    cursor: pointer;
    padding: 0;
    border: none;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #4477d4;
    background: inherit;
  }
}
</style>
