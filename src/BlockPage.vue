<template lang="pug">
.content
  .content--section
    .content--image
    .content--text
      span {{  "We're sorry, but access to this page has been restricted by child control settings."  }}
      span {{  "Please contact the administrator or adjust your device's settings to access this content."  }}
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  &--section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 674px;
    height: 403px;
    background: #ecf3fa;
    border-radius: 12px;
  }
  &--image {
    width: 114px;
    height: 114px;
    margin-bottom: 26px;
    background: url("@/assets/ad-block.svg"), no-repeat;
    background-size: cover;
  }
  &--text {
    display: flex;
    flex-direction: column;
    max-width: 526px;
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    text-align: center;
  }
}
</style>
