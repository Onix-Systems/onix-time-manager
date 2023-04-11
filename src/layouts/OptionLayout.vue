<template lang="pug">
section.option-page(
  v-if="(settingsData && !settingsData.password) || showContent"
)
  .option-page--position
    option-header
    .option-page--content
      template(v-if="MenuItemsEnum.Home === activeTabIndex")
        home-page
      template(
        v-if="MenuItemsEnum.Limits === activeTabIndex && settingsData.limits && settingsData.password"
      )
        limits-page
      template(v-if="MenuItemsEnum.Blocker === activeTabIndex")
        blocker-page
      template(v-if="MenuItemsEnum.History === activeTabIndex")
        history-component
      template(v-if="MenuItemsEnum.Settings === activeTabIndex")
        settings-page
section.password(v-if="settingsData && settingsData.password && !showContent")
  unlock-content-modal
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import OptionHeader from "@/components/optionspage/OptionHeader.vue";
import HomePage from "@/components/optionspage/pages/HomePage.vue";
import LimitsPage from "@/components/optionspage/pages/LimitsPage.vue";
import BlockerPage from "@/components/optionspage/pages/BlockerPage.vue";
import SettingsPage from "@/components/optionspage/pages/SettingsPage.vue";
import HistoryComponent from "@/components/optionspage/pages/HistoryComponent.vue";

import UnlockContentModal from "@/modals/UnlockContentModal.vue";

import { activeTabIndex, editTabIndex } from "@/composables/OptionsActions";
import {
  settingsData,
  getBytes,
  updateSettingsData,
  showContent,
} from "@/composables/settingsComp";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";

onMounted(() => {
  showContent.value = false;
  updateSettingsData();
  getBytes();
  editTabIndex(MenuItemsEnum.Home);
});
</script>

<style scoped lang="scss">
.option-page {
  min-height: 100vh;
  min-width: 100%;
  &--position {
    max-width: 1024px;
    margin: 0 auto;
  }
}
</style>
