<template lang="pug">
.limits-page--content
  template(v-if="!isLoader(EnumLoaderKeys.popupLimits)")
    .limits-page--content-tracker(v-if="limitsObject.browserLimit")
      h2.title The browser will be block after
      p.subtitle(:class="{ mb: isLengthList }") {{ globalLimit }}
    .limits-page--content-list(
      v-if="isLengthList",
      :class="{ 'with-limit': limitsObject.browserLimit }"
    )
      list-items(:items="limitsObject.list", :limits="true", :block="true")
    empty-template.fixed(
      v-else,
      :image-path="'empty-limits-list.svg'",
      :message="'The list of limits for web time is empty. Create limits to websites to see them here.'"
    )
      button.content--button.tab-active.icon.icon--plus(
        @click="openOptions(MenuItemsEnum.Limits)"
      ) Add limit
  .loader(v-else)
    circul-loader
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import ListItems from "@/components/common/ListItems.vue";
import EmptyTemplate from "@/components/common/EmptyTemplate.vue";

import { openOptions } from "@/composables/popup/common/popupActions";
import { limitsData, getLimits, isLengthList } from "@/composables/limitsComp";
import { UserData } from "@/composables/scheduleComp";

import { ObjectInterface } from "@/types/dataInterfaces";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { validUrlRegex } from "@/composables/common/dateComposable";
import {
  finishLoader,
  isLoader,
  loaderKeys,
  startLoader,
} from "@/composables/common/loaderActions";
import { EnumLoaderKeys } from "@/constants/EnumLoaderKeys";
import CirculLoader from "@/components/common/CirculLoader.vue";

let intervalId = 0;
const currentUrl = ref("");

onMounted(() => {
  startLoader(EnumLoaderKeys.popupLimits);
  getLimits();
  const browserTime = { ...limitsObject.value.browserTime };
  const limitTime = browserTime.timeLimit;
  let timeSpent = browserTime.timeSpent;
  if (limitTime - timeSpent > 0) {
    editConvertedDate(limitTime - timeSpent);
  }
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs && tabs.length && validUrlRegex.test(`${tabs[0].url}`)) {
      currentUrl.value = `https://${new URL(String(tabs[0].url)).hostname}/`;
      intervalId = setInterval(() => {
        if (limitsObject.value.browserLimit) {
          const blockAfter = limitTime - timeSpent;
          if (!blockAfter || blockAfter === -Math.abs(blockAfter)) {
            clearInterval(intervalId);
          } else {
            editConvertedDate(blockAfter);
            timeSpent += 1;
          }
        }
        const sitesKeys = Object.keys(limitsObject.value.list);
        if (limitsObject.value && sitesKeys.length) {
          if (sitesKeys.includes(currentUrl.value)) {
            const site = limitsObject.value.list[currentUrl.value].siteLimit;
            const blockAfter = site.timeLimit - site.timeSpent;
            if (!blockAfter || blockAfter === -Math.abs(blockAfter)) {
              clearInterval(intervalId);
            } else {
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
  return `${String(convertedDate.value.hour).padStart(2, "0")}h ${String(
    convertedDate.value.minute
  ).padStart(2, "0")}m ${String(convertedDate.value.seconds).padStart(
    2,
    "0"
  )}s`;
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
