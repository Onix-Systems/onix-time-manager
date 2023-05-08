import { computed, ref } from "vue";
import { PopupTrackerNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { getSiteData } from "@/composables/common/chartBar";
import {
  dayData,
  dayIndex,
  getSevenDays,
  monthIndex,
  resetCurrentDay,
  sevenDays,
  yearIndex,
} from "@/composables/common/dateComposable";
import {
  DateInterface,
  ObjectInterface,
  SiteInterface,
  SiteObject,
} from "@/types/dataInterfaces";

//data

export const selectedNavItem = ref(PopupTrackerNavItemsEnum.day);
export const historyStorage = ref({} as ObjectInterface);

export const isTotal = computed(() => {
  return selectedNavItem.value === PopupTrackerNavItemsEnum.total;
});

export const filteringData: ObjectInterface = computed(() => {
  if (Object.keys(historyStorage.value).length) {
    getSiteData();
    if (Object.keys(checkDataInStorage(dayData.value)).length) {
      const totalData = historyStorage.value[yearIndex.value];
      const monthData = totalData[monthIndex.value] || {};
      const dayData = monthData[dayIndex.value] || {};
      let data: SiteInterface | ObjectInterface = {};

      switch (selectedNavItem.value) {
        case PopupTrackerNavItemsEnum.day: {
          data = getDay(dayData);
          break;
        }
        case PopupTrackerNavItemsEnum.week: {
          data = getWeek();
          break;
        }
        case PopupTrackerNavItemsEnum.month: {
          data = getMonth(monthData);
          break;
        }
        case PopupTrackerNavItemsEnum.total: {
          data = getTotal(totalData);
          break;
        }
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
      return Object.values(data).sort((a: unknown, b: unknown) =>
        compareSites(a as SiteInterface, b as SiteInterface)
      );
    } else {
      return {};
    }
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

const accumulateSites = (sites: SiteObject, site: SiteInterface) => {
  const domain: string = site.domain;
  if (typeof site.sessions === "object") {
    site.sessions = Object.values(site.sessions).map((item) => item);
  }
  if (sites[domain]) {
    sites[domain].visited += site.visited;
    sites[domain].timeSpent += site.timeSpent;
    sites[domain].sessions.concat(site.sessions);
    sites[domain].currentSession = site.currentSession;
    sites[domain].lastVisit = site.lastVisit;
    if (sites[domain].mostActive < site.timeSpent) {
      sites[domain].mostActive = site.timeSpent;
    }
    if (sites[domain].mostInactive > site.timeSpent) {
      sites[domain].mostInactive = site.timeSpent;
    }
    Object.keys(site.urls).forEach((key) => {
      if (sites[domain].urls[key]) {
        if (
          !sites[domain].urls[key].visited!.includes(site.urls[key].firstVisit)
        ) {
          sites[domain].urls[key].visited!.push(site.urls[key].firstVisit);
        }
      } else {
        sites[domain].urls[key] = site.urls[key];
      }
    });
  } else if (domain) {
    sites[domain] = {
      domain: site.domain,
      visited: site.visited,
      timeSpent: site.timeSpent,
      icon: site.icon,
      currentSession: site.currentSession,
      sessions: site.sessions,
      dayActivity: site.dayActivity,
      lastVisit: site.lastVisit,
      firstVisit: site.firstVisit,
      mostActive: site.timeSpent,
      mostInactive: site.timeSpent,
      urls: site.urls,
    };
    Object.keys(sites[domain].urls).forEach((key) => {
      sites[domain].urls[key].visited = [];
      sites[domain].urls[key].visited!.push(sites[domain].urls[key].firstVisit);
    });
    if (site.currentSession) {
      sites[domain].currentSession = site.currentSession;
    }
  }
  return sites;
};

const getDay = (dayData: SiteInterface[]) => {
  return Object.values(dayData).reduce(accumulateSites, {});
};

const getWeek = () => {
  getSevenDays();
  const weekData = sevenDays.value.map((dayData: DateInterface) => {
    return checkDataInStorage(dayData)
      ? Object.values(checkDataInStorage(dayData))
      : [];
  });

  return weekData.flat().reduce(accumulateSites, {});
};

const getMonth = (monthData: SiteInterface[]) => {
  return Object.values(monthData).reduce(
    (sites: ObjectInterface, dayData: SiteInterface) => {
      const daySites: SiteInterface[] = Object.values(dayData);
      return daySites.reduce(accumulateSites, sites);
    },
    {}
  );
};

const getTotal = (totalData: SiteInterface[]) => {
  return Object.values(totalData).reduce(
    (sites: ObjectInterface, monthData: SiteInterface) =>
      Object.values(monthData).reduce(
        (sites: ObjectInterface, dayData: SiteInterface) =>
          Object.values(dayData).reduce(accumulateSites, sites),
        sites
      ),
    {}
  );
};

export const getPercent = (timeSpent: number) => {
  const totalTime: number = totalTimeSpent.value;
  if (totalTime) {
    return Math.ceil((timeSpent / totalTime) * 100);
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
