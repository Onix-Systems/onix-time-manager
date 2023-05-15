<template lang="pug">
.permission
  .option--header
    .option--header-left
      .option--header--title {{ MenuItemsEnum.Permissions }}
      .option--header--subtitle {{ "Block the site without limit or use the schedule for all list" }}
    .option--header-right
      button.option--header-btn(
        :class="{ disable: isOff }",
        @click="!isOff ? openPermissionModal('') : ''"
      ) {{ "Add a website" }}
  .permission-content
    .permission-content--subtitle {{ "Choose one of a list" }}
    .permission-content--slider
      button.permission-content--slider-item(
        v-for="item in Object.values(PermissionList)",
        :class="{ active: permissionData.permission === item }",
        @click="selectList(PermissionList[item])"
      ) {{ item }}
    .permission-content--schedule(v-if="isWhiteList || isBlackList")
      schedule-component(
        :title="`Schedule for ${permissionData.permission}`",
        @save="saveData()",
        @close="resetUserData()"
      )
    .permission-content--empty-list(v-if="showEmptyTemplate")
      .permission-content--notification-text {{ `The ${permissionData.permission} for permissions websites is empty. Add the sites you want to set permission to access.` }}
      .permission-content--empty-list-icon
    .permission-content--off(v-else-if="isOff")
      .permission-content--notification-text {{ "The list option is disabled. You can use all sites without limits." }}
      .permission-content--off-icon
    .limits-page--content(v-else)
      list-items(
        :items="sitesList(permissionData.permission)",
        :deleteMode="true",
        @deleteItem="openPermissionModal($event)",
        @editItem="openPermissionModal($event)",
        :editMode="true"
      )
permission-add-web(
  v-if="isOpen(EnumModalKeys.Permission)",
  :isDelete="!!itemForDelete",
  @close="closePermissionModal()",
  @delete="deleteItem(itemForDelete)",
  @edit="editItem(itemForDelete)"
)
</template>

<script setup lang="ts">
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { PermissionList } from "@/constants/PermissionList";
import { closeModal, isOpen, openModal } from "@/composables/modalActions";
import { EnumModalKeys } from "@/constants/EnumModalKeys";
import PermissionAddWeb from "@/modals/PermissionAddWeb.vue";
import { computed, onMounted, ref } from "vue";
import ListItems from "@/components/common/ListItems.vue";
import ScheduleComponent from "@/components/common/ScheduleComponent.vue";
import {
  deleteItem,
  getPermission,
  isBlackList,
  isLengthBlackList,
  isLengthWhiteList,
  isOff,
  isWhiteList,
  showEmptyTemplate,
  permissionData,
  resetUserData,
  saveData,
  selectList,
  sitesList,
  editItem,
} from "@/composables/permissionComp";
onMounted(() => {
  getPermission();
  resetUserData();
});

const itemForDelete = ref("" as string | number);

const openPermissionModal = (key: number | string) => {
  itemForDelete.value = key;
  openModal(EnumModalKeys.Permission);
};

const closePermissionModal = () => {
  itemForDelete.value = "";
  closeModal(EnumModalKeys.Permission);
};
</script>

<style scoped lang="scss">
.limits-page--content {
  margin-top: 24px;
}
.permission {
  .option--header {
    margin-bottom: 36px;
  }
  &-content {
    &--subtitle {
      margin-bottom: 8px;
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 19px;
    }
    &--slider {
      display: flex;
      gap: 10px;
      box-sizing: border-box;
      padding: 2px;
      height: 36px;
      width: max-content;
      background: inherit;
      border-radius: 6px;
      &-item {
        position: relative;
        display: flex;
        align-items: center;
        padding: 8px 12px 7px 39px;
        font-style: normal;
        font-weight: 700;
        font-size: 15px;
        line-height: 20px;
        color: var(--txt-dark-grey);
        text-transform: capitalize;

        &:before {
          position: absolute;
          content: "";
          width: 15px;
          height: 15px;
          left: 12px;
          background: var(--backgr-card-lightgrey2);
          border-radius: 50%;
        }
        &.active {
          background: var(--bttn-active-lightblue);
          border-radius: 6px;
          &:before {
            background: var(--white);
          }
          &:after {
            position: absolute;
            content: "";
            width: 9px;
            height: 9px;
            left: 15px;
            background: var(--txt-dark-blue);
            border-radius: 50%;
          }
        }
      }
    }
    &--notification-text {
      max-width: 486px;
      font-style: normal;
      font-weight: 500;
      font-size: 20px;
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
        width: 200px;
      }
    }
    &--schedule {
      margin-top: 16px;
      display: none;
    }
    &--empty-list {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      margin-top: 74px;
      .permission-content--notification-text {
        max-width: 486px;
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 22px;
        color: var(--txt-light-grey);
      }
      &-icon {
        margin-top: 24px;
        background: url("@/assets/icons/empty-permission-list.svg") no-repeat;
        background-size: contain;
        height: 200px;
        width: 184px;
      }
    }
  }
}
</style>
