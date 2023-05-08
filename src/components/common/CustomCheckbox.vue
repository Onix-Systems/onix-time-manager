<template lang="pug">
.custom-checkbox
  input(
    type="checkbox",
    :checked="isChecked",
    @change="$emit('update:check', !isChecked)"
  )
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
const props = defineProps({
  isChecked: Boolean,
});
const emit = defineEmits(["update:check"]);
</script>

<style lang="scss" scoped>
input[type="checkbox"] {
  position: relative;
  border: 1px solid #757575;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  line-height: 0;
  margin: 0 0.6em 0 0;
  outline: 0;
  padding: 0 !important;
  vertical-align: text-top;
  height: 20px;
  width: 20px;
  -webkit-appearance: none;
  background: #fff;
}

input[type="checkbox"]:checked {
  opacity: 1;
  &:before {
    display: block;
    content: "";
    position: absolute;
    right: 50%;
    top: 50%;
    width: 4px;
    height: 10px;
    border: solid #7e7e7e;
    border-width: 0 2px 2px 0;
    margin: -1px -1px 0 -1px;
    transform: rotate(45deg) translate(-50%, -50%);
    z-index: 2;
  }
}
</style>
