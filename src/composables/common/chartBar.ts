import { computed, ref } from "vue";
import {
  filteringData,
  formatDuration,
  totalTimeSpent,
} from "@/composables/common/trackerPageActions";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import {
  dateDiff,
  DiffMeasurements,
  resetCurrentDay,
} from "@/composables/common/dateComposable";
import {
  ObjectInterface,
  SiteInterface,
  TooltipItem,
} from "@/types/dataInterfaces";
import { ActivityInterface, SessionInterface } from "@/types/TrackingInterface";
import {
  currentData,
  selectedNavItem,
} from "@/composables/popupTrackerActions";
//data

export const selectedSite = ref({} as ObjectInterface);
export const isSelectedSite = computed(() => {
  return Object.keys(selectedSite.value).length;
});

const defaultChart = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {},
      backgroundColor: "#D9D9D9",
      titleColor: "#5C5A5A",
      titleFont: {
        family: "'Nunito', sans-serif",
        style: "normal",
        weight: 500,
        size: 10,
        lineHeight: 0.8,
      },
      bodyColor: "#5C5A5A",
      bodyFont: {
        family: "'Nunito', sans-serif",
        style: "normal",
        weight: 500,
        size: 8,
        lineHeight: 0.8,
      },
    },
  },
  scales: {
    y: {
      position: "right",
      border: {
        display: false,
      },
    },
    x: {
      border: {
        display: false,
      },
      ticks: {
        maxRotation: 0,
        minRotation: 0,
        color: "#A9A9A9",
      },
    },
  },
};

export const names = ref([] as (string | number)[]);
export const timeData = ref([] as number[]);
export const optionsData = ref({ ...defaultChart } as ObjectInterface);
export const totalData = ref({} as ObjectInterface);

export const getSiteData = (data: SessionInterface[]) => {
  names.value = [];
  timeData.value = [];
  optionsData.value = { ...defaultChart };
  switch (selectedNavItem.value) {
    case PopupTrackerNavItemsEnum.day: {
      setDayOptions(data);
      break;
    }
    case PopupTrackerNavItemsEnum.week: {
      setWeekOptions(data);
      break;
    }
    case PopupTrackerNavItemsEnum.month: {
      setMonthOptions(data);
      break;
    }
  }
};

export const timeForTotal = computed(() => {
  let site: SiteInterface | undefined;
  let timeSpent: number;
  if (Object.keys(selectedSite.value).length) {
    site = Object.values(
      filteringData.value as { [key: string]: SiteInterface }
    ).find((item: SiteInterface) => {
      return item.domain === selectedSite.value.domain;
    });
    timeSpent = site?.timeSpent ?? 0;
  } else {
    timeSpent = totalTimeSpent.value;
  }
  return selectedNavItem.value === PopupTrackerNavItemsEnum.total
    ? timeSpent
    : 0;
});

// functions

export const selectSite = (item: SiteInterface | ObjectInterface) => {
  selectedSite.value = item;
  resetCurrentDay();
};

export const setDayOptions = (sessions: SessionInterface[]) => {
  const activities: ActivityInterface[] = getActivities(sessions);

  for (let i = 0; i < 24; i++) {
    let sum = 0;
    const originalDate = new Date(currentData.value);
    activities.forEach((f) => {
      const beginHourDiff = dateDiff(
        f.begin,
        new Date(originalDate).setHours(i),
        DiffMeasurements.hours
      );
      const endHourDiff = dateDiff(
        f.end!,
        new Date(originalDate).setHours(i),
        DiffMeasurements.hours
      );
      if (!beginHourDiff) {
        if (!endHourDiff) {
          sum += dateDiff(f.begin, f.end!, DiffMeasurements.minutes);
        } else {
          sum += dateDiff(
            f.begin,
            new Date(originalDate).setHours(i),
            DiffMeasurements.minutes
          );
        }
      } else {
        if (!endHourDiff) {
          sum += dateDiff(
            new Date(originalDate).setHours(i - 1),
            f.end!,
            DiffMeasurements.minutes
          );
        }
      }
    });
    timeData.value[i] = sum;
    names.value.push(i);
  }
  Object.assign(optionsData.value.plugins.tooltip.callbacks, {
    title: (tooltipItem: TooltipItem[]) => {
      return `${tooltipItem[0].dataIndex} ${
        tooltipItem[0].dataIndex <= 12 ? "AM" : "PM"
      }`;
    },
    label: (tooltipItem: TooltipItem) => {
      return formatDuration(tooltipItem.raw * 60);
    },
  });
  Object.assign(optionsData.value.scales.x.ticks, {
    callback: (value: string | number, index: number) => {
      if (selectedNavItem.value === PopupTrackerNavItemsEnum.day) {
        return String(value).padStart(2, "0");
      }
    },
  });
  optionsData.value.scales.y.ticks = {
    stepSize: 10,
    color: "#A9A9A9",
    callback: (value: number | string) => {
      return `${value}m`;
    },
  };
  optionsData.value.scales.y.min = 0;
  optionsData.value.scales.y.max = 60;
};

const totalDataValues = () => {
  if (!Object.keys(totalData.value).length) {
    totalData.value.timeSpent = 0;
  }
};

const getActivities = (sessions: SessionInterface[]) => {
  return sessions.reduce((a: ActivityInterface[], b: SessionInterface) => {
    return a.concat(b.activity.filter((f) => f.end));
  }, []);
};
export const setWeekOptions = (sessions: SessionInterface[]) => {
  names.value = ["M", "T", "W", "T", "F", "S", "S"];
  totalData.value = {};
  const activities: ActivityInterface[] = getActivities(sessions);

  const originalDate = new Date(currentData.value);
  const currentDate = originalDate.getDate();

  for (let i = 0; i < 7; i++) {
    const weekday = new Date(originalDate).setDate(currentDate + i);
    let sum = 0;
    activities.forEach((f) => {
      const beginHourDiff = dateDiff(f.begin, weekday, DiffMeasurements.days);
      const endHourDiff = dateDiff(f.end!, weekday, DiffMeasurements.days);
      if (!beginHourDiff) {
        if (!endHourDiff) {
          sum += dateDiff(f.begin, f.end!, DiffMeasurements.minutes);
        } else {
          sum += dateDiff(f.begin, weekday, DiffMeasurements.minutes);
        }
      } else {
        if (!endHourDiff) {
          sum += dateDiff(
            new Date(originalDate).setDate(currentDate + (i - 1)),
            f.end!,
            DiffMeasurements.minutes
          );
        }
      }
    });
    timeData.value[i] = sum;
  }
  Object.assign(optionsData.value.plugins.tooltip.callbacks, {
    title: (tooltipItem: TooltipItem[]) => {
      const weeks = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      return `${weeks[tooltipItem[0].dataIndex]}`;
    },
    label: (tooltipItem: TooltipItem) => {
      return formatDuration(tooltipItem.raw * 60);
    },
  });
  Object.assign(optionsData.value.scales.x.ticks, {
    callback: (value: string | number, index: number) => {
      if (selectedNavItem.value === PopupTrackerNavItemsEnum.week) {
        return names.value[index];
      }
    },
  });
  optionsData.value.scales.y.ticks = {
    stepSize: 60,
    color: "#A9A9A9",
    callback: (value: number) => {
      return `${value / 60}h`;
    },
  };
  optionsData.value.scales.y.min = 0;
  optionsData.value.scales.y.max = null;
  const nonNullValues = timeData.value.filter((item) => item !== null);
  const maxItem = Math.max(...nonNullValues);
  if (maxItem < 60) {
    optionsData.value.scales.y.max = 60;
  }
};

export const setMonthOptions = (sessions: SessionInterface[]) => {
  const monthCount = new Date(
    currentData.value.getFullYear(),
    currentData.value.getMonth() + 1,
    0
  ).getDate();
  totalData.value = {};
  totalDataValues();
  const activities: ActivityInterface[] = getActivities(sessions);

  for (let i = 1; i < monthCount + 1; i++) {
    names.value.push(i);
    const currentDate = new Date(currentData.value).setDate(i);
    let sum = 0;
    activities.forEach((f) => {
      const beginHourDiff = dateDiff(
        f.begin,
        currentDate,
        DiffMeasurements.days
      );
      const endHourDiff = dateDiff(f.end!, currentDate, DiffMeasurements.days);
      if (!beginHourDiff) {
        if (!endHourDiff) {
          sum += dateDiff(f.begin, f.end!, DiffMeasurements.minutes);
        } else {
          sum += dateDiff(f.begin, currentDate, DiffMeasurements.minutes);
        }
      } else {
        if (!endHourDiff) {
          sum += dateDiff(currentDate, f.end!, DiffMeasurements.minutes);
        }
      }
    });

    timeData.value[i - 1] = sum;
  }
  Object.assign(optionsData.value.plugins.tooltip.callbacks, {
    title: (tooltipItem: TooltipItem[]) => {
      const monthNumber = currentData.value.getMonth() + 1;
      const monthName = new Date(
        Date.UTC(2000, monthNumber - 1, 1)
      ).toLocaleString("default", { month: "long" });
      return `${names.value[tooltipItem[0].dataIndex]} ${monthName}`;
    },
    label: (tooltipItem: TooltipItem) => {
      return formatDuration(tooltipItem.raw * 60);
    },
  });
  Object.assign(optionsData.value.scales.x.ticks, {
    callback: (value: string | number, index: number) => {
      if (selectedNavItem.value === PopupTrackerNavItemsEnum.month) {
        return index + 1;
      }
    },
  });
  optionsData.value.scales.y.ticks = {
    stepSize: 60,
    color: "#A9A9A9",
    callback: (value: number) => {
      return `${Math.ceil(value / 60)}h`;
    },
  };
  optionsData.value.scales.y.min = 0;
  optionsData.value.scales.y.max = null;
  const nonNullValues = timeData.value.filter((item) => item !== null);
  const maxItem = Math.max(...nonNullValues);
  if (maxItem < 60) {
    optionsData.value.scales.y.max = 60;
  }
};
