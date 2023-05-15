<template lang="pug">
.empty-section
  h2 {{ message }}
  img(:src="require(`@/assets/icons/empty/${props.imagePath}`)")
  slot
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  imagePath: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
});
</script>

<style scoped lang="scss">
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    margin: 32px 0 48px;
    padding: 0 24px;

    font-family: var(--font-nunito);
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
    text-align: center;

    color: var(--txt-light-grey);
  }

  img {
    display: block;
    margin: 0 auto;
  }

  &.fixed {
    position: relative;

    ::v-deep(.content--button) {
      position: fixed;
      bottom: 82px;
      left: 12px;

      width: calc(100% - 24px);
    }
  }

  &.desktop {
    h2 {
      max-width: 480px;
      margin: 84px 0 48px;

      font-size: 20px;
      font-weight: 500;
      line-height: 22px;
      text-align: center;
    }
  }
}
</style>
