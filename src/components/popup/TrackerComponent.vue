<template lang="pug">
.tracker
  .tracker--nav-section
    filter-select
  .tracker--sites-list(
    v-show="!isSelectedSite",
    :class="{ loading: isLoader(EnumLoaderKeys.trackingList) }"
  )
    sites-list
</template>

<script setup lang="ts">
import { isSelectedSite } from "@/composables/common/chartBar";
import FilterSelect from "@/components/common/FilterSelect.vue";
import SitesList from "@/components/common/SitesList.vue";
import { isLoader } from "@/composables/common/loaderActions";
import { EnumLoaderKeys } from "@/constants/EnumLoaderKeys";
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
    padding: 0 12px;

    &::v-deep(.percent-section--line) {
      max-width: 304px;
    }

    &.loading {
      padding: 0;
      overflow: hidden;
    }
  }
}
</style>
