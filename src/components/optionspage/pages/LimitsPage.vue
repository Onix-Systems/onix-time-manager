<template lang="pug">
.limits
  .option--header
    .option--header-left
      .option--header--title Time Limits
      .option--header--subtitle Set up limits on time which can be used on the site
    .option--header-right
      button.content--button.raised(
        :disabled="!limitsData.listLimit",
        :class="{ disable: !limitsData.listLimit }",
        @click="openModal(EnumModalKeys.LimitsEdit)"
      ) {{ "Add time limit" }}
  .limits--block
    .limits-content--schedule
      .limits--block--title The limit of use the browser
      .limits--block--subtitle Set up limits or schedule of daily use the browser.
    .limits-content--schedule
      switcher-component(
        :isChecked="limitsData.browserLimit",
        @update:isChecked="editLimits('browserLimit', !limitsData.browserLimit)"
      )
  .limits-content
    .limits-content--schedule(
      :class="{ 'schedule--visible': limitsData.browserLimit }"
    )
      schedule-component(
        :class="{ 'schedule--visible': !limitsData.browserLimit }",
        :title="`Schedule for use browser`",
        :isChecked="limitsData.browserLimit",
        @save="saveData()",
        @close="resetUserData()"
      )
    .limits--block
      div
        .limits--block--title {{ "List of limits" }}
        .limits--block--subtitle {{ "Set up daily limits for sites" }}
      switcher-component(
        :isChecked="limitsData.listLimit",
        @update:isChecked="editLimits('listLimit', !limitsData.listLimit)"
      )
    .limits-content--empty-list(v-if="!isLengthList || !limitsData.listLimit")
      .limits-content--notification-text {{ `The list of limits for web time is empty. Create limits to websites to see them here.` }}
      .limits-content--empty-list-icon
    .limits-page--content(v-else)
      list-items(
        :items="limitsData.list",
        :editMode="true",
        :deleteMode="true",
        :limits="true",
        @onEdit="editItem($event)",
        @onDelete="deleteItem($event)"
      )
new-limits-modal(
  v-if="isOpen(EnumModalKeys.LimitsEdit)",
  :initial-data="editData",
  :edit-index="currentKey",
  @onClosed="closeEditModal"
)
delete-modal(
  v-if="isOpen(EnumModalKeys.LimitsDelete)",
  :delete-type="`time limit`",
  :delete-context="`After deleting you will not be able to use this limit to block the site again`",
  @onSubmit="deleteAction",
  @onClosed="closeModal(EnumModalKeys.LimitsDelete)"
)
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import DeleteModal from "@/modals/common/DeleteModal.vue";
import NewLimitsModal from "@/modals/NewLimitsModal.vue";

import ScheduleComponent from "@/components/common/ScheduleComponent.vue";
import SwitcherComponent from "@/components/common/SwitcherComponent.vue";
import ListItems from "@/components/common/ListItems.vue";

import {
  limitsData,
  getLimits,
  resetUserData,
  saveData,
  isLengthList,
  editLimits,
} from "@/composables/limitsComp";
import { closeModal, isOpen, openModal } from "@/composables/modalActions";

import { EnumModalKeys } from "@/constants/EnumModalKeys";

const editData = ref({});
const currentKey = ref("");
const sites = ref([]);
const closeEditModal = () => {
  getLimits();
  resetEdit();
  closeModal(EnumModalKeys.LimitsEdit);
};

const resetEdit = () => {
  currentKey.value = "";
  editData.value = {};
};

const editItem = (key: string) => {
  editData.value = { ...limitsData.value.list[key] };
  currentKey.value = key;
  openModal(EnumModalKeys.LimitsEdit);
};
const deleteItem = (key: string) => {
  currentKey.value = key;
  openModal(EnumModalKeys.LimitsDelete);
};

const deleteAction = () => {
  chrome.storage.local.get("limits").then((res) => {
    const data = { ...res.limits };
    delete data.list[currentKey.value];
    chrome.storage.local.set({ limits: data }).then(() => {
      getLimits();
    });
  });
};

onMounted(() => {
  getLimits();
  resetUserData();
});
</script>

<style scoped lang="scss">
.limits-page--content {
  margin-top: 23px;
}
.redirect-page {
  &--header {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  &--title {
    display: flex;
    flex-direction: column;
    .main {
      font-style: normal;
      font-weight: 600;
      font-size: 28px;
      line-height: 34px;
      color: #545d64;
    }
    .sub {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 17px;
      color: #a9a9a9;
    }
  }
  &--button {
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 170px;
    height: 36px;

    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    color: #a9a9a9;

    background: transparent;
    border: 1px solid #a9a9a9;
    border-radius: 6px;

    &::before {
      content: "";
      display: block;

      width: 10px;
      height: 10px;
      margin-right: 13px;

      background-image: url("@/assets/icons/plus.svg");
      background-size: contain;
      background-repeat: no-repeat;
    }
  }
  &--content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    padding-top: 40px;

    width: 100%;
    height: 100%;

    .item {
      overflow: hidden;
      box-sizing: border-box;
      justify-content: space-between;
      display: flex;

      width: 100%;
      height: 64px;

      padding: 12px;

      border-bottom: 1px solid #bebebe;

      &--main {
        overflow: hidden;
        box-sizing: border-box;
        display: flex;

        height: 100%;
        gap: 12px;
      }

      &--logo {
        display: flex;
        min-width: 40px;
        min-height: 40px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          border-radius: 100%;
        }
      }
      &--info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        gap: 6px;
        span {
          max-width: 400px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .redirect {
          font-style: normal;
          font-weight: 500;
          font-size: 15px;
          line-height: 18px;
          color: #5c5a5a;
        }
        .initial {
          font-style: normal;
          font-weight: 500;
          font-size: 12px;
          line-height: 15px;
          color: #a9a9a9;
        }
      }
      &--controls {
        display: flex;
        max-width: 64px;
        min-width: 64px;
        height: 100%;
        align-items: center;
        justify-content: space-between;

        button {
          cursor: pointer;
          display: block;
          border: none;

          background-color: transparent;
          background-repeat: no-repeat;
          background-size: contain;

          width: 24px;
          height: 24px;
        }
        .delete {
          background-image: url("@/assets/trash-L.svg");
        }
        .return {
          background-image: url("@/assets/settings-L.svg");
        }
      }
    }
  }
}
.content {
  position: absolute;
  top: 0;
  width: 400px;
  padding: 20px;
  background: white;
}
.fullscreen-block {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.limits {
  &--block {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    &--title {
      font-style: normal;
      font-weight: 500;
      font-size: 20px;
      line-height: 24px;
      color: var(--txt-main-darkblue);
    }
    &--subtitle {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 15px;
      color: var(--txt-light-grey);
    }
  }
  .option--header {
    margin-bottom: 36px;
  }
  &-content {
    &--subtitle {
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      line-height: 17px;
      color: #5c5a5a;
    }
    &--slider {
      display: flex;
      gap: 10px;
      box-sizing: border-box;
      padding: 2px;
      height: 36px;
      width: max-content;
      background: #f1f1f3;
      border-radius: 6px;
      &-item {
        position: relative;
        display: flex;
        align-items: center;
        padding: 7px 12px 7px 39px;
        font-style: normal;
        font-weight: 500;
        font-size: 15px;
        line-height: 18px;
        color: #a9a9a9;
        text-transform: capitalize;

        &:before {
          position: absolute;
          content: "";
          width: 15px;
          height: 15px;
          left: 12px;
          background: #ffffff;
          border-radius: 50%;
        }
        &.active {
          color: #5c5a5a;
          background: #ffffff;
          border-radius: 6px;
          &:before {
            background: #f1f1f1;
          }
          &:after {
            position: absolute;
            content: "";
            width: 9px;
            height: 9px;
            left: 15px;
            background: #5c5b5b;
            border-radius: 50%;
          }
        }
      }
    }
    &--notification-text {
      max-width: 418px;
      font-style: normal;
      font-weight: 400;
      font-size: 18px;
      line-height: 22px;
      text-align: center;
      color: #a9a9a9;
    }
    &--off {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      margin-top: 74px;
      &-icon {
        margin-top: 36px;
        background: url("@/assets/icons/smile.svg"), no-repeat, center;
        background-size: cover;
        height: 180px;
        width: 180px;
      }
    }
    &--schedule {
      margin-top: 16px;
      pointer-events: none;
      display: none;
    }
    .limits-content--schedule.schedule--visible {
      opacity: 1;
      pointer-events: visible;
      display: none;
    }
    .schedule.schedule--visible {
      background-color: #f5f5f7;
      display: none;
    }
    &--empty-list {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      margin-top: 74px;
      .limits-content--notification-text {
        max-width: 486px;
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 22px;
        color: var(--txt-light-grey);
      }
      &-icon {
        margin-top: 24px;
        background: url("@/assets/frame-L.svg") no-repeat;
        background-size: contain;
        height: 200px;
        width: 184px;
      }
    }
  }
}
</style>
