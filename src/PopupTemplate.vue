<template lang="pug">
HeaderComponent
UrlsComponents
DoughtChart
history-list
FooterComponent
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import HelloWorld from "./components/popup/HelloWorld.vue";
import HeaderComponent from "./components/popup/HeaderComponent.vue";
import DoughtChart from "./components/common/DoughtChart.vue";
import FooterComponent from "./components/popup/FooterComponent.vue";
import UrlsComponents from "./components/popup/UrlsComponents.vue";
import HistoryList from "@/components/common/HistoryList.vue";
export default defineComponent({
  name: "App",
  components: {
    HistoryList,
    HelloWorld,
    HeaderComponent,
    FooterComponent,
    UrlsComponents,
    DoughtChart,
  },
  data() {
    return {
      chartData: {
        labels: ["January", "February", "March"],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [40, 20, 12],
          },
        ],
      },
      // currentUrl: "",
      site: "",
      page: "",
    };
  },
  mounted() {
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: any[]) {
    //   var currentTab = tabs[0];
    //   var currentUrl = currentTab.url;
    //   var paragraph = document.createElement("p");
    //   paragraph.textContent = currentUrl;
    //   document.body.appendChild(paragraph);
    // });
  },
  // mounted() {
  //   // this.currentUrl = window.location.href;
  //   const currentUrl = this.$getCurrentUrl();
  //   const urlObj = new URL(currentUrl);

  //   this.site = urlObj.hostname;
  //   this.page = urlObj.pathname;
  // },
});
</script>

<style scoped lang="scss">
#app {
  margin: 0 !important;
}
body {
  margin: 0 !important;
}
</style>
