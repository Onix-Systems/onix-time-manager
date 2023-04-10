<template lang="pug">
.container
  .header
    .header__block
      .header__block
        img(:src="require('@/assets/logo-time-manager.jpg')")
        h1 Time
          span Management
      button(@click="openOptions")
</template>
<script>
import { ref } from "vue";

export default {
  name: "SitePageInfo",

  setup() {
    const site = ref("");
    const page = ref("");

    // const backgroundPage = chrome.extension.getBackgroundPage();

    site.value = window.location.hostname;
    page.value = window.location.pathname;
    const openOptions = () => {
      return chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
    };

    return {
      openOptions,
      site,
      page,
    };
  },
};
</script>
<style scoped lang="scss">
.header {
  padding: 16px 0;
  &__block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
  }
  img {
    width: 44px;
  }
  h1 {
    margin: 0 0 0 19px;
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 900;
    font-size: 20px;
    line-height: 24px;
    color: #000000;
  }
  span {
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    margin-left: 6px;
    color: #000000;
  }
  button {
    background-image: url("~@/assets/settings.jpg");
    width: 44px;
    height: 44px;
    background-size: cover;
    border: none;
    cursor: pointer;
  }
}
</style>
