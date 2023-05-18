<template lang="pug">
.limits
  .option--header
    .option--header-left
      .option--header--title Time Limits
      .option--header--subtitle Set up limits on time which can be used on the site
  .limits--block
    .limits--block-left
      .limits--block--title The limit of use the browser
      .limits--block--subtitle Set up limits for using the browser.
    .limits--block-right
      switcher-component(
        :isChecked="limitsData.browserLimit",
        @update:isChecked="disableBrowser()"
      )
  .limits-content
    .schedule(:class="{ 'schedule--visible': limitsData.browserLimit }")
      .schedule-left
        button.schedule--time(
          :class="{ disable: !limitsData.browserLimit }",
          @click="openTimeLimit()"
        ) {{ `${String(convertTimeToHM.hour).padStart(2, "0")} h ${String(convertTimeToHM.minute).padStart(2, "0")} m` }}
        time-modal-limits(
          v-if="isOpenTimeLimit",
          :itemTimeLimits="convertTimeToHM",
          @cancel="isOpenTimeLimit = false",
          @saveLimits="saveLocalGlobalLimit($event)"
        )
      .schedule-right
        button.content--button.raised(
          :class="{ edit: !isOpenSchedule, disabled: !limitsData.browserLimit }",
          @click="openSchedule()"
        ) {{ isOpenSchedule ? "Save" : "Edit" }}
    .limits--block.mb
      .limits--block-left
        .limits--block--title {{ "List of limits" }}
        .limits--block--subtitle {{ "Set up daily limits for sites" }}
      .limits--block-right
        button.content--button.raised.icon.icon--plus(
          @click="openModal(EnumModalKeys.Edit)"
        ) Add time limit
    empty-template.desktop(
      v-if="!isLengthList",
      :image-path="'empty-limits-list.svg'",
      :message="'The list of limits for web time is empty. Create limits to websites to see them here.'"
    )
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
  v-if="isOpen(EnumModalKeys.Edit)",
  :initial-data="editData",
  :edit-index="currentKey",
  @onClosed="closeEditModal"
)
delete-modal(
  v-if="isOpen(EnumModalKeys.Delete)",
  :delete-type="`time limit`",
  :delete-context="`After deleting you will not be able to use this limit to block the site again`",
  @onSubmit="deleteAction",
  @onClosed="closeModal(EnumModalKeys.Delete)"
)
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import DeleteModal from "@/modals/common/DeleteModal.vue";
import NewLimitsModal from "@/modals/NewLimitsModal.vue";
import SwitcherComponent from "@/components/common/SwitcherComponent.vue";
import ListItems from "@/components/common/ListItems.vue";

import {
  limitsData,
  getLimits,
  isLengthList,
  editLimits,
  saveGlobalLimit,
} from "@/composables/limitsComp";
import { closeModal, isOpen, openModal } from "@/composables/modalActions";

import { EnumModalKeys } from "@/constants/EnumModalKeys";
import EmptyTemplate from "@/components/common/EmptyTemplate.vue";
import TimeModalLimits from "@/modals/TimeModalLimits.vue";
import { convertTimeHMS } from "@/composables/common/dateComposable";

const editData = ref({});
const currentKey = ref("");
const isOpenTimeLimit = ref(false);

const closeEditModal = () => {
  getLimits();
  resetEdit();
  closeModal(EnumModalKeys.Edit);
};

const resetEdit = () => {
  currentKey.value = "";
  editData.value = {};
};

const convertTimeToHM = computed(() => {
  let time = 0;
  if (localLimit.value) {
    time = localLimit.value;
  } else if (limitsData.value && limitsData.value.browserTime) {
    time = limitsData.value.browserTime.timeLimit;
  }
  return convertTimeHMS(time);
});

const editItem = (key: string) => {
  editData.value = { ...limitsData.value.list[key] };
  currentKey.value = key;
  openModal(EnumModalKeys.Edit);
};
const deleteItem = (key: string) => {
  currentKey.value = key;
  openModal(EnumModalKeys.Delete);
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

const openTimeLimit = () => {
  if (limitsData.value.browserLimit && isOpenSchedule.value) {
    isOpenTimeLimit.value = !isOpenTimeLimit.value;
  }
};

const isOpenSchedule = ref(false);

const openSchedule = () => {
  if (limitsData.value.browserLimit) {
    if (isOpenSchedule.value) {
      saveGlobalLimit(
        localLimit.value
          ? localLimit.value
          : limitsData.value.browserTime.timeLimit
      );
      localLimit.value = 0;
      isOpenTimeLimit.value = false;
    }
    isOpenSchedule.value = !isOpenSchedule.value;
  }
};

const localLimit = ref(0);

const saveLocalGlobalLimit = (time: number) => {
  isOpenTimeLimit.value = false;
  localLimit.value = time;
};

const disableBrowser = () => {
  if (limitsData.value.browserLimit) {
    localLimit.value = 0;
    isOpenSchedule.value = false;
    isOpenTimeLimit.value = false;
  }
  editLimits("browserLimit", !limitsData.value.browserLimit);
};

onMounted(() => {
  getLimits();
});
</script>

<style scoped lang="scss">
.limits {
  &--block {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    &.mb {
      margin-bottom: 23px;
    }
    &--title {
      font-style: normal;
      font-weight: 600;
      font-size: 20px;
      line-height: 27px;
      color: var(--txt-main-darkblue);
    }
    &--subtitle {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: var(--txt-light-grey);
    }
    .content--button {
      width: auto;
      height: 32px;
      padding: 6px 21px 6px 26px;

      &.icon--plus {
        &::before {
          background-color: white;
        }
      }
    }
  }
  .option--header {
    margin-bottom: 36px;
  }
  &-content {
    .schedule {
      display: flex;
      justify-content: space-between;
      box-sizing: border-box;
      height: 64px;
      width: 100%;
      margin-top: 15px;
      padding: 16px;
      background: var(--ghost-white);
      border-radius: 6px;
      &--time {
        cursor: inherit;
        font-style: normal;
        font-weight: 600;
        font-size: 20px;
        line-height: 27px;
        color: var(--txt-light-grey);
      }
      &-left {
        display: flex;
        align-items: center;
        position: relative;
      }
      &-right {
        .content--button.raised {
          width: 82px;
          height: 32px;
          padding: 0;
          background: inherit;
          outline: none;
          &.disabled {
            cursor: inherit;
            border: 1px solid var(--txt-light-grey);
            color: var(--txt-light-grey);
          }
        }
      }
      &.schedule--visible {
        background: var(--bttn-delete-lightblue);
        .schedule {
          &--time {
            cursor: pointer;
            color: var(--txt-main-darkblue);
          }
          &-right {
            .content--button.raised {
              background: var(--txt-dark-blue);

              &.edit {
                background: inherit;
                color: var(--txt-dark-blue);
                border: 1px solid var(--txt-dark-blue);
              }
            }
          }
        }
      }
    }
  }
}
</style>
