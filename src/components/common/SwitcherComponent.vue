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
  width: 54px;
  height: 24px;

  input[type="checkbox"] {
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    border: none;
    &:checked {
      &:before {
        display: none;
      }
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 24px;
    width: 54px;
    background: var(--bttn-active-lightblue);
    border-radius: 15px;
    transition: 0.4s;

    &-before {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: var(--white);
      border-radius: 50%;
      transition: 0.4s;
    }

    &.checked {
      .slider-before {
        transform: translateX(30px);
        background-color: var(--txt-dark-blue);
      }
    }
  }
}
</style>
