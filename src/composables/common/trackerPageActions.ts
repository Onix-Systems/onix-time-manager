import { computed, ref } from "vue";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { getSiteData } from "@/composables/common/chartBar";
import {
  currentData,
  resetCurrentDay,
  sevenDays,
} from "@/composables/common/dateComposable";
import {
  DateInterface,
  ObjectInterface,
  SiteInterface,
} from "@/types/dataInterfaces";

//data

export const selectedNavItem = ref(
  PopupTrackerNavItemsEnum.day as PopupTrackerNavItemsEnum
);
export const historyStorage = ref({} as ObjectInterface);

export const isTotal = computed(() => {
  return selectedNavItem.value === PopupTrackerNavItemsEnum.total;
});

export const filteringData: ObjectInterface = computed(() => {
  if (Object.keys(historyStorage.value).length) {
    getSiteData();
    const data: SiteInterface | ObjectInterface = Object.keys({
      ...historyStorage.value,
    }).reduce(accumulateSites, {});
    return Object.values(data).sort((a: any, b: any) => {
      return b.timeSpent - a.timeSpent;
    });
  } else {
    return {};
  }
});

export const totalTimeSpent = computed(() => {
  if (Object.keys(historyStorage.value).length) {
    const siteArray: SiteInterface[] = Object.values(filteringData.value);
    return siteArray.reduce((total: number, site: SiteInterface) => {
      if (site.timeSpent) {
        return total + site.timeSpent;
      } else {
        return total;
      }
    }, 0);
  }
  return 0;
});

//functions

export const selectNavItem = (item: PopupTrackerNavItemsEnum) => {
  selectedNavItem.value = item;
  resetCurrentDay();
};

export const checkDataInStorage = (dayData: DateInterface) => {
  let daySites: ObjectInterface = {};
  const keys = (data: ObjectInterface) => {
    return Object.keys(data);
  };
  if (keys(historyStorage.value).includes(String(dayData.year))) {
    daySites = historyStorage.value[dayData.year];
    if (keys(daySites).includes(String(dayData.month))) {
      daySites = daySites[dayData.month];
      if (keys(daySites).includes(String(dayData.day))) {
        daySites = daySites[dayData.day];
      } else {
        daySites = {};
      }
    } else {
      daySites = {};
    }
  }
  return daySites || 0;
};

export const getHistory = () => {
  chrome.storage.local.get({ pages: {} }, (result) => {
    return (historyStorage.value = result.pages || {});
  });
};

const accumulateSites = (sites: ObjectInterface, siteKey: string) => {
  const totalData = { ...historyStorage.value };
  const site = totalData[siteKey];
  let sessions: ObjectInterface[] = [];

  if (siteKey) {
    const filter = (tabData: any, date?: any) => {
      tabData.activity.forEach((item: any) => {
        if (!date) {
          if (!sites[siteKey]) {
            sites[siteKey] = {
              icon: site.icon,
              domain: siteKey,
              sessions: 0,
              timeSpent: 0,
            };
          }
          sessions.push(item);
        }
        if (
          date &&
          ((new Date(item.begin).setHours(0, 0, 0, 0) ===
            date.setHours(0, 0, 0, 0) &&
            item.begin) ||
            (new Date(item.end).setHours(0, 0, 0, 0) ===
              date.setHours(0, 0, 0, 0) &&
              item.end))
        ) {
          if (!sites[siteKey]) {
            sites[siteKey] = {
              icon: site.icon,
              domain: siteKey,
              sessions: 0,
              timeSpent: 0,
            };
          }
          if (
            item.begin &&
            new Date(item.begin).setHours(0, 0, 0, 0) !==
              date.setHours(0, 0, 0, 0)
          ) {
            item.begin = new Date(item.begin).setHours(0, 0, 0, 0);
          }
          if (
            item.end &&
            new Date(item.end).setHours(0, 0, 0, 0) !==
              date.setHours(0, 0, 0, 0)
          ) {
            item.end = new Date(item.end).setHours(24, 0, 0, 0);
          }
          sessions.push(item);
        }
      });
      if (sessions.length) {
        sessions.forEach((item: any) => {
          if (!item.end) {
            sites[siteKey].timeSpent +=
              (new Date().getTime() - item.begin) / 1000;
          } else {
            sites[siteKey].timeSpent += (item.end - item.begin) / 1000;
          }
          sites[siteKey].sessions += 1;
        });
        sessions = [];
      }
    };
    if (Object.keys(site.sessions).length) {
      Object.values(site.sessions).forEach((tab: any) => {
        tab.forEach((item: any) => {
          switch (selectedNavItem.value) {
            case PopupTrackerNavItemsEnum.day: {
              sessions = [];
              filter(item, currentData.value);
              break;
            }
            case PopupTrackerNavItemsEnum.week: {
              sessions = [];
              sevenDays.value.forEach((date) => {
                filter(
                  item,
                  new Date(
                    `${String(date.month).padStart(2, "0")}.${String(
                      date.day
                    ).padStart(2, "0")}.${date.year}`
                  )
                );
              });
              break;
            }
            case PopupTrackerNavItemsEnum.month: {
              const monthCount = new Date(
                currentData.value.getFullYear(),
                currentData.value.getMonth() + 1,
                0
              ).getDate();
              for (let i = 1; i < monthCount + 1; i++) {
                filter(
                  item,
                  new Date(
                    currentData.value.getFullYear(),
                    currentData.value.getMonth(),
                    i
                  )
                );
              }
              break;
            }
            case PopupTrackerNavItemsEnum.total: {
              filter(item, "");
              break;
            }
          }
        });
      });
    }
  }
  return sites;
};

export const getPercent = (timeSpent: number) => {
  const totalTime: number = totalTimeSpent.value;
  if (totalTime) {
    return Math.round((timeSpent / totalTime) * 100);
  } else {
    return 0;
  }
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  if (remainingSeconds > 0) {
    return `${remainingSeconds}s`;
  }

  return "";
};
