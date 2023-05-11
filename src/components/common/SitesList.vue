<template lang="pug">
.sites
  .sites--item(
    v-for="item in filteringData",
    :class="{ 'current-session': item.currentSession && isShowCurrentSession }",
    @click="selectSite(item)"
  )
    .sites--item-content
      .icon(:style="{ backgroundImage: `url(${item.icon})` }")
      .info
        .domain {{ item.domain }}
        .percent-section
          .percent-section--info
            .percent-section--line
              .percent-section--line-percent(
                :style="{ width: `${getPercent(item.timeSpent)}%` }"
              )
            .percent-section--percent {{ getPercent(item.timeSpent) + "%" }}
            .percent-section--time {{ formatDuration(item.timeSpent) }}
        .sessions(v-if="!item.currentSession") {{ `${item.visited} sessions` }}
    .sites--item-activity(v-if="item.currentSession && isShowCurrentSession")
      .item-block
        .item-block--title {{ "Current Session" }}
        .item-block--info {{ formatDuration(currentSessionData.time || item.currentSession) }}
      .item-block
        .item-block--title {{ "Longest Session" }}
        .item-block--info(
          v-if="item && (item.sessions || item.currentSession)"
        ) {{ currentSessionData.time > Math.max(...item.sessions) || item.currentSession > Math.max(...item.sessions) ? formatDuration(currentSessionData.time || item.currentSession) : formatDuration(Math.max(...item.sessions)) }}
      .item-block
        .item-block--title {{ "Sessions" }}
        .item-block--info {{ item.visited }}
</template>

<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from "vue";
import {
  filteringData,
  formatDuration,
  getPercent,
} from "@/composables/popup/pages/trackerPageActions";
import { selectSite } from "@/composables/common/chartBar";
import { ObjectInterface } from "@/types/dataInterfaces";
const props = defineProps({
  isShowCurrentSession: {
    type: Boolean,
    default: true,
  },
});
onMounted(() => {
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
});
onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
});

const currentSessionData = ref({} as ObjectInterface);

const handleRuntimeMessage = (request: any, sender: any) => {
  const currentSession = "currentSession";
  if (request.message === currentSession) {
    currentSessionData.value.domain = request.siteUrl;
    currentSessionData.value.time = request.time;
  }
};
</script>

<style scoped lang="scss">
.sites {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 401px;

  &--item {
    cursor: pointer;
    display: flex;
    box-sizing: border-box;
    padding: 0 12px;
    height: 60px;
    width: 100%;
    &-content {
      display: flex;
      align-items: center;
      width: 100%;
      height: max-content;
    }
    &-activity {
      display: flex;
      gap: 9px;
    }
    .icon {
      min-width: 40px;
      min-height: 40px;
      margin-right: 16px;
      background-repeat: no-repeat;
      background-size: contain;
    }
    .info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }
    .domain {
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
    }
    .percent-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 400px;
      &--info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      &--line {
        position: relative;
        width: 100%;
        height: 6px;
        max-width: 304px;
        border-radius: 100px;
        background: var(--bttn-active-lightblue);
        &-percent {
          position: absolute;
          height: 6px;
          left: 0;
          top: 0;
          border-radius: 100px;
          background: var(--purple_percent);
        }
      }
      &--percent {
        width: 36px;
        margin-left: 24px;
        font-style: normal;
        font-weight: 700;
        font-size: 13px;
        line-height: 18px;
        opacity: 0.6;
      }
      &--time {
        width: 28px;
        margin-left: 17px;
        font-style: normal;
        font-weight: 700;
        font-size: 13px;
        line-height: 18px;
        opacity: 0.6;
      }
    }
    .sessions {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: var(--txt-dark-grey);
    }
    &.current-session {
      flex-direction: column;
      justify-content: space-between;
      height: 143px;
      max-width: 401px;
      box-sizing: border-box;
      padding: 17px 12px 12px 12px;
      background: var(--backgr-card-lightgrey);
      border-radius: 8px;
      .item-block {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        gap: 4px;
        height: 56px;
        width: 100%;
        padding: 7px 12px;
        background: white;
        border-radius: 6px;
        &--title {
          font-style: normal;
          font-weight: 500;
          font-size: 12px;
          line-height: 16px;
          color: var(--txt-dark-grey);
        }
        &--info {
          font-style: normal;
          font-weight: 600;
          font-size: 18px;
          line-height: 25px;
        }
      }
      .icon {
        margin-left: 0;
        background-size: contain;
      }
      .percent-section {
        width: 100%;
        &--info {
          display: flex;
          align-items: center;
        }
        &--line {
          background: white;
        }
        &--time {
          margin-right: 0;
        }
      }
      .sessions {
        display: none;
      }
    }
  }
}
</style>
