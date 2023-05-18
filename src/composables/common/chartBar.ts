import { computed, ref } from "vue";
import {
  checkDataInStorage,
  filteringData,
  formatDuration,
  historyStorage,
  selectedNavItem,
  totalTimeSpent,
} from "@/composables/common/trackerPageActions";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import {
  currentData,
  dayData,
  getSevenDays,
  resetCurrentDay,
  sevenDays,
} from "@/composables/common/dateComposable";
import {
  DateInterface,
  ObjectInterface,
  SiteInterface,
  TooltipItem,
} from "@/types/dataInterfaces";
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

export const getSiteData = (data: any) => {
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

export const setDayOptions = (data: any) => {
  totalData.value = {};
  totalDataValues();
  if (isSelectedSite.value) {
    const site = data.find((item: SiteInterface) => {
      return item.domain === selectedSite.value.domain;
    });
    if (site) {
      for (let i = 0; i < 24; i++) {
        const timeSpent = site.dayActivity[i] || 0;
        if (timeSpent) {
          totalData.value.timeSpent += timeSpent;
        }
        timeData.value[i] = timeSpent / 60;
      }
    }
  } else {
    data.forEach((item: ObjectInterface) => {
      for (let i = 0; i < 24; i++) {
        const timeSpent = item.dayActivity[i] || 0;
        if (!timeData.value[i]) {
          timeData.value[i] = 0;
        }
        if (timeSpent) {
          totalData.value.timeSpent += timeSpent;
        }
        timeData.value[i] += timeSpent / 60;
      }
    });
  }
  for (let i = 0; i < 24; i++) {
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

export const setWeekOptions = (data: any) => {
  names.value = ["M", "T", "W", "T", "F", "S", "S"];
  totalData.value = {};
  totalDataValues();
  for (let index = 0; index < 7; index++) {
    if (isSelectedSite.value) {
      const site = data.find((item: SiteInterface) => {
        return item.domain === selectedSite.value.domain;
      });
      if (site) {
        const timeSpent = site.weekActivity[index] || 0;
        if (timeSpent) {
          totalData.value.timeSpent += timeSpent;
        }
        timeData.value[index] = timeSpent / 60;
      }
    } else {
      data.forEach((item: any) => {
        const timeSpent = item.weekActivity[index] || 0;
        if (timeSpent) {
          totalData.value.timeSpent += timeSpent;
        }
        if (!timeData.value[index]) {
          timeData.value[index] = 0;
        }
        timeData.value[index] += timeSpent / 60;
      });
    }
  }
  Object.assign(optionsData.value.plugins.tooltip.callbacks, {
    title: (tooltipItem: TooltipItem[]) => {
      const monthNumber: number =
        sevenDays.value[tooltipItem[0].dataIndex].month;
      const monthName = new Date(
        Date.UTC(2000, monthNumber - 1, 1)
      ).toLocaleString("default", { month: "long" });
      return `${sevenDays.value[tooltipItem[0].dataIndex].day} ${monthName}`;
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

export const setMonthOptions = (data: any) => {
  const monthCount = new Date(
    currentData.value.getFullYear(),
    currentData.value.getMonth() + 1,
    0
  ).getDate();
  totalData.value = {};
  totalDataValues();
  for (let i = 1; i < monthCount + 1; i++) {
    names.value.push(i);
    if (isSelectedSite.value) {
      const site = data.find((item: SiteInterface) => {
        return item.domain === selectedSite.value.domain;
      });
      if (site) {
        const timeSpent = site.monthActivity[i] || 0;
        if (timeSpent) {
          totalData.value.timeSpent += timeSpent;
        }
        timeData.value[i - 1] = timeSpent / 60;
      }
    } else {
      data.forEach((item: any) => {
        const timeSpent = item.monthActivity[i] || 0;

        if (timeSpent) {
          totalData.value.timeSpent += timeSpent;
        }
        if (!timeData.value[i - 1]) {
          timeData.value[i - 1] = 0;
        }
        timeData.value[i - 1] += timeSpent / 60;
      });
    }
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
