<template lang="pug">
.settings-page
  .option--header
    .option--header-left
      .option--header--title {{ MenuItemsEnum.Settings }}
  .settings-page--content
    .settings-page--section
      .item
        .item--main
          span.title Parents control
          span.subtitle Set password for child safety
      .option
        switcher-component(
          :isChecked="settingsData.password",
          @update:isChecked="editShowSetPassword()"
        )
    .settings-page--section
      .item
        .item--main
          span.title White/Blacklist
          span.subtitle Turn on or turn off the lists of web sites with permission to access
      .option
        switcher-component(
          :isChecked="permissionData.permission !== 'off'",
          @update:isChecked="togglePermission()"
        )
    .settings-page--section
      .item
        .item--main
          span.title Notifications
          span.subtitle Get limit-notification before to block site
        .item--textarea(:class="{ disabled: !settingsData.getNotification }")
          span.info Show limit notification to 5 minutes before the blocking website
          .textarea-wrapper
            span.title You can change the message of the notification
            textarea(
              v-model="settingsData.notification",
              @change="setSettings"
            )
      .option
        switcher-component(
          :isChecked="settingsData.getNotification",
          @update:isChecked="updateSettings('getNotification', $event)"
        )
    .settings-page--section
      .item
        .item--main
          span.title Delete Extension Settings
          span.subtitle Reset settings and delete all of your website history
      .option
        button.clear(@click="openModal(EnumModalKeys.Delete)") Delete Data
set-password(v-if="showSetPassword")
delete-modal(
  v-if="isOpen(EnumModalKeys.Delete)",
  :delete-type="`Extension Settings`",
  :delete-context="`You extension data (history, limits, permission & tracking data) will be resetting to default parameters.`",
  @onSubmit="clearStorage",
  @onClosed="closeModal(EnumModalKeys.Delete)"
)
</template>

<script setup lang="ts">
import SwitcherComponent from "@/components/common/SwitcherComponent.vue";

import SetPassword from "@/modals/SetPassword.vue";
import DeleteModal from "@/modals/common/DeleteModal.vue";

import { closeModal, isOpen, openModal } from "@/composables/modalActions";
import { permissionData } from "@/composables/permissionComp";
import {
  settingsData,
  showSetPassword,
  updateSettings,
  editShowSetPassword,
  setSettings,
} from "@/composables/settingsComp";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { EnumModalKeys } from "@/constants/EnumModalKeys";

const clearStorage = () => {
  chrome.storage.local.clear(() => {
    location.reload();
  });
};
</script>

<style scoped lang="scss">
.settings-page {
  &--header {
    display: block;
    width: 100%;

    margin-bottom: 21px;

    text-align: left;
    font-style: normal;
    font-weight: 600;
    font-size: 28px;
    line-height: 34px;
  }
  &--content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 16px;
    margin: 0 auto;
  }
  &--section {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    width: 100%;
    .item {
      display: flex;
      flex-direction: column;
      width: 100%;
      &--main {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: 10px 0 16px 0;
        height: 67px;
        gap: 4px;
        .title {
          font-style: normal;
          font-weight: 500;
          font-size: 18px;
          line-height: 22px;
        }
        .subtitle {
          font-style: normal;
          font-weight: 500;
          font-size: 12px;
          line-height: 15px;
          color: var(--txt-water-link);
        }
      }
      &--textarea {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;

        margin-top: 26px;
        &.disabled {
          pointer-events: none;
          cursor: not-allowed;
          user-select: none;
          opacity: 0.5;
        }
        .info {
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 17px;
          color: var(--txt-water-link);

          margin-bottom: 19px;
        }
        .textarea-wrapper {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 10px 10px 24px 10px;
          width: fit-content;

          background: var(--bttn-active-lightblue);
          border-radius: 4px;

          .title {
            font-style: normal;
            font-weight: 500;
            font-size: 12px;
            line-height: 17px;
            color: var(--txt-water-link);

            margin-bottom: 8px;
          }
          textarea {
            box-sizing: border-box;
            resize: none;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 22px 16px;
            gap: 10px;

            width: 406px;
            height: 78px;

            background: var(--white);
            border-radius: 4px;
            border: none;

            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 17px;
            color: var(--txt-main-darkblue);
          }
        }
      }
    }
    .option {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 67px;
    }
  }
  &--title {
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
  }
  &--option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
  }
  &--name {
    display: flex;
    gap: 4px;
    span {
      font-weight: 700;
    }
  }
  .reset,
  .clear {
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 199px;
    height: 40px;
    padding: 10px;

    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 20px;
    color: var(--txt-dark-grey);

    border: none;

    background: var(--light_purple);
    border-radius: 6px;
  }
}
</style>
