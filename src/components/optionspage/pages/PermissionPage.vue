<template lang="pug">
.permission
  .option--header
    .option--header-left
      .option--header--title {{ MenuItemsEnum.Permissions }}
      .option--header--subtitle Block the site without limit or use the schedule for all list
  .permission-content
    .permission-content--subtitle Choose one of a list
    .permission-content--slider
      button.permission-content--slider-item(
        v-for="item in Object.values(PermissionList)",
        :class="{ active: permissionData.type === item }",
        @click="selectList(PermissionList[item])"
      ) {{ item }}
      .sector-right
        button.content--button.raised.icon.icon--plus(
          :class="{ disabled: isOff }",
          :disabled="isOff",
          @click="openModal(EnumModalKeys.Edit)"
        ) Add a website
    empty-template.desktop(
      v-if="showEmptyTemplate",
      :image-path="'empty-permission-list.svg'",
      :message="`The ${permissionData.type} for permissions websites is empty. Add the sites you want to set permission to access.`"
    )
    empty-template.desktop(
      v-else-if="isOff",
      :image-path="'off-template.svg'",
      :message="'The list option is disabled. You can use all sites without limits.'"
    )
    .limits-page--content(v-else)
      list-items(
        :items="isBlackList ? blackList : whiteList",
        :delete-mode="true",
        :edit-mode="true",
        @onEdit="openItemAction($event, true)",
        @onDelete="openItemAction($event)"
      )
new-permission-modal(
  v-if="isOpen(EnumModalKeys.Edit)",
  :edit-index="editIndex",
  @onClosed="closePermissionModal"
)
delete-modal(
  v-if="isOpen(EnumModalKeys.Delete)",
  :delete-type="`this website`",
  :delete-context="`After deleting you can’t block the site through the one of the list.`",
  @onClosed="closeModal(EnumModalKeys.Delete)",
  @onSubmit="deleteAction"
)
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import ListItems from "@/components/common/ListItems.vue";
import EmptyTemplate from "@/components/common/EmptyTemplate.vue";

import NewPermissionModal from "@/modals/NewPermissionModal.vue";
import DeleteModal from "@/modals/common/DeleteModal.vue";

import { closeModal, isOpen, openModal } from "@/composables/modalActions";
import {
  permissionData,
  isOff,
  isBlackList,
  showEmptyTemplate,
  blackList,
  whiteList,
  getPermission,
  setPermission,
  selectList,
} from "@/composables/permissionComp";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { PermissionList } from "@/constants/PermissionList";
import { EnumModalKeys } from "@/constants/EnumModalKeys";

const editIndex = ref("");

onMounted(() => {
  getPermission();
});

const openItemAction = (key: string, edit = false) => {
  editIndex.value = key;
  openModal(edit ? EnumModalKeys.Edit : EnumModalKeys.Delete);
};

const deleteAction = () => {
  delete permissionData.value.list[
    permissionData.value.type as "whitelist" | "blacklist"
  ][editIndex.value];
  setPermission();
};

const closePermissionModal = () => {
  editIndex.value = "";
  closeModal(EnumModalKeys.Edit);
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
      box-sizing: border-box;

      width: 100%;
      gap: 10px;
      padding: 2px;
      height: 36px;

      background: inherit;
      border-radius: 6px;

      &-item {
        position: relative;
        display: flex;
        align-items: center;

        padding: 8px 12px 7px 39px;

        font-family: var(--font-nunito);
        font-size: 15px;
        font-weight: 700;
        line-height: 20px;
        text-transform: capitalize;

        color: var(--txt-dark-grey);

        &::before {
          position: absolute;
          left: 12px;
          content: "";

          width: 15px;
          height: 15px;

          background: var(--backgr-card-lightgrey2);
          border-radius: 50%;
        }

        &.active {
          color: var(--txt-dark-blue);
          background: var(--bttn-delete-lightblue);
          border-radius: 6px;

          &::before {
            background: var(--white);
          }

          &::after {
            position: absolute;
            left: 15px;
            content: "";

            width: 9px;
            height: 9px;

            background: var(--txt-dark-blue);
            border-radius: 50%;
          }
        }
      }

      .sector-right {
        .content--button {
          width: auto;
          height: 32px;
          padding: 6px 20px;

          &.icon--plus {
            &::before {
              background-color: white;
            }
          }
        }
      }
    }
  }
}
</style>
