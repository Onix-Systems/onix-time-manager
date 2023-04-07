<template lang="pug">
.limits-page
  .limits-page--title {{ "Ignored list of domain" }}
  .limits-page--user-section
    input.name(placeholder="Enter site name", v-model="name")
    button.save(@click="addSiteToBlock") {{ "Save" }}
  .limits-page--list(:class="{ empty: !isEmpty }")
    template(v-if="isEmpty")
      .content
        .item(v-for="(item, index) in history")
          .item--info
            .item--icon(:style="{ backgroundImage: `url(${item.icon})` }")
            .item--name {{ item.url }}
          .item--btns
            button.trash(@click="deleteItem(item)")
    template(v-else)
      .limits-page--text {{ "There are no restrictions here, you can use this sites from the history" }}
      .limits-page--history
        .item(v-for="item in topTasks.slice(0, 3)", @click="name = item.url")
          .item--icon(:style="{ backgroundImage: `url(${item.icon})` }")
          .item--name {{ item.url }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { topTasks } from "@/composables/chartConfig";

const name = ref("");

const history: any = ref([]);
const isEmpty = computed(() => {
  return history.value && history.value.length;
});

const updateHistory = () => {
  chrome.storage.local.get(["blockedSites"], (result) => {
    history.value = result.blockedSites;
  });
};

onMounted(() => {
  updateHistory();
});

const addSiteToBlock = () => {
  // To add a new blocked site and its duration:
  chrome.storage.local.get(["blockedSites"], (result) => {
    const blockedSites = result.blockedSites || [];
    if (
      !blockedSites.find((item: any) => item.url.includes(name.value)) &&
      name.value
    ) {
      const site = {
        url: name.value,
        icon: `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${name.value}&size=64`,
      };
      chrome.storage.local.set(
        {
          blockedSites: [...blockedSites, site],
        },
        () => {
          updateHistory();
          name.value = "";
        }
      );
    }
  });
};

const deleteItem = (item: any) => {
  chrome.storage.local.set(
    {
      blockedSites: history.value.filter((site: any) => site.url !== item.url),
    },
    () => {
      updateHistory();
      name.value = "";
    }
  );
};
</script>

<style scoped lang="scss">
.limits-page {
  display: flex;
  flex-direction: column;
  max-width: 669px;
  margin: 0 auto;
  padding: 44px 0 70px 0;
  &--title {
    margin-bottom: 24px;
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
  }
  &--user-section {
    display: flex;
    position: relative;
    gap: 12px;
    margin-bottom: 36px;
    .name,
    .save {
      box-sizing: border-box;
      width: 100%;
      height: 46px;
      padding: 0 12px;
      font-style: normal;
      font-size: 14px;
      line-height: 17px;
      border: none;
      border-radius: 4px;
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    }
    .name {
      max-width: 100%;
      font-weight: 400;
      background: #ecf3fa;
    }
    .save {
      cursor: pointer;
      max-width: 220px;
      background: #4477d4;
      font-weight: 600;
      color: #e9eaec;
    }
  }
  &--list {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 534px;
    padding: 20px 16px;
    background: #ecf3fa;
    border-radius: 12px;
    .content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: auto;
      height: 100%;
    }
    .item {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 16px;
      width: 100%;
      height: 56px;
      background: #ffffff;
      border-radius: 4px;
      &--info {
        display: flex;
        align-items: center;
      }
      &--icon {
        width: 34px;
        height: 34px;
        margin-right: 16px;
        background-size: contain;
      }
      &--name {
        margin-right: 14px;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 130px; /* some width */
      }
      &--btns {
        display: flex;
        align-items: center;
        gap: 12px;
        button {
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          background: inherit;
          border: none;
          background-size: contain;
          background-repeat: no-repeat;
        }
        .trash {
          background-image: url("@/assets/trash.svg");
        }
      }
    }
    &.empty {
      margin: 0 auto;
      padding: 66px 0;
      height: auto;
    }
  }
  &--history {
    display: flex;
    gap: 10px;
    max-width: 510px;
    width: 100%;
    margin: 0 auto;
    .item {
      cursor: pointer;
      box-sizing: border-box;
      padding: 10px 12px;
      height: 46px;
      width: 33.33%;
      &--icon {
        margin-right: 8px;
        width: 100%;
        height: 26px;
        max-width: 26px;
        background-repeat: no-repeat;
        background-size: contain;
      }
      &--name {
        width: 100%;
        margin-right: 0;
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 16px;
      }
    }
  }
  &--text {
    width: 300px;
    margin: 0 auto 26px;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
  }
}
</style>
