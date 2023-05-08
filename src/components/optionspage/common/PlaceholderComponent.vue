<template lang="pug">
.placeholder
  p.text
    slot
  img(v-if="imgName", :src="require(`@/assets/${imgName}`)")
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  imgName: {
    type: String,
    default: "",
  },
});
</script>

<style scoped lang="scss">
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  margin-top: 80px;

  gap: 35px;

  .text {
    width: 486px;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 22px;
    text-align: center;

    color: var(--txt-light-grey);
  }
  .img {
    user-select: none;
    width: 206px;
    height: 159px;
    margin-top: 35px;
  }
}
</style>
