<template lang="pug">
.tracker
  .tracker--nav-section
    filter-select
  .tracker--sites-list(v-show="!isSelectedSite")
    sites-list
  .tracker--sites-bar(v-show="isSelectedSite")
    site-info
</template>

<script setup lang="ts">
import {
  getHistory,
  selectNavItem,
} from "@/composables/popup/pages/trackerPageActions";
import { onMounted } from "vue";
import { isSelectedSite } from "@/composables/common/chartBar";
import FilterSelect from "@/components/common/FilterSelect.vue";
import SiteInfo from "@/components/popup/SiteInfo.vue";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import SitesList from "@/components/common/SitesList.vue";

onMounted(() => {
  getHistory();
  selectNavItem(PopupTrackerNavItemsEnum.day);
});
</script>

<style scoped lang="scss">
.tracker {
  height: calc(100%);
  &--nav-section {
    padding: 0 10px;
    margin-bottom: 10px;
  }
  &--sites-list {
    overflow-x: hidden;
    overflow-y: auto;
    height: calc(100% - 45px);
    padding-left: 12px;
    &::v-deep(.percent-section--line) {
      max-width: 224px;
    }
  }
}
</style>
