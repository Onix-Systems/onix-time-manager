import { ObjectInterface, ScheduleInterface } from "@/types/dataInterfaces";
import { computed, ref } from "vue";
import { UserData } from "@/composables/scheduleComp";
import { dayData } from "@/composables/common/dateComposable";

const defaultLimits = {
  browserLimit: false,
  listLimit: false,
  browserTimeSpent: {
    date: `${dayData.value.month}.${dayData.value.day}.${dayData.value.year}`,
    time: 0,
  },
  schedule: {
    isAllDay: false,
    selectOption: "Today",
    weekly: [],
    daily: 1,
    date: `${dayData.value.month}.${dayData.value.day}.${dayData.value.year}`,
    timeLimits: { hour: 0, minute: 0 },
  } as ScheduleInterface,
  list: {},
};

export const limitsData = ref({
  ...defaultLimits,
} as ObjectInterface);

export const isLengthList = computed(() => {
  return Object.keys(limitsData.value.list).length;
});

export const editLimits = (key: string, data: any) => {
  if (key === "browserLimit") {
    limitsData.value.browserTimeSpent.time = 0;
  }
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
      resetUserData();
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

export const resetUserData = () => {
  UserData.value = {
    ...limitsData.value.schedule,
  };
};

export const saveData = () => {
  limitsData.value.browserTimeSpent.time = 0;
  limitsData.value.schedule = UserData.value;
  setLimits();
};
