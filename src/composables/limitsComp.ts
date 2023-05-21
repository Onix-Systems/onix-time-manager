import { currentData, parseDate } from "@/composables/common/dateComposable";
import { LimitsInterfaces } from "@/types/LimitsInterfaces";

export const defaultLimits = {
  browserLimit: false,
  sitesLimit: false,
  browserTime: {
    date: parseDate(String(currentData.value)),
    timeLimit: 0,
    timeSpent: 0,
  },
  list: {},
} as LimitsInterfaces;
