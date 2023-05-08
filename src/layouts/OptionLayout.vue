<template lang="pug">
section.option-page(
  v-if="(settingsData && !settingsData.password) || showContent"
)
  .option-page--position
    option-header
    .option-page--content
      template(v-if="MenuItemsEnum.Tracking === activeTabIndex")
        tracking-page
      template(v-if="MenuItemsEnum.Permissions === activeTabIndex")
        permission-page
      template(v-if="MenuItemsEnum.Limits === activeTabIndex")
        limits-page
      template(v-if="MenuItemsEnum.Redirect === activeTabIndex")
        redirect-page
      template(v-if="MenuItemsEnum.History === activeTabIndex")
        history-component
      template(v-if="MenuItemsEnum.Settings === activeTabIndex")
        settings-page
section.password(v-if="settingsData && settingsData.password && !showContent")
  unlock-content-modal
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import OptionHeader from "@/components/optionspage/common/OptionsNav.vue";
import SettingsPage from "@/components/optionspage/pages/SettingsPage.vue";
import UnlockContentModal from "@/modals/UnlockContentModal.vue";
import HistoryComponent from "@/components/optionspage/pages/HistoryComponent.vue";
import LimitsPage from "@/components/optionspage/pages/LimitsPage.vue";
import { activeTabIndex, editTabIndex } from "@/composables/optionsActions";
import {
  settingsData,
  getBytes,
  updateSettingsData,
  showContent,
} from "@/composables/settingsComp";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import TrackingPage from "@/components/optionspage/pages/TrackingPage.vue";
import PermissionPage from "@/components/optionspage/pages/PermissionPage.vue";
import RedirectPage from "@/components/optionspage/pages/RedirectPage.vue";

onMounted(() => {
  showContent.value = false;
  updateSettingsData();
  getBytes();
  editTabIndex(MenuItemsEnum.Tracking);
});
</script>

<style scoped lang="scss">
.option-page {
  min-height: 100vh;
  min-width: 100%;
  &--position {
    display: flex;
    width: 100%;
    height: 100vh;
  }
  &--content {
    overflow: auto;
    box-sizing: border-box;
    width: 100%;
    padding: 40px 24px 0 24px;
  }
}
</style>
