<!-- <template>
  <div>
    <h1>Browsing History</h1>
    <ul>
      <li v-for="url in urls" :key="url">{{ url }}</li>
    </ul>
  </div>
</template>

<script>
// import ChromePlugin from "../pligins/ChromePlugin.js";
export default {
  data() {
    return {
      urls: []
    };
  },
  mounted() {
    chrome.history.search({ text: "" }, (historyItems) => {
      const urls = historyItems.map((item) => item.url);

      this.urls = urls;
    });

    chrome.history.onVisited.addListener((historyItem) => {
      this.urls.push(historyItem.url);
    });
  },
};
</script> -->
<template>div</template>
<script></script>
