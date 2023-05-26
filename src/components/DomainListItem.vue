<template lang="pug">
.sites--item-content
  .info--domain
    .icon(:style="{ backgroundImage: `url(${item.icon})` }")
    .domain {{ item.domain }}
  .info
    .percent-section
      .percent-section--info
        .percent-section--line
          .percent-section--line-percent(:style="{ width: `${getPercent}%` }")
        .percent-section--percent {{ getPercent + "%" }}
        .percent-section--time {{ format(sessionMask(totalTimeCalculation(item.sessions) + currentTime), totalTimeCalculation(item.sessions) + currentTime, true, false) }}
    .sessions(v-if="showSessions") {{ `${item.sessions.length} sessions` }}
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

import { totalTimeCalculation } from "@/composables/common/trackerPageActions";
import { format } from "@/composables/common/dateComposable";

import { HistoryListInterface } from "@/types/TrackingInterface";

const props = defineProps({
  item: {
    type: Object as () => HistoryListInterface,
    required: true,
  },
  showSessions: {
    type: Boolean,
    default: false,
  },
  totalTime: {
    type: Number,
    required: true,
  },
  currentTime: {
    type: Number,
    default: 0,
  },
});

const getPercent = computed(() => {
  if (props.item && props.totalTime) {
    return (
      ((totalTimeCalculation(props.item.sessions) + props.currentTime) /
        props.totalTime) *
      100
    ).toFixed(2);
  } else {
    return 0;
  }
});

const sessionMask = (count: number) => {
  const mask = ["sss"];
  if (count > 60) {
    mask.splice(mask.length - 1, 1);
    mask.unshift("mmm");
  }
  if (count > 3600) {
    mask.unshift("Hh");
  }

  if (!(count % 3600)) {
    mask.splice(mask.length - 1, 1);
  }
  return mask.join(" ");
};
</script>

<style lang="scss">
.sites--item-content {
  width: 100%;
  height: max-content;

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
        column-gap: 8px;
      }

      &--line {
        position: relative;

        width: 100%;
        height: 6px;
        margin-right: 8px;

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
        display: flex;
        justify-content: flex-start;
        white-space: nowrap;
        opacity: 0.6;

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
}
</style>
