<template lang="pug">
tracker-data.dashboard(:popup-view="false")
</template>
<script setup lang="ts">
import { onMounted, watch } from "vue";

import {
  currentData,
  isDay,
  loadData,
  selectedNavItem,
  setToday,
} from "@/composables/popupTrackerActions";

import TrackerData from "@/components/common/TrackerData.vue";

onMounted(() => {
  setToday();
  loadData(true);
});
watch(
  () => selectedNavItem.value,
  () => {
    if (isDay.value) {
      setToday();
    }
    loadData(true);
  }
);
watch(
  () => currentData.value,
  () => {
    loadData(true);
  }
);
</script>

<style scoped lang="scss"></style>
