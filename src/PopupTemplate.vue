<template lang="pug">
header-component
action-bar
footer-component
</template>

<script lang="ts" setup>
import HeaderComponent from "@/components/popup/HeaderComponent.vue";
import ActionBar from "@/components/ActionBar.vue";
import FooterComponent from "@/components/popup/FooterComponent.vue";
</script>

<style lang="scss">
#popup {
  width: 425px;
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
