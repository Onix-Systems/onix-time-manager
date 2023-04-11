<template lang="pug">
.popup
  header-component
  action-bar
  footer-component
</template>

<script lang="ts" setup>
import HeaderComponent from "@/components/popup/HeaderComponent.vue";
import ActionBar from "@/components/ActionBar.vue";
import FooterComponent from "@/components/popup/FooterComponent.vue";
import { onMounted } from "vue";
import { updateStorage } from "@/composables/chartConfig";
onMounted(() => {
  updateStorage();
});
</script>

<style lang="scss">
.popup {
  width: 425px;
  height: 600px;
  overflow: hidden;
}
#app {
  margin: 0;
}
body {
  margin: 0;
}
.container {
  padding: 0 20px;
}
</style>
