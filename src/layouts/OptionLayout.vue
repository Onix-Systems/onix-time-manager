<template lang="pug">
section.option-page
  .option-page--position
    option-header
    .option-page--content
      template(v-if="0 === activeTabIndex")
        home-page
      template(v-if="1 === activeTabIndex")
        h1 content {{ 1 }}
      template(v-if="2 === activeTabIndex")
        h1 content {{ 2 }}
      template(v-if="3 === activeTabIndex")
        h1 content {{ 3 }}
      template(v-if="4 === activeTabIndex")
        h1 content {{ 4 }}
</template>

<script setup lang="ts">
import OptionHeader from "@/components/OptionHeader.vue";
import { activeTabIndex } from "@/composables/OptionsActions";
import HomePage from "@/components/HomePage.vue";
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
