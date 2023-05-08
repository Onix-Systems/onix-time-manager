<template lang="pug">
.limits-page--content
  template(v-if="limitsObject.browserLimit")
    h2.title The browser will be block after
    p.subtitle {{ getGlobalLimit }}
  template(v-if="isLengthList")
    list-items(:items="limitsObject.list", :limits="true")
  template(v-else)
    h2 The list of limits for web time is empty. Create limits to websites to see them here.
    img(:src="require(`@/assets/frame-L.svg`)", alt="Empty template")
</template>

<script setup lang="ts">
import ListItems from "@/components/common/ListItems.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  limitsData,
  getLimits,
  isLengthList,
  resetUserData,
} from "@/composables/limitsComp";
import { UserData } from "@/composables/scheduleComp";
import { ObjectInterface } from "@/types/dataInterfaces";

onMounted(() => {
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  getLimits();
  resetUserData();
  globalLimit();
});

onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
});

const limitsObject = computed(() => {
  return limitsData.value;
});

const getGlobalLimit = computed(() => {
  const timeObject: ObjectInterface = { ...UserData.value.timeLimits };
  const timeSpent = limitsObject.value.browserTimeSpent.time;
  const limitInSeconds = timeObject.hour * 3600 + timeObject.minute * 60;
  const usageLimit = limitInSeconds - timeSpent;
  if (
    usageLimit > 0 &&
    usageLimit !== -Math.abs(usageLimit) &&
    !convertedDate.value.totalTime
  ) {
    editConvertedDate(usageLimit);
  }
  return globalLimit();
});

const editConvertedDate = (time: any) => {
  convertedDate.value.hour = Math.floor(time / 3600);
  convertedDate.value.minute = Math.floor((time % 3600) / 60);
  convertedDate.value.seconds = time % 60;
};

const convertedDate = ref({ hour: 0, minute: 0, seconds: 0, totalTime: 0 });

const globalLimit = () => {
  return `${String(convertedDate.value.hour).padStart(2, "0")}h ${String(
    convertedDate.value.minute
  ).padStart(2, "0")}m ${String(convertedDate.value.seconds).padStart(
    2,
    "0"
  )}s`;
};

const handleRuntimeMessage = (request: any, sender: any) => {
  const browserTimeSpent = "browserTimeSpent";
  if (
    request.message === browserTimeSpent &&
    request.time !== -Math.abs(request.time)
  ) {
    convertedDate.value.totalTime = request.time;
    editConvertedDate(request.time);
  }
};
</script>

<style scoped lang="scss">
.limits-page--content {
  padding: 32px 12px 0;

  h2 {
    margin-bottom: 59px;

    font-family: Nunito, sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    text-align: center;

    color: var(--txt-light-grey);
    &.title {
      margin-bottom: 24px;

      color: var(--txt-main-darkblue);
    }
  }

  p {
    margin-bottom: 44px;

    font-family: Inter, sans-serif;
    font-weight: 600;
    font-size: 22px;
    line-height: 27px;
    text-align: center;

    color: var(--txt-dark-blue);
  }

  img {
    margin: 0 auto;
    display: block;
  }
}
</style>
