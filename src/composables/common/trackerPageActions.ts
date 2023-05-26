import {
  computed,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { getSiteData } from "@/composables/common/chartBar";
import {
  currentData,
  dateDiff,
  getSevenDays,
  resetCurrentDay,
  sevenDays,
  sortByDate,
  validUrlRegex,
} from "@/composables/common/dateComposable";
import {
  DateInterface,
  ObjectInterface,
  SiteInterface,
} from "@/types/dataInterfaces";
import {
  finishLoader,
  isLoader,
  startLoader,
} from "@/composables/common/loaderActions";
import { EnumLoaderKeys } from "@/constants/EnumLoaderKeys";
import {
  ActivityInterface,
  HistoryListInterface,
  SessionInterface,
} from "@/types/TrackingInterface";

//data
let intervalId = 0;
let isEdit = true;

export const initialTracker = (isShowCurrentSession: boolean) => {
  onMounted(() => {
    getHistory();
    selectNavItem(PopupTrackerNavItemsEnum.day);
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (
        isShowCurrentSession &&
        tabs &&
        tabs.length &&
        validUrlRegex.test(`${tabs[0].url}`)
      ) {
        startLoader(EnumLoaderKeys.trackingList);
        currentSessionData.value.currentUrl = new URL(
          String(tabs[0].url)
        ).hostname;
        currentSessionData.value.currentTab = tabs[0].id;
        intervalId = setInterval(() => {
          let timeSpent = 0;
          const site =
            historyStorage.value[currentSessionData.value.currentUrl];
          if (site && site.sessions[currentSessionData.value.currentTab]) {
            const activity =
              site.sessions[currentSessionData.value.currentTab][0].activity;
            activity.forEach((item: any, key: number) => {
              if (!key && isEdit) {
                item.end = new Date().getTime();
              } else if (!key && !isEdit) {
                item.end = item.begin;
              }
              if (item.end) {
                timeSpent += (item.end - item.begin) / 1000;
              }
              if (
                activity.length === key + 1 &&
                isLoader(EnumLoaderKeys.trackingList)
              ) {
                finishLoader(EnumLoaderKeys.trackingList);
              }
            });
            if (
              activity &&
              !activity.length &&
              isLoader(EnumLoaderKeys.trackingList)
            ) {
              finishLoader(EnumLoaderKeys.trackingList);
            }
          } else if (isLoader(EnumLoaderKeys.trackingList)) {
            finishLoader(EnumLoaderKeys.trackingList);
          }
          currentSessionData.value.time = timeSpent;
        }, 1000);
      } else {
        finishLoader(EnumLoaderKeys.trackingList);
      }
    });
    chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  });
  onUnmounted(() => {
    chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    clearInterval(intervalId);
  });
};

const handleRuntimeMessage = (request: any, sender: any) => {
  const stopTracking = "stopTracking";
  if (request.message === stopTracking) {
    isEdit = false;
    clearInterval(intervalId);
    if (isLoader(EnumLoaderKeys.trackingList)) {
      finishLoader(EnumLoaderKeys.trackingList);
    }
  }
};

export const currentSessionData = ref({
  currentTab: "",
  currentUrl: "",
  time: 1,
} as ObjectInterface);

export const selectedNavItem = ref(
  PopupTrackerNavItemsEnum.day as PopupTrackerNavItemsEnum
);
export const historyStorage = ref({} as ObjectInterface);

export const isTotal = computed(() => {
  return selectedNavItem.value === PopupTrackerNavItemsEnum.total;
});

export const createStructure = (pages: {
  [key: string]: {
    icon: string;
    sessions: {
      [key: string]: SessionInterface[];
    };
  };
}): HistoryListInterface[] => {
  return Object.keys(pages).map((domain) => {
    const {
      icon,
      sessions,
    }: {
      icon: string;
      sessions: {
        [key: string]: SessionInterface[];
      };
    } = pages[domain];
    const sessionsValues = Object.values(sessions);
    const sessionsKeys = Object.keys(sessions);
    return {
      domain,
      icon,
      sessions: sessionsValues
        .reduce(
          (a: SessionInterface[], b: SessionInterface[], index: number) => {
            return a.concat(
              b.map((m) => {
                return {
                  ...m,
                  tab_id: sessionsKeys[index],
                };
              })
            );
          },
          []
        )
        .sort((a: SessionInterface, b: SessionInterface) => {
          return sortByDate(a.activity[0].begin, b.activity[0].begin);
        }),
    };
  });
};

export const filteringData: ObjectInterface = computed(() => {
  console.log("filteringData", historyStorage.value);

  if (Object.keys(historyStorage.value).length) {
    const data: SiteInterface | ObjectInterface = Object.keys({
      ...historyStorage.value,
    }).reduce(accumulateSites, {});
    const findSite: any = Object.values(data).find((item: any) => {
      return item.domain === currentSessionData.value.currentUrl;
    });
    if (findSite) {
      findSite.currentSession = currentSessionData.value.time;
      findSite.timeSpent = findSite.timeSpent += 1;
    }
    const compareSites = (a: SiteInterface, b: SiteInterface): number => {
      const aHasCurrentSession = a.currentSession > 0;
      const bHasCurrentSession = b.currentSession > 0;
      if (aHasCurrentSession && !bHasCurrentSession) {
        return -1;
      } else if (!aHasCurrentSession && bHasCurrentSession) {
        return 1;
      } else {
        return b.timeSpent - a.timeSpent;
      }
    };
    const filter = Object.values(data).sort((a: unknown, b: unknown) =>
      compareSites(a as SiteInterface, b as SiteInterface)
    );
    getSiteData(filter);
    return filter;
  } else {
    return {};
  }
});

export const sinceData = ref(0);

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
  const tabs: string[] = [];
  getSevenDays();
  if (siteKey) {
    const filter = (tabData: any, date: any, index: number) => {
      let isActiveSesssion = false;
      tabData.activity.forEach((item: any) => {
        if (!date) {
          if (!sites[siteKey]) {
            sites[siteKey] = {
              icon: site.icon,
              domain: siteKey,
              sessions: 0,
              timeSpent: 0,
              firstVisit: 0,
              lastVisit: 0,
              mostInactive: { day: "", time: 0 },
              mostActive: { day: "", time: 0 },
              longestSession: 0,
              tabs,
            };
          }
          if (!isActiveSesssion) {
            sites[siteKey].sessions += 1;
            isActiveSesssion = true;
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
              lastVisit: 0,
              longestSession: 0,
              dayActivity: [],
              weekActivity: [],
              monthActivity: [],
              tabs,
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
          if (!isActiveSesssion) {
            sites[siteKey].sessions += 1;
            isActiveSesssion = true;
          }
          sessions.push(item);
        }
      });
      if (sessions.length) {
        sessions.forEach((item: any) => {
          let timeSpent = 0;
          if (!item.end) {
            timeSpent = (new Date().getTime() - item.begin) / 1000;
          } else {
            timeSpent = (item.end - item.begin) / 1000;
          }
          if (sites[siteKey].lastVisit < item.end) {
            sites[siteKey].lastVisit = item.end;
          }
          if (!sinceData.value || sinceData.value > item.begin) {
            sinceData.value = item.begin;
          }
          if (
            sites[siteKey].firstVisit > item.begin ||
            !sites[siteKey].firstVisit
          ) {
            sites[siteKey].firstVisit = item.begin;
          }
          sites[siteKey].timeSpent += timeSpent;

          if (sites[siteKey].longestSession < timeSpent && item.end) {
            sites[siteKey].longestSession = timeSpent;
          }
          switch (selectedNavItem.value) {
            case PopupTrackerNavItemsEnum.day: {
              let timeIndex: number = new Date(item.begin).getHours();
              const day = sites[siteKey].dayActivity;
              if (!day[timeIndex]) {
                day[timeIndex] = 0;
              }
              while (timeSpent > 0) {
                if (day[timeIndex] + timeSpent < 3600) {
                  day[timeIndex] += timeSpent;
                  timeSpent = 0;
                } else {
                  const timeInHour = 3600 - day[timeIndex];
                  day[timeIndex] += timeInHour;
                  timeSpent -= timeInHour;
                  timeIndex += 1;
                  if (!day[timeIndex]) {
                    day[timeIndex] = 0;
                  }
                }
              }
              break;
            }
            case PopupTrackerNavItemsEnum.week: {
              const week = sites[siteKey].weekActivity;
              if (!week[index]) {
                week[index] = 0;
              }
              week[index] += timeSpent;
              break;
            }
            case PopupTrackerNavItemsEnum.month: {
              const month = sites[siteKey].monthActivity;
              if (!month[index]) {
                month[index] = 0;
              }
              month[index] += timeSpent;
              break;
            }
          }
        });
        sessions = [];
      }
    };
    if (Object.keys(site.sessions).length) {
      Object.values(site.sessions).forEach((tab: any, key) => {
        tabs.push(`${Object.keys(site.sessions)[key]}`);
        tab.forEach((item: any) => {
          switch (selectedNavItem.value) {
            case PopupTrackerNavItemsEnum.day: {
              filter(item, currentData.value, 0);
              break;
            }
            case PopupTrackerNavItemsEnum.week: {
              sevenDays.value.forEach((date, index) => {
                filter(
                  item,
                  new Date(
                    `${String(date.month).padStart(2, "0")}.${String(
                      date.day
                    ).padStart(2, "0")}.${date.year}`
                  ),
                  index
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
                  ),
                  i
                );
              }
              break;
            }
            case PopupTrackerNavItemsEnum.total: {
              filter(item, "", 0);
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
    return ((timeSpent / totalTime) * 100).toFixed(2);
  } else {
    return 0;
  }
};

export const formatDuration = (seconds: number, allTime = false) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return allTime ? `${hours}h ${minutes}m ${remainingSeconds}s` : `${hours}h`;
  }

  if (minutes > 0) {
    return allTime ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  if (remainingSeconds > 0) {
    return `${remainingSeconds}s`;
  }

  return "";
};
export const totalTimeCalculation = (session: SessionInterface[]) => {
  return session.reduce(
    (sessionPrev: number, sessionCurrent: SessionInterface) => {
      return sessionPrev + timeSpentCalculation(sessionCurrent.activity);
    },
    0
  );
};
export const timeSpentCalculation = (activity: ActivityInterface[]) => {
  return activity.reduce(
    (activityPrev: number, activityCurrent: ActivityInterface) => {
      if (activityCurrent.end) {
        return (
          activityPrev + dateDiff(activityCurrent.begin, activityCurrent.end)
        );
      } else {
        return activityPrev;
      }
    },
    0
  );
};
