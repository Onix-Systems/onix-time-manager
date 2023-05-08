<template lang="pug">
.container
  .action-bar
    .action-section
      h2 This website:
      p {{ currentDomain }}
    .action-switch
      input#switch(
        type="checkbox",
        v-model="isChecked",
        @change="toggleBlocks"
      ) 
      label(for="switch")
todays-activity#block1(v-show="!isChecked")
parent-control#block2(v-show="isChecked")
</template>

<script setup lang="ts">
import { defineComponent, ref } from "vue";
import TodaysActivity from "./TodaysActivity.vue";
import ParentControl from "./ParentControl.vue";

const isChecked = ref(false);
const currentUrl = ref("");
const currentDomain = ref("");

const updateCurrentUrl = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentUrl.value = tabs[0].url;
      const urlObj = new URL(currentUrl.value);
      currentDomain.value = urlObj.hostname.split(".").slice(-2).join("."); // extract the domain name
    }
  });
};

const toggleBlocks = () => {
  const block1 = document.getElementById("block1");
  const block2 = document.getElementById("block2");

  if (isChecked.value) {
    block1.style.display = "none";
    block2.style.display = "block";
  } else {
    block1.style.display = "block";
    block2.style.display = "none";
  }
};

updateCurrentUrl();
</script>

<style lang="scss">
.action-bar {
  margin: 0 0 16px 0;
  border-left: 6px solid #e6e6e6;
  height: 55px;
  padding: 0 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  .action-switch {
    position: absolute;
    right: 6px;
    top: 14px;
  }
  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    color: #000000;
  }
  p {
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 17px;
    /* identical to box height */

    color: #585858;
  }
  input[type="checkbox"] {
    height: 0;
    width: 0;
    visibility: hidden;
  }

  label {
    cursor: pointer;
    text-indent: -9999px;
    width: 36px;
    height: 9px;
    background: #e6e6e6;
    display: block;
    border-radius: 4px;
    position: relative;
  }

  label:after {
    content: "";
    position: absolute;
    top: -9px;
    left: 15px;
    width: 28px;
    height: 28px;
    background: #3a87c6;
    border-radius: 90px;
    transition: 0.3s;
  }

  input:checked + label {
    background: #e6e6e6;
  }

  input:checked + label:after {
    left: calc(100% - 5px);
    transform: translateX(-134%);
    background: #585858;
  }

  label:active:after {
    width: 28px;
  }
}
</style>
