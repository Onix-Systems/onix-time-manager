import { selectedNavItem } from "@/composables/common/trackerPageActions";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { computed, ref } from "vue";
import { DateInterface } from "@/types/dataInterfaces";
import { timeForTotal } from "@/composables/common/chartBar";

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
export const validUrlRegex = /^(http|https):\/\//i;

export const st = ["first", "second", "third"];

export const today = new Date();
export const currentData = ref(
  new Date(today.getFullYear(), today.getMonth(), today.getDate())
);
export const dayOfWeek = computed(() => (currentData.value.getDay() + 6) % 7);
export const monday = computed(() => {
  return new Date(
    currentData.value.getFullYear(),
    currentData.value.getMonth(),
    currentData.value.getDate() - dayOfWeek.value
  );
});
export const yearIndex = computed(() => {
  return currentData.value.getFullYear();
});
export const monthIndex = computed(() => {
  return currentData.value.getMonth() + 1;
});
export const dayIndex = computed(() => {
  return currentData.value.getDate();
});
export const dayData = computed(() => {
  return {
    year: yearIndex.value,
    month: monthIndex.value,
    day: dayIndex.value,
  };
});
export const sevenDays = ref([] as DateInterface[]);
export const date = (i: number) => {
  return new Date(
    monday.value.getFullYear(),
    monday.value.getMonth(),
    monday.value.getDate() + i
  );
};

export const resetCurrentDay = () => {
  currentData.value = today;
};

export const getSevenDays = () => {
  sevenDays.value = [];
  for (let i = 0; i < 7; i++) {
    sevenDays.value.push({
      year: date(i).getFullYear(),
      month: date(i).getMonth() + 1,
      day: date(i).getDate(),
    });
  }
};

export const changeDate = (direction: number) => {
  const newDate = new Date(currentData.value);
  switch (selectedNavItem.value) {
    case PopupTrackerNavItemsEnum.day: {
      newDate.setDate(currentData.value.getDate() + direction);
      break;
    }
    case PopupTrackerNavItemsEnum.week: {
      newDate.setDate(currentData.value.getDate() + direction * 7);
      break;
    }
    case PopupTrackerNavItemsEnum.month: {
      newDate.setMonth(currentData.value.getMonth() + direction);
      break;
    }
  }
  currentData.value = newDate;
};

export const getTimeTotal = (number: number, timeInSeconds: number) => {
  if (!timeInSeconds) {
    return "";
  }
  let result = "";
  const days = Math.floor(timeForTotal.value / SECONDS_PER_DAY);
  const hours = Math.floor(
    (timeForTotal.value - days * SECONDS_PER_DAY) / SECONDS_PER_HOUR
  );
  const minutes = Math.floor(
    (timeForTotal.value - days * SECONDS_PER_DAY - hours * SECONDS_PER_HOUR) /
      SECONDS_PER_MINUTE
  );

  switch (number) {
    case 1: {
      result = days ? `${days} <span>day${days !== 1 ? "s" : ""}</span>` : "";
      break;
    }
    case 2: {
      result = hours
        ? `${hours} <span>hour${hours !== 1 ? "s" : ""}</span>`
        : "";
      break;
    }
    case 3: {
      result = `${minutes} <span>minute${minutes !== 1 ? "s" : ""}</span>`;
      break;
    }
    default:
      break;
  }

  return result;
};

export const timeAmTo24 = (item: string) => {
  const [hourString, period] = item.split(" ");
  let hour = parseInt(hourString);
  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }
  return hour;
};
