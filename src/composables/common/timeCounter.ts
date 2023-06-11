import { ref } from "vue";

export const trackerInterval = ref(0);
export const trackerCounter = ref(0);
export const showTimeLoader = ref(true);
export const initTrackerInterval = () => {
  trackerInterval.value = setInterval(() => {
    chrome.storage.local.get("counter").then((res) => {
      trackerCounter.value = res.counter;
      showTimeLoader.value = false;
    });
  }, 1000);
};

export const destroyTrackerInterval = () => {
  showTimeLoader.value = true;
  if (trackerInterval.value) {
    clearInterval(trackerInterval.value);
  }
};
