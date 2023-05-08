<template lang="pug">
option-layout
</template>

<script setup lang="ts">
import OptionLayout from "@/layouts/OptionLayout.vue";
import { onMounted } from "vue";
import { getPermission } from "@/composables/permissionComp";

onMounted(() => {
  getPermission();
});
</script>

<style scoped lang="scss"></style>
