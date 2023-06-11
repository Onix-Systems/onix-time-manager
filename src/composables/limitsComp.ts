import { ref } from "vue";

import { parseDate } from "@/composables/common/dateComposable";
import { LimitsInterfaces } from "@/types/LimitsInterfaces";
import { currentData } from "@/composables/popupTrackerActions";

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
