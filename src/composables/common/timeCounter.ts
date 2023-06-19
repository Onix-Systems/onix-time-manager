import { ref } from "vue";
import { reachGlobalLimits } from "@/composables/popupTrackerActions";

export const trackerInterval = ref(0);
export const trackerCounter = ref(0);
export const showTimeLoader = ref(true);
export const initTrackerInterval = () => {
  trackerInterval.value = setInterval(() => {
    if (!reachGlobalLimits.value) {
      chrome.storage.local.get("counter").then((res) => {
        trackerCounter.value = res.counter;
        showTimeLoader.value = false;
      });
    } else {
      showTimeLoader.value = false;
    }
  }, 1000);
};

export const destroyTrackerInterval = () => {
  showTimeLoader.value = true;
  if (trackerInterval.value) {
    clearInterval(trackerInterval.value);
  }
};
