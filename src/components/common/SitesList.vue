<template lang="pug">
.sites
  .sites--item(
    v-for="item in filterData",
    :class="{ 'current-session': item.currentSession && isShowCurrentSession }",
    @click="selectSite(item)"
  )
    .sites--item-content
      .info--domain
        .icon(:style="{ backgroundImage: `url(${item.icon})` }")
        .domain {{ item.domain }}
      .info
        .percent-section
          .percent-section--info
            .percent-section--line
              .percent-section--line-percent(
                :style="{ width: `${getPercent(item.timeSpent)}%` }"
              )
            .percent-section--percent {{ getPercent(item.timeSpent) + "%" }}
            .percent-section--time {{ formatDuration(item.timeSpent) }}
        .sessions(v-if="!item.currentSession") {{ `${item.sessions} sessions` }}
    .sites--item-activity(v-if="item.currentSession && isShowCurrentSession")
      .item-block
        .item-block--title {{ "Current Session" }}
        .item-block--info {{ formatDuration(currentSessionData.time || item.currentSession) }}
      .item-block
        .item-block--title {{ "Longest Session" }}
        .item-block--info(
          v-if="item && (item.sessions || item.currentSession)"
        ) {{ currentSessionData.time > item.longestSession || item.currentSession > item.longestSession ? formatDuration(currentSessionData.time || item.currentSession) : formatDuration(item.longestSession) }}
      .item-block
        .item-block--title {{ "Sessions" }}
        .item-block--info {{ item.visited }}
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, onUnmounted, ref } from "vue";
import {
  filteringData,
  formatDuration,
  getPercent,
} from "@/composables/common/trackerPageActions";
import { selectSite } from "@/composables/common/chartBar";
import { ObjectInterface, SiteInterface } from "@/types/dataInterfaces";
const props = defineProps({
  isShowCurrentSession: {
    type: Boolean,
    default: true,
  },
});

const intervalId = 0;

onMounted(() => {
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
});
onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
  clearInterval(intervalId);
});

const currentSessionData = ref({} as ObjectInterface);

const handleRuntimeMessage = (request: any, sender: any) => {
  const activeTab = "activeTab";
  console.log(request);
  if (request.message === activeTab) {
    currentSessionData.value.domain = request.siteUrl;
    currentSessionData.value.time = request.time;
  }
};

const filterData: ObjectInterface = computed(() => {
  const data = { ...filteringData.value };
  return data;
});
</script>

<style scoped lang="scss">
.sites {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 456px;

  * {
    font-family: var(--font-nunito);
  }

  &--item {
    cursor: pointer;
    box-sizing: border-box;
    display: flex;

    width: 100%;
    height: 60px;
    padding: 12px;

    border-radius: 8px;

    &-content {
      width: 100%;
      height: max-content;
    }

    .info {
      display: flex;
      flex-direction: column;
      width: 100%;

      &--domain {
        display: flex;
        margin-bottom: 4px;

        .icon {
          min-width: 20px;
          min-height: 20px;
          margin-right: 6px;

          border-radius: 50%;
          background-color: var(--white);
          background-repeat: no-repeat;
          background-size: 16px;
          background-position: center;
        }

        .domain {
          font-size: 16px;
          font-weight: 600;
          line-height: 20px;

          color: var(--txt-main-darkblue);
        }
      }

      .percent-section {
        display: flex;
        align-items: center;
        justify-content: space-between;

        width: 100%;

        &--info {
          display: flex;
          align-items: center;

          width: 100%;
        }

        &--line {
          position: relative;

          width: 100%;
          height: 6px;
          margin-right: 16px;

          border-radius: 3px;
          background: var(--bttn-active-lightblue);

          &-percent {
            position: absolute;
            left: 0;
            top: 0;

            height: 6px;

            border-radius: 3px;
            background: var(--purple_percent);
          }
        }

        &--percent,
        &--time {
          white-space: nowrap;
          opacity: 0.6;

          margin-right: 8px;

          font-size: 13px;
          font-weight: 700;
          line-height: 18px;

          color: var(--txt-main-darkblue);
        }

        &--time {
          margin-right: 0;
        }
      }

      .sessions {
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;

        color: var(--txt-dark-grey);
      }
    }

    &-activity {
      display: flex;
      column-gap: 9px;

      .item-block {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;

        width: 100%;
        padding: 7px 12px;

        background: var(--white);
        border-radius: 6px;

        &--title {
          font-size: 12px;
          font-weight: 500;
          line-height: 16px;

          color: var(--txt-dark-grey);
        }

        &--info {
          font-size: 18px;
          font-weight: 600;
          line-height: 25px;

          color: var(--txt-main-darkblue);
        }
      }
    }

    &.current-session {
      flex-direction: column;
      justify-content: space-between;

      height: 143px;
      background: var(--backgr-card-lightgrey);

      .sites--item-content {
        padding-top: 6px;
      }

      .percent-section {
        &--line {
          background: white;
        }
      }

      .sessions {
        display: none;
      }
    }
  }
}
</style>
