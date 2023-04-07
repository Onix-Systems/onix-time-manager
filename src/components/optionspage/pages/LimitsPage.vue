<template lang="pug">
.limits-page
  .limits-page--title {{ "Daily restrictions" }}
  .limits-page--user-section
    input.name(placeholder="Enter site name", v-model="name")
    .time-section(@click="openModal()")
      input.time(placeholder="Time", v-model="time", disabled)
    button.save(@click="addSiteToBlock") {{ "Save" }}
    time-modal
  .limits-page--list(:class="{ empty: !isEmpty }")
    template(v-if="isEmpty")
      .content
        .item(v-for="(item, index) in history")
          .item--info
            .item--icon(:style="{ backgroundImage: `url(${item.icon})` }")
            .item--name {{ item.url }}
            .item--edit(:class="{ edit: activeItem === index }")
              .item--time {{ formatTime(item.blockTimeSeconds, true, true) }}
              time-modal(
                :show="activeItem === index",
                :itemModal="true",
                :itemTime="item.blockTimeSeconds",
                @cancel="checkItem(index)",
                @updateTime="updateTime(index, $event)"
              )
          .item--btns
            button.edit(v-if="activeItem !== index", @click="checkItem(index)")
            button.trash(@click="deleteItem(item)")
    template(v-else)
      .limits-page--text {{ "There are no restrictions here, you can use this sites from the history" }}
      .limits-page--history
        .item(v-for="item in topTasks.slice(0, 3)", @click="name = item.url")
          .item--icon(:style="{ backgroundImage: `url(${item.icon})` }")
          .item--name {{ item.url }}
  .limits-page--notification.notification
    .notification--title {{ "You can set message for notification" }}
    .notification--text-section
      .notification--text-actions(:class="{ edit: showSave }")
        .notification--subtitle {{ "Time Management Team" }}
        button.notification--save(
          @click="updateNotificationMassage",
          v-if="showSave"
        ) {{ "Save" }}
      textarea.notification--input(
        ref="textarea",
        v-model="notification",
        @focus="showSave = true"
      )
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  openModal,
  timeToSeconds,
  modalTime,
  resetModalTime,
} from "@/composables/OptionsActions";
import TimeModal from "@/components/optionspage/TimeModal.vue";
import { formatTime, topTasks } from "@/composables/chartConfig";
import { useClickOutside } from "@/composables/clickOutside";

const name = ref("");
const showSave = ref(false);
const textarea = ref();
useClickOutside(textarea, () => {
  if (showSave.value) {
    showSave.value = !showSave.value;
  }
});
const time = computed(() => {
  const seconds = timeToSeconds(modalTime);
  return seconds ? formatTime(seconds, true, true) : "";
});

const notification = ref("");

const activeItem: any = ref(null);
const checkItem = (index: number) => {
  if (activeItem.value === null || activeItem.value !== index) {
    activeItem.value = index;
  } else if (activeItem.value === activeItem.value) {
    activeItem.value = null;
  }
};

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
  getNotificationMassage();
});

const updateNotificationMassage = () => {
  chrome.storage.local.set(
    {
      notificationMassage: notification.value,
    },
    () => {
      getNotificationMassage();
    }
  );
};
const getNotificationMassage = () => {
  chrome.storage.local.get(["notificationMassage"], (result) => {
    notification.value = result.notificationMassage;
    if (!result.notificationMassage) {
      notification.value =
        "We wanted to inform you that you have reached your daily limit. Further tracking beyond this point will not be recorded.";
      updateNotificationMassage();
    }
  });
};
const addSiteToBlock = () => {
  // To add a new blocked site and its duration:
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

const deleteItem = (item: any) => {
  chrome.storage.local.set(
    {
      limitsSites: history.value.filter((site: any) => site.url !== item.url),
    },
    () => {
      updateHistory();
      name.value = "";
      resetModalTime();
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
    .save,
    .time {
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
      max-width: 328px;
      font-weight: 400;
      background: #ecf3fa;
    }
    .time {
      cursor: pointer;
      position: relative;
      max-width: 197px;
      padding-right: 44px;
      font-weight: 400;
      background: #ecf3fa;
      &-section {
        cursor: pointer;
        position: relative;
        &::before {
          position: absolute;
          content: "";
          z-index: 1;
          display: block;
          top: calc(50% - 9px);
          right: 12px;
          width: 20px;
          height: 20px;
          background-image: url("@/assets/clock.svg");
          background-repeat: no-repeat;
          background-size: contain;
        }
      }
    }
    .save {
      cursor: pointer;
      max-width: 120px;
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
      &--time {
        padding: 0 16px;
        font-weight: 500;
        font-size: 14px;
        line-height: 17px;
        color: #3e4552;
      }
      &--edit-btn {
        display: none;
      }
      &--edit.edit {
        display: flex;
        gap: 10px;
        position: relative;
        &::v-deep(.modal-time) {
          top: 46px;
          left: -55px;
          right: inherit;
        }
        .item--time {
          cursor: pointer;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          height: 40px;
          background: #ecf3fa;
          border: 1px solid #4196db;
          border-radius: 4px;
        }
        .item--edit-btn {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 40px;
          padding: 0;
          font-style: normal;
          font-weight: 600;
          font-size: 14px;
          line-height: 17px;
          color: #e9eaec;
          border: none;
          background: #4477d4;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
          border-radius: 4px;
        }
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
        .edit {
          background-image: url("@/assets/edit.svg");
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
  .notification {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    margin-top: 36px;
    padding-top: 65px;
    min-height: 335px;
    background: #ecf3fa;
    border-radius: 12px;
    &--title {
      max-width: 300px;
      margin: 0 auto 26px;
      font-style: normal;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      text-align: center;
    }
    &--text-section {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: 468px;
      margin: 0 auto;
      padding: 20px;
      background: #66656b;
      border-radius: 8px;
    }
    &--text-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      &.edit {
        margin-bottom: 16px;
      }
    }
    &--save {
      cursor: pointer;
      width: 120px;
      height: 36px;
      border: none;
      padding: 0;
      background: #4477d4;
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
      border-radius: 4px;
      font-weight: 600;
      color: #e9eaec;
    }
    &--subtitle {
      font-style: normal;
      font-weight: 700;
      font-size: 16px;
      line-height: 19px;
      color: #ffffff;
    }
    &--input {
      box-sizing: border-box;
      resize: none;
      padding: 16px 12px;
      max-height: 76px;
      border-radius: 4px;
      font-family: Inter, sans-serif;
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 15px;
    }
  }
}
</style>
