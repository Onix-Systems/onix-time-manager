<template lang="pug">
.settings-page
  .settings-page--content
    .settings-page--section
      .settings-page--title {{ "Permission" }}
      .settings-page--option
        .settings-page--name {{ "Set password for child privacy" }}
        switcher-component(
          :isChecked="settingsData.password",
          @update:isChecked="editShowSetPassword()"
        )
      template(v-if="settingsData.password")
        .settings-page--option
          .settings-page--name {{ "Allow to set limits" }}
          switcher-component(
            :isChecked="settingsData.limits",
            @update:isChecked="updateSettings('limits', $event)"
          )
        .settings-page--option
          .settings-page--name {{ "Forgot password" }}
          button.reset(@click="editShowSetPassword(true)") {{ "Reset" }}
    .settings-page--section
      .settings-page--title {{ "Notifications" }}
      .settings-page--option
        .settings-page--name {{ "Allow to get notifications" }}
        switcher-component(
          :isChecked="settingsData.getNotification",
          @update:isChecked="updateSettings('getNotification', $event)"
        )
      .settings-page--option
        .settings-page--name {{ "Show limits message before:" }}
        time-dropdown(:name="'limitsMassageTime'")
    .settings-page--section
      .settings-page--title {{ "Tracking" }}
      .settings-page--option
        .settings-page--name {{ "Allow deferring block for 5 minutes" }}
        switcher-component(
          :isChecked="settingsData.tracking",
          @update:isChecked="updateSettings('tracking', $event)"
        )
      .settings-page--option
        .settings-page--name {{ "Stop tracking if no activity detected for:" }}
        time-dropdown(:name="'trackingActivityTime'")
    .settings-page--section
      .settings-page--title {{ "Data usage" }}
      .settings-page--option
        .settings-page--name {{ "Data in memory use" }}
          span {{ bytesInUse + "Kb" }}
        button.clear(@click="clearStorage") {{ "Clear all data" }}
set-password(v-if="showSetPassword")
</template>

<script setup lang="ts">
import SwitcherComponent from "@/components/common/SwitcherComponent.vue";
import {
  bytesInUse,
  settingsData,
  showSetPassword,
  updateSettings,
  editShowSetPassword,
} from "@/composables/settingsComp";
import SetPassword from "@/modals/SetPassword.vue";
import TimeDropdown from "@/components/optionspage/TimeDropdown.vue";

const clearStorage = () => {
  chrome.storage.local.clear(() => {
    location.reload();
  });
};
</script>

<style scoped lang="scss">
.settings-page {
  padding: 70px 0;
  &--content {
    display: flex;
    flex-direction: column;
    gap: 45px;
    width: 669px;
    margin: 0 auto;
  }
  &--section {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
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
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 133px;
    height: 46px;
    padding: 0;
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 19px;

    color: #e9eaec;
    border: none;

    background: #4477d4;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  .clear {
    width: 220px;
  }
}
</style>
