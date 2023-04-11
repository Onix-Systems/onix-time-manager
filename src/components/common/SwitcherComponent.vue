<template lang="pug">
.switch(@click="toggleSwitch")
  input(type="checkbox", :checked="isChecked")
  .slider(:class="{ checked: isChecked }")
    .slider-before
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
const emit = defineEmits(["update:isChecked"]);
const props = defineProps({
  isChecked: Boolean,
});
const toggleSwitch = () => {
  emit("update:isChecked", !props.isChecked);
};
</script>

<style scoped lang="scss">
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 28px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 11px;
    left: 0;
    right: 0;
    bottom: 0;
    height: 9px;
    background: #e6e6e6;
    border-radius: 4px;
    transition: 0.4s;

    &-before {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      width: 28px;
      left: 0;
      bottom: -8px;
      background-color: #585858;
      border-radius: 50%;
      transition: 0.4s;
      &::before {
        content: "";
        display: block;
        height: 14px;
        width: 14px;
        background-color: #4b4b4b;
        border-radius: 50%;
      }
    }

    &.checked {
      .slider-before {
        transform: translateX(19px);
        background-color: #4196db;
        &::before {
          background-color: #3a87c6;
        }
      }
    }
  }
}
</style>
