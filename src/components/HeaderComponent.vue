<template lang="pug">
.header
  .header__block
    img(src="../assets/logo-time-manager.jpeg")
    h1 Time manager
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
  // width: 350px;
  background-color: #3395bd;
  color: #fff;
  &__block {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  img {
    margin: 0 15px;
    width: 45px;
    border-radius: 62px;
  }
  h1 {
    font-size: 30px;
  }
  button {
    background-image: url("../assets/settings1.webp");
    width: 50px;
    height: 45px;
    border-radius: 62px;
    margin-left: 15px;
    background-size: cover;
    border: none;
    cursor: pointer;
  }
}
</style>
