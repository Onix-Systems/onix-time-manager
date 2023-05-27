<template lang="pug">
.sites(
  v-if="!isLoader(EnumLoaderKeys.trackingList)",
  :class="{ sites__selected: currentSessionData.currentUrl && isShowCurrentSession }"
)
  .sites--item(
    v-for="item in historyList",
    :class="{ 'current-session': item.domain === currentSessionData.currentUrl }",
    @click="selectSite(item)"
  )
    domain-list-item(
      :item="item",
      show-sessions="true",
      :current-time="current(item)",
      :total-time="totalTime"
    )
    .sites--item-activity
      .item-block
        .item-block--title {{ "Current Session" }}
        .item-block--info {{ format(sessionMask(current(item)), current(item), true, false) }}
      .item-block
        .item-block--title {{ "Longest Session" }}
        .item-block--info {{ format(sessionMask(longest(item)), longest(item), true, false) }}
      .item-block
        .item-block--title {{ "Sessions" }}
        .item-block--info {{ item.sessions.length }}
.loader(v-else)
  circul-loader
</template>

<script setup lang="ts">
import { computed, defineProps, onBeforeUnmount, ref, watch } from "vue";

import CirculLoader from "@/components/common/CirculLoader.vue";
import DomainListItem from "@/components/DomainListItem.vue";

import {
  createStructure,
  currentSessionData,
  selectedNavItem,
  timeSpentCalculation,
  totalTimeCalculation,
} from "@/composables/common/trackerPageActions";
import { isLoader } from "@/composables/common/loaderActions";
import { selectSite } from "@/composables/common/chartBar";
import { format } from "@/composables/common/dateComposable";

import { EnumLoaderKeys } from "@/constants/EnumLoaderKeys";

import { HistoryListInterface } from "@/types/TrackingInterface";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";

const props = defineProps({
  isShowCurrentSession: {
    type: Boolean,
    default: true,
  },
});

const historyList = ref<HistoryListInterface[]>([]);
const counter = ref(0);
const interval = setInterval(() => {
  counter.value++;
}, 1000);

watch(
  () => selectedNavItem.value,
  () => {
    counter.value = 0;
    getData();
  }
);

const getData = () => {
  chrome.storage.local.get({ pages: {} }, (result) => {
    if (result.pages) {
      const structuredArray = createStructure(result.pages);
      const filteredArray = filterByPeriod(structuredArray);
      historyList.value = filteredArray;
      sortByTime();
    }
  });
};

getData();

const totalTime = computed(
  () =>
    historyList.value.reduce(
      (a, b) => a + totalTimeCalculation(b.sessions),
      0
    ) + counter.value
);

const sortByTime = () => {
  historyList.value.sort((a, b) => {
    return totalTimeCalculation(b.sessions) - totalTimeCalculation(a.sessions);
  });
};
const sessionMask = (count: number) => {
  const mask = ["sss"];
  if (count > 60) {
    mask.unshift("mmm");
  }
  if (count > 3600) {
    mask.unshift("Hh");
  }

  if (!(count % 60)) {
    mask.splice(mask.length - 1, 1);
  }
  if (!(count % 3600)) {
    mask.splice(mask.length - 1, 1);
  }
  return mask.join(" ");
};
const filterByPeriod = (data: HistoryListInterface[]) => {
  chrome.storage.local.get(["tabInfo"], ({ tabInfo }) => {
    console.log(tabInfo, data);
  });
  if (selectedNavItem.value === PopupTrackerNavItemsEnum.total) {
    return data;
  } else {
    return data.filter((list) => {
      return list.sessions.filter((session) => {
        return session.activity.filter((activity) => {
          switch (selectedNavItem.value) {
            case PopupTrackerNavItemsEnum.day: {
              const condition = (date: number) => {
                return new Date().getDate() === new Date(date).getDate();
              };
              return condition(activity.begin) && condition(activity.end!);
            }
            case PopupTrackerNavItemsEnum.month: {
              const condition = (date: number) => {
                return new Date().getMonth() === new Date(date).getMonth();
              };
              return condition(activity.begin) && condition(activity.end!);
            }
            default: {
              const day = new Date().getDay();
              const diff = new Date().getDate() - day + (!day ? -6 : 1);
              const monday = new Date(new Date().setDate(diff));
              const condition = (date: number) => {
                return new Date(date).getDate() - monday.getDate() <= 7;
              };
              return condition(activity.begin) && condition(activity.end!);
            }
          }
        }).length;
      }).length;
    });
  }
};
const current = (item: HistoryListInterface) => {
  if (item.domain === currentSessionData.value.currentUrl) {
    const findElement = item.sessions.find(
      (f) => +f.tab_id === +currentSessionData.value.currentTab
    );
    let result = 0;
    if (findElement) {
      result = timeSpentCalculation(findElement.activity);
    }
    return result + counter.value;
  }
  return 0;
};
const longest = (item: HistoryListInterface) => {
  const sessions = [...item.sessions];
  const timeSpent = timeSpentCalculation(
    sessions.sort(
      (a, b) =>
        timeSpentCalculation(b.activity) - timeSpentCalculation(a.activity)
    )[0].activity
  );

  return current(item) > timeSpent ? current(item) : timeSpent;
};

onBeforeUnmount(() => {
  clearInterval(interval);
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
  margin: calc(50% - 16px) calc(50% - 16px);

  &:before {
    content: "";
    display: block;
    position: absolute;
    width: 32px;
    height: 32px;

    border-radius: 50%;
  }
}
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

    &-activity {
      display: none;
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
  }

  &__selected {
    position: relative;
    padding-top: 150px;

    .current-session {
      position: absolute;
      top: 0;
      flex-direction: column;
      justify-content: space-between;

      height: 143px;
      background: var(--backgr-card-lightgrey);

      .sites--item-content {
        padding-top: 6px;
      }

      ::v-deep(.percent-section--line) {
        background: white;
      }

      ::v-deep(.sessions) {
        visibility: hidden;
      }

      .sites--item-activity {
        display: flex;
      }
    }
  }
}
</style>
