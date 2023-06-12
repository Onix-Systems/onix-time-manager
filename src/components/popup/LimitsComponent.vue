<template lang="pug">
.limits-page--content(
  :class="{ empty: !limitsData.sitesLimit || !isLengthList }"
)
  template(v-if="!showLoader && !showTimeLoader")
    .limits-page--content-tracker(v-if="limitsObject.browserLimit")
      h2.title The browser will be block after
      p.subtitle(:class="{ mb: isLengthList }") {{ globalLimit }}
    empty-template.fixed(
      v-if="!limitsData.sitesLimit",
      :class="{ 'with-global': limitsObject.browserLimit }",
      :image-path="'off-template.svg'",
      :message="'The list of web time restrictions is disabled. Turn on list for create limits to websites to see them here'"
    )
      button.content--button.tab-active.icon(
        @click="openOptions(MenuItemsEnum.Limits)"
      ) Go to enable list of limits
    empty-template.fixed(
      v-else-if="!isLengthList",
      :image-path="'empty-limits-list.svg'",
      :message="'The list of limits for web time is empty. Create limits to websites to see them here.'"
    )
      button.content--button.tab-active.icon.icon--plus(
        @click="openOptions(MenuItemsEnum.Limits)"
      ) Add limit
    .limits-page--content-list(
      v-else,
      :class="{ 'with-limit': limitsObject.browserLimit }"
    )
      list-items(
        :items="limitsObject.list",
        :limits="true",
        :block="true",
        :calculation="true"
      )
  .loader(v-else)
    circul-loader
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from "vue";

import ListItems from "@/components/common/ListItems.vue";
import EmptyTemplate from "@/components/common/EmptyTemplate.vue";

import { openOptions } from "@/composables/popup/popupActions";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { format, validUrlRegex } from "@/composables/common/dateComposable";
import { finishLoader, startLoader } from "@/composables/common/loaderActions";
import { EnumLoaderKeys } from "@/constants/EnumLoaderKeys";
import CirculLoader from "@/components/common/CirculLoader.vue";
import { defaultLimits } from "@/composables/limitsComp";
import { LimitsInterfaces } from "@/types/LimitsInterfaces";
import {
  createStructure,
  totalTimeCalculation,
} from "@/composables/common/trackerPageActions";
import { SessionInterface } from "@/types/TrackingInterface";
import {
  generalTimeSpent,
  showLoader,
} from "@/composables/popupTrackerActions";
import {
  showTimeLoader,
  trackerCounter,
} from "@/composables/common/timeCounter";

let intervalId = 0;
const currentUrl = ref("" as any);
const timeLimit = ref(0);
const limitsData = ref({
  ...defaultLimits,
} as LimitsInterfaces);

const isLengthList = computed(() => {
  return (
    limitsData.value &&
    limitsData.value.list &&
    Object.keys(limitsData.value.list).length
  );
});

onMounted(() => {
  startLoader(EnumLoaderKeys.popupLimits);
  chrome.storage.local.get("limits").then((res) => {
    const { limits } = res;
    if (limits) {
      limitsData.value = limits;
    }
    const browserTime = { ...limitsObject.value.browserTime };
    const limitTime = browserTime.timeLimit;
    timeLimit.value = browserTime.timeLimit;
    let timeSpent = browserTime.timeSpent;
    if (limitTime - timeSpent > 0) {
      editConvertedDate(limitTime - timeSpent);
    }
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs.length && validUrlRegex.test(`${tabs[0].url}`)) {
        currentUrl.value = `https://${new URL(String(tabs[0].url)).hostname}/`;
        let stop = false;
        intervalId = setInterval(() => {
          if (limitsObject.value.browserLimit && !stop) {
            const blockAfter = limitTime - timeSpent;

            if (!blockAfter || blockAfter === -Math.abs(blockAfter)) {
              editConvertedDate(blockAfter);
              clearInterval(intervalId);
              stop = true;
            } else if (blockAfter) {
              editConvertedDate(blockAfter);
              timeSpent += 1;
            }
          }
          const sitesKeys = Object.keys(limitsObject.value.list);
          if (limitsObject.value && sitesKeys.length && !stop) {
            if (sitesKeys.includes(currentUrl.value)) {
              const site = limitsObject.value.list[currentUrl.value].siteLimit;
              const blockAfter = site.timeLimit - site.timeSpent;
              if (!blockAfter || blockAfter === -Math.abs(blockAfter)) {
                clearInterval(intervalId);
                stop = true;
              } else if (blockAfter) {
                site.timeSpent += 1;
              }
            }
          }
        }, 1000);
        finishLoader(EnumLoaderKeys.popupLimits);
      } else {
        finishLoader(EnumLoaderKeys.popupLimits);
      }
    });
  });
});

onUnmounted(() => {
  clearInterval(intervalId);
});

const limitsObject = computed(() => {
  return { ...limitsData.value };
});

const editConvertedDate = (time: any) => {
  convertedDate.value.hour = Math.floor(time / 3600);
  convertedDate.value.minute = Math.floor((time % 3600) / 60);
  convertedDate.value.seconds = time % 60;
};

const convertedDate = ref({ hour: 0, minute: 0, seconds: 0, totalTime: 0 });

const globalLimit = computed(() => {
  return format(
    timeLimit.value > 3600 ? "HHh mmm sss" : "mmm sss",
    timeLimit.value - generalTimeSpent.value - trackerCounter.value,
    true
  );
});
</script>

<style scoped lang="scss">
.loader {
  content: "";
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 32px;
  height: 32px;
  margin: 50% calc(50% - 16px);

  &:before {
    content: "";
    display: block;
    position: absolute;
    width: 32px;
    height: 32px;

    border-radius: 50%;
  }
}
.limits-page--content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 12px;

  &.empty {
    padding: 0 12px;
    &::v-deep(.empty-section.fixed.with-global) {
      h2 {
        margin-top: 0;
        margin-bottom: 22px;
      }
    }
  }

  h2 {
    margin: 32px 0 59px;

    font-family: var(--font-nunito);
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
    margin-bottom: 4px;

    font-weight: 600;
    font-size: 22px;
    line-height: 27px;
    text-align: center;

    color: var(--txt-dark-blue);
    &.mb {
      margin-bottom: 32px;
    }
  }

  &-tracker {
    display: flex;
    flex-direction: column;
    padding: 0 12px;
  }
  &-list {
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
    padding: 0 12px;
    &.with-limit {
      height: 337px;
    }
  }
}
</style>
