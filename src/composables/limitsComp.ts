import { ObjectInterface } from "@/types/dataInterfaces";
import { computed, ref } from "vue";
import { currentData, parseDate } from "@/composables/common/dateComposable";

const defaultLimits = {
  browserLimit: false,
  browserTime: {
    date: parseDate(String(currentData.value)),
    timeLimit: 0,
    timeSpent: 0,
  },
  list: {},
};

export const limitsData = ref({
  ...defaultLimits,
} as ObjectInterface);

export const isLengthList = computed(() => {
  return (
    limitsData.value &&
    limitsData.value.list &&
    Object.keys(limitsData.value.list).length
  );
});

export const editLimits = (key: string, data: any) => {
  limitsData.value[key] = data;
  setLimits();
};

export const getLimits = () => {
  chrome.storage.local.get(["limits"], (result) => {
    if (!result.limits) {
      limitsData.value = { ...defaultLimits };
      setLimits();
    } else {
      limitsData.value = result.limits;
    }
  });
};

export const setLimits = () => {
  chrome.storage.local.set(
    {
      limits: limitsData.value,
    },
    () => {
      getLimits();
    }
  );
};

export const saveGlobalLimit = (time: number) => {
  getLimits();
  limitsData.value.browserTime.timeLimit = time;
  setLimits();
};
