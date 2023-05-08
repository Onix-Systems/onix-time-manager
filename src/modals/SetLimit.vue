<template lang="pug">
teleport(to="body")
  .background
    .set-limits-page
      button.cancel-btn(@click="cancel()")
      h2 Set a limit the site
      input.name(placeholder="Enter site name", v-model="name")
      .modal-time--timer
        .modal-time--input-section(:class="{ error: hourError || timeError }")
          input.modal-time--input(
            v-model="time.hours",
            placeholder="Hours",
            maxlength="2"
          )
          .modal-time--input-section(
            :class="{ error: minutesError || timeError }"
          )
          input.modal-time--input(
            v-model="time.minutes",
            placeholder="Minutes",
            maxlength="2"
          )
          .modal-time--input-section(
            :class="{ error: secondsError || timeError }"
          )
          input.modal-time--input(
            v-model="time.seconds",
            placeholder="Seconds",
            maxlength="2"
          )
        button.cancel(@click="cancel()") {{ "Cancel" }}
        button.set(@click="save()") {{ "Set" }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, defineProps, defineEmits } from "vue";
import {
  openModal,
  timeToSeconds,
  modalTime,
  resetModalTime,
  isActive,
  defineTime,
  editTime,
} from "@/composables/optionsActions";
const showModal = ref(false);
const props = defineProps({
  show: Boolean,
  itemModal: { type: Boolean, default: false },
  itemTime: Number,
  itemTimeLimits: Number,
});
const emit = defineEmits(["cancel", "updateTime", "updateLimits"]);

const cancel = () => {
  if (isActive && !props.itemModal) {
    openModal();
  } else if (props.show && props.itemModal) {
    emit("cancel");
  }
  showModal.value = false;
  emit("updateLimits", showModal.value);
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
  addSiteToBlock();
  showModal.value = false;
  emit("updateLimits", showModal.value);
};
const name = ref("");
const showSave = ref(false);

const history: any = ref([]);
const isEmpty = computed(() => {
  return history.value && history.value.length;
});
const updateHistory = () => {
  chrome.storage.local.get(["limitsSites"], (result) => {
    history.value = result.limitsSites;
  });
};
const updateTime = (index: number, newTime: number) => {
  history.value[index].blockTimeSeconds = newTime;
  history.value[index].blockTime = Math.floor(Date.now() / 1000) + newTime;
  chrome.storage.local.set(
    {
      limitsSites: [...history.value],
    },
    () => {
      updateHistory();
    }
  );
};
onMounted(() => {
  updateHistory();
});

const addSiteToBlock = () => {
  chrome.storage.local.get(["limitsSites"], (result) => {
    const limitsSites = result.limitsSites || [];
    if (
      !limitsSites.find((item: any) => item.url.includes(name.value)) &&
      name.value &&
      time.value
    ) {
      const site = {
        url: name.value,
        blockTimeSeconds: timeToSeconds(modalTime),
        blockTime:
          Math.floor(Date.now() / 1000) + Number(timeToSeconds(modalTime)),
        icon: `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${name.value}&size=64`,
      };
      chrome.storage.local.set(
        {
          limitsSites: [...limitsSites, site],
        },
        () => {
          updateHistory();
          name.value = "";
          resetModalTime();
        }
      );
    }
  });
};
</script>

<style scoped lang="scss">
.background {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  .cancel-btn {
    display: inline-block;
    content: "";
    background-image: url("../assets/cancel.svg");
    width: 14px;
    height: 15px;
    position: absolute;
    right: 46px;
  }

  .set-limits-page {
    position: absolute;
    width: 582px;
    height: 250px;
    background: #ffffff;
    border-radius: 6px;
    padding: 41px 36px;
    h2 {
      font-style: normal;
      font-weight: 500;
      font-size: 22px;
      line-height: 27px;
      color: #7e7e7e;
    }
    input.modal-time--input {
      padding: 10px 16px;
      width: 153px;
      height: 18px;
      background: #ffffff;
      border: 1px solid #a9a9a9;
      border-radius: 6px;
      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 16px;
      color: #7e7e7e;
      &:last-child {
        margin-left: 10px;
      }
      &:first-child {
        margin-right: 10px;
      }
    }
    input.name {
      padding: 10px 16px;
      width: 548px;
      height: 18px;
      background: #ffffff;
      border: 1px solid #a9a9a9;
      border-radius: 6px;
      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 16px;
      color: #7e7e7e;
      margin: 32px 0 20px;
    }
    input.name::placeholder {
      color: #a9a9a9;
    }
    .modal-time--input-section {
      display: flex;
    }
    .cancel {
      padding: 10px 16px;
      width: 278px;
      height: 48px;
      background: #ffffff;
      border: 1px solid #545d64;
      border-radius: 6px;
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      color: #545d64;
      cursor: pointer;
      margin: 34px 26px 0 0;
    }
    .set {
      cursor: pointer;
      padding: 10px 16px;
      width: 278px;
      height: 48px;
      background: #545d64;
      border-radius: 6px;
      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 18px;
      color: #f2f2f2;
    }
  }
}
</style>
