import { selectedNavItem } from "@/composables/common/trackerPageActions";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { computed, ref } from "vue";
import { DateInterface } from "@/types/dataInterfaces";
import { timeForTotal } from "@/composables/common/chartBar";

export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_MINUTE = 60;
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
  if (timeInSeconds) {
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
  }
  return "0 seconds";
};

export enum DiffMeasurements {
  seconds = "seconds",
  minutes = "minutes",
  hours = "hours",
  days = "days",
}
export const dateDiff = (
  a: number | Date,
  b: number | Date,
  measurements: DiffMeasurements = DiffMeasurements.seconds
) => {
  const begin = new Date(a);
  const end = new Date(b);
  let divider = 1000;

  switch (measurements) {
    case DiffMeasurements.minutes: {
      divider *= 60;
      break;
    }
    case DiffMeasurements.hours: {
      divider *= 3600;
      break;
    }
    case DiffMeasurements.days: {
      divider *= 86400;
      break;
    }
  }

  const utc1 = Date.UTC(
    begin.getFullYear(),
    begin.getMonth(),
    begin.getDate(),
    begin.getHours(),
    begin.getMinutes(),
    begin.getSeconds()
  );
  const utc2 = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
    end.getHours(),
    end.getMinutes(),
    end.getSeconds()
  );
  return Math.floor((utc2 - utc1) / divider);
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
export const concatPrefix = (item: string | number) => {
  if (typeof item === "number") {
    item = item.toString();
  }
  return item.padStart(2, "0");
};

export const format = (
  mask: string,
  timeInSeconds: number,
  timeDifference = false,
  usePrefix = true
) => {
  const date = new Date(timeInSeconds);
  const maskKeys = [
    "days",
    "DD",
    "MM",
    "YYYY",
    "hours",
    "HH",
    "H",
    "minutes",
    "mm",
    "seconds",
    "ss",
  ];
  maskKeys.forEach((separator) => {
    if (mask.includes(separator)) {
      let joinContent: number | string = 0;
      switch (separator) {
        case "YYYY": {
          joinContent = `${date.getFullYear()}`;
          break;
        }
        case "MM": {
          joinContent = date.getMonth() + 1;
          if (usePrefix) {
            joinContent = concatPrefix(joinContent);
          }
          break;
        }
        case "days":
        case "DD": {
          if (timeDifference) {
            joinContent = Math.floor(timeInSeconds / 86400);
          } else {
            joinContent = date.getDate();
          }
          if (usePrefix) {
            joinContent = concatPrefix(joinContent);
          }
          break;
        }
        case "H":
        case "hours":
        case "HH": {
          if (timeDifference) {
            let seconds = timeInSeconds;
            if (timeInSeconds > 86400) {
              seconds -= 86400 * Math.floor(timeInSeconds / 86400);
            }
            const calculation = Math.floor(seconds / 3600);
            joinContent = calculation;
          } else {
            joinContent = date.getHours();
          }
          if (usePrefix) {
            joinContent = concatPrefix(joinContent);
          }
          break;
        }
        case "minutes":
        case "mm": {
          if (timeDifference) {
            let seconds = timeInSeconds;
            if (timeInSeconds > 3600) {
              seconds -= 3600 * Math.floor(timeInSeconds / 3600);
            }
            const calculation = Math.floor(seconds / 60);
            joinContent = calculation;
          } else {
            joinContent = date.getMinutes();
          }
          if (usePrefix) {
            joinContent = concatPrefix(joinContent);
          }
          break;
        }
        case "seconds":
        case "ss": {
          const calculation =
            timeInSeconds > 60
              ? timeInSeconds - Math.floor(timeInSeconds / 60) * 60
              : timeInSeconds;
          joinContent = calculation;
          if (usePrefix) {
            joinContent = concatPrefix(joinContent);
          }
          break;
        }
      }
      mask = mask.split(separator).join(joinContent.toString());
    }
  });
  return mask;
};

export const parseDate = (dateString: number | string) => {
  if (dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } else {
    return "";
  }
};

export const convertTimeHMS = (seconds: number) => {
  const hour = Math.floor(seconds / 3600) || "";
  const minute = Math.floor((seconds % 3600) / 60) || "";
  const second = seconds % 60 || "";
  return {
    hour,
    minute,
    second,
  };
};

export const convertToSeconds = ({ hour = 0, minute = 0, second = 0 }) => {
  return hour * 3600 + minute * 60 + second;
};

export const sortByDate = (begin: number, end: number, reversed = false) => {
  const lastItemA = new Date(begin);
  const lastItemB = new Date(end);
  if (lastItemA < lastItemB) {
    return reversed ? -1 : 1;
  } else if (lastItemA > lastItemB) {
    return reversed ? 1 : -1;
  }
  return 0;
};
