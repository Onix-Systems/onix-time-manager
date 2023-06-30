<template lang="pug">
.limits
  .option--header
    .option--header-left
      .option--header--title {{ SidebarNamesEnum.LimitsView }}
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
    .limits--block.mb
      .limits--block-left
        .limits--block-column
          .limits--block--title {{ "List of limits" }}
          .limits--block--subtitle {{ "Set up daily limits for sites" }}
        button.content--button.raised.icon.icon--plus(
          :class="{ disabled: !limitsData.sitesLimit }",
          @click="limitsData.sitesLimit ? openModal(EnumModalKeys.Edit) : ''"
        )
      .limits--block-right
        switcher-component(
          :isChecked="limitsData.sitesLimit",
          @update:isChecked="disableLimitsList()"
        )
    empty-template.desktop(
      v-if="!limitsData.sitesLimit",
      :image-path="'off-template.svg'",
      :message="'The list of web time restrictions is disabled. Turn on list for create limits to websites to see them here'"
    )
    empty-template.desktop(
      v-else-if="!isLengthList",
      :image-path="'empty-limits-list.svg'",
      :message="'The list of limits for web time is disabled. Create limits to websites to see them here.'"
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
  :limits-data="limitsData",
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

import { closeModal, isOpen, openModal } from "@/composables/modalActions";

import { EnumModalKeys } from "@/constants/EnumModalKeys";
import EmptyTemplate from "@/components/common/EmptyTemplate.vue";
import TimeModalLimits from "@/modals/TimeModalLimits.vue";
import { convertTimeHMS } from "@/composables/common/dateComposable";
import { defaultLimits } from "@/composables/limitsComp";
import { LimitsInterfaces, LimitSiteInterface } from "@/types/LimitsInterfaces";
import { SidebarNamesEnum } from "@/constants/menuItemsEnum";

onMounted(() => {
  chrome.storage.local.get(["limits"], (result) => {
    if (result && result.limits) {
      limitsData.value = result.limits;
    } else {
      setLimits();
    }
  });
});

const editData = ref({} as LimitSiteInterface | object);
const currentKey = ref("" as any);
const isOpenTimeLimit = ref(false as boolean);

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

const closeEditModal = () => {
  chrome.storage.local.get(["limits"], (result) => {
    if (result && result.limits) {
      limitsData.value = result.limits;
      resetEdit();
      closeModal(EnumModalKeys.Edit);
    }
  });
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
  const limitsList: LimitSiteInterface[] = { ...limitsData.value.list };
  editData.value =
    Object.values(limitsList).find(
      (item: LimitSiteInterface) => item.domain === key
    ) || {};
  currentKey.value = key;
  openModal(EnumModalKeys.Edit);
};
const deleteItem = (key: string) => {
  currentKey.value = key;
  openModal(EnumModalKeys.Delete);
};

const setLimits = () => {
  chrome.storage.local.set({ limits: limitsData.value });
};

const deleteAction = () => {
  chrome.storage.local.get("limits").then((res) => {
    const { limits } = res;
    if (limits) {
      limitsData.value = limits;
    }
    delete limitsData.value.list[currentKey.value];
    chrome.storage.local.get("timeSpent").then((res) => {
      const timeSpent = {
        date: new Date().toISOString().split("T")[0],
        general: 0,
        list: {} as { [key: string]: number },
      };
      if (res.timeSpent) {
        timeSpent.date = res.timeSpent.date;
        timeSpent.general = res.timeSpent.general;
        timeSpent.list = res.timeSpent.list;
        delete timeSpent.list[currentKey.value];
        chrome.storage.local.set({ timeSpent });
      }
    });
    setLimits();
    editData.value = {};
  });
};

const openTimeLimit = () => {
  if (limitsData.value.browserLimit) {
    isOpenTimeLimit.value = !isOpenTimeLimit.value;
  }
};

const isOpenSchedule = ref(false);

const openSchedule = () => {
  if (limitsData.value.browserLimit) {
    if (isOpenSchedule.value) {
      isOpenTimeLimit.value = false;
    }
    isOpenSchedule.value = !isOpenSchedule.value;
  }
};

const localLimit = ref(0);

const saveLocalGlobalLimit = (time: number) => {
  isOpenTimeLimit.value = false;
  localLimit.value = time;
  saveGlobalLimit(
    localLimit.value ? localLimit.value : limitsData.value.browserTime.timeLimit
  );
  chrome.storage.local.get("timeSpent").then((res) => {
    const timeSpent = {
      date: new Date().toISOString().split("T")[0],
      general: 0,
      list: {},
    };
    if (res.timeSpent) {
      timeSpent.list = res.timeSpent.list;
      chrome.storage.local.set({ timeSpent });
    }
    chrome.storage.local.set({ timeSpent });
  });
  localLimit.value = 0;
};

const disableBrowser = () => {
  if (limitsData.value.browserLimit) {
    localLimit.value = 0;
    isOpenSchedule.value = false;
    isOpenTimeLimit.value = false;
  }
  limitsData.value.browserLimit = !limitsData.value.browserLimit;
  setLimits();
};

const disableLimitsList = () => {
  limitsData.value.sitesLimit = !limitsData.value.sitesLimit;
  setLimits();
};

const saveGlobalLimit = (time: number) => {
  chrome.storage.local.get("limits").then((res) => {
    const { limits } = res;
    if (limits) {
      limitsData.value = limits;
    }
    limitsData.value.browserTime.timeLimit = time;
    setLimits();
  });
};
</script>

<style scoped lang="scss">
.limits {
  &--block {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    &.mb {
      margin-bottom: 23px;
      .limits--block-left {
        display: flex;
        align-items: center;
        .content--button.raised.icon.icon--plus {
          align-items: center;
          width: 32px;
          padding: 0;
          margin-left: 7px;
          outline: none;
          border-radius: 50%;
          &::before {
            margin: 0;
          }
        }
      }
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
