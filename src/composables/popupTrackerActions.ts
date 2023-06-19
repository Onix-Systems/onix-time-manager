import { computed, ref } from "vue";

import {
  createStructure,
  timeSpentCalculation,
  totalTimeCalculation,
} from "@/composables/common/trackerPageActions";
import {
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  sortByDate,
} from "@/composables/common/dateComposable";
import {
  ActivityInterface,
  HistoryListInterface,
  SessionInterface,
} from "@/types/TrackingInterface";
import { getSiteData } from "@/composables/common/chartBar";
import {
  destroyTrackerInterval,
  initTrackerInterval,
  trackerCounter,
} from "@/composables/common/timeCounter";

export const showLoader = ref(true);
export enum TrackerViews {
  list = "list",
  details = "details",
}
export const view = ref<TrackerViews>(TrackerViews.list);
export const isList = computed(() => view.value === TrackerViews.list);
export const isDetails = computed(() => view.value === TrackerViews.details);

const today = new Date();
export const currentData = ref();
export const setToday = () => {
  currentData.value = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
};

export enum PopupTrackerNavItemsEnum {
  day = "Day",
  week = "Week",
  month = "Month",
  total = "Total",
}
export const selectedNavItem = ref(
  PopupTrackerNavItemsEnum.day as PopupTrackerNavItemsEnum
);
export const isTotal = computed(
  () => selectedNavItem.value === PopupTrackerNavItemsEnum.total
);
export const isDay = computed(
  () => selectedNavItem.value === PopupTrackerNavItemsEnum.day
);

export const generalTimeSpent = ref(0);
export const originalTimeSpent = ref(0);
export const generalListSpent = ref<{ [key: string]: number }>({});
export const originalListSpent = ref<{
  [key: string]: { siteLimit: { timeLimit: number } };
}>({});

export const getLimitsData = () =>
  new Promise((resolve) => {
    chrome.storage.local.get("timeSpent").then((res) => {
      if (res.timeSpent) {
        chrome.storage.local.get("limits").then((result) => {
          if (result.limits) {
            const { browserTime } = result.limits;
            originalTimeSpent.value = browserTime.timeLimit;
            originalListSpent.value = result.limits.list;
            const { general, list } = res.timeSpent;
            generalTimeSpent.value = general;
            generalListSpent.value = list;
            resolve(true);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  });
export const reachGlobalLimits = computed(() => {
  if (originalTimeSpent.value && generalTimeSpent.value) {
    return (
      generalTimeSpent.value + trackerCounter.value + 1 >=
      originalTimeSpent.value
    );
  }
  return false;
});

export const reachLocalLimits = (domain: string) => {
  const generalKeys = Object.keys(generalListSpent.value);
  const localKeys = Object.keys(originalListSpent.value);
  if (generalKeys.length && localKeys.length) {
    const key = `https://${domain}`;
    if (generalKeys.includes(key) && localKeys.includes(key)) {
      const localValue = generalListSpent.value[key];
      const localLimit = originalListSpent.value[key].siteLimit.timeLimit;
      return localValue + trackerCounter.value >= localLimit;
    }
  }
  return false;
};
const defaultHostData = {
  icon: "",
  domain: "",
};
export const hostTabSelected = ref(defaultHostData);
export const hostItem = ref<HistoryListInterface>({} as HistoryListInterface);
export const onBackClicked = () => {
  hostTabSelected.value = defaultHostData;
  hostItem.value = {} as HistoryListInterface;
  view.value = TrackerViews.list;
};
export const onNextClicked = (item: HistoryListInterface) => {
  hostTabSelected.value.domain = item.domain;
  hostTabSelected.value.icon = item.icon;
  hostItem.value = item;
  view.value = TrackerViews.details;
  getSiteData(item.sessions);
};

export const selectedHostName = ref("");
export const selectedTabId = ref(0);
export const getHostData = () =>
  new Promise((resolve) => {
    chrome.storage.local.get("tabInfo").then((res) => {
      if (res && res.tabInfo && res.tabInfo.hostName) {
        selectedHostName.value = res.tabInfo.hostName;
        selectedTabId.value = res.tabInfo.id;
      } else {
        selectedHostName.value = "";
        selectedTabId.value = 0;
      }
      resolve(true);
    });
  });
export const exceptionsCheck = computed(() => {
  const exceptions = ["extensions", "newtab"];
  return exceptions.includes(selectedHostName.value);
});
export const historyList = ref<HistoryListInterface[]>([]);
export const sessionCount = (sessions: SessionInterface[]) => sessions.length;
export const currentSession = (item: HistoryListInterface, popup = true) => {
  if (trackerCounter.value) {
    if (popup && item?.domain === selectedHostName.value) {
      const findElement = item.sessions.find(
        (f) => +f.tab_id === +selectedTabId.value
      );
      let result = 0;
      if (findElement) {
        result = timeSpentCalculation(findElement.activity);
      }
      return result + trackerCounter.value;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};
export const longestSession = (item: HistoryListInterface) => {
  const sessionsList = [...item.sessions];
  if (sessionsList.length) {
    const timeSpent = timeSpentCalculation(
      sessionsList.sort(
        (a, b) =>
          timeSpentCalculation(b.activity) - timeSpentCalculation(a.activity)
      )[0].activity
    );
    return currentSession(item) > timeSpent ? currentSession(item) : timeSpent;
  }
  return 0;
};
export const orderedSession = (data: HistoryListInterface[], first = true) => {
  if (data.length) {
    const activity = [...data].reduce((a: ActivityInterface[], b) => {
      return a.concat(
        b.sessions.reduce((c: ActivityInterface[], d) => {
          return c.concat(d.activity);
        }, [])
      );
    }, []);
    activity.sort((a, b) => sortByDate(a.begin, b.begin));
    if (first) {
      return activity.slice(-1)[0].begin;
    } else {
      return activity[0].begin;
    }
  }
  return 0;
};
export const activityOrder = (data: HistoryListInterface[], first = true) => {
  if (data.length) {
    const activity = [...data].reduce((a: ActivityInterface[], b) => {
      return a.concat(
        b.sessions.reduce((c: ActivityInterface[], d) => {
          return c.concat(d.activity);
        }, [])
      );
    }, []);
    activity.sort((a, b) => sortByDate(a.begin, b.begin));
    const firstDate = new Date(activity[0].begin).getDate();
    const lastDate = new Date(activity[activity.length - 1].begin).getDate();
    if (firstDate === lastDate) {
      return new Date().getTime();
    } else {
      // const startDate = new Date(activity[0].begin);
      // do {
      //
      //   while (startDate) {
      //
      //   }
      // }
      // for (let i = firstDate; i <= lastDate; i++) {
      //   console.log(i);
      // }
      return new Date().getTime();
    }
  }
  return 0;
};
export const getData = (useFilter = true) =>
  new Promise((resolve) => {
    chrome.storage.local.get({ pagesOR: {} }, (result) => {
      if (result.pagesOR) {
        const structuredArray = createStructure(result.pagesOR, useFilter);
        historyList.value = structuredArray.filter((f) => f.sessions.length);
        historyList.value.sort(
          (a, b) =>
            totalTimeCalculation(b.sessions) - totalTimeCalculation(a.sessions)
        );
        resolve(true);
      } else {
        resolve(true);
      }
    });
  });
export const loadData = (loadCharts = false) => {
  showLoader.value = true;
  Promise.all([getData(), getHostData(), getLimitsData()]).then(() => {
    showLoader.value = false;
    if (loadCharts) {
      if (hostTabSelected.value.domain) {
        const findSession = historyList.value.find(
          (f) => f.domain === hostTabSelected.value.domain
        );
        if (findSession) {
          hostItem.value = findSession;
        } else {
          hostItem.value.sessions = [];
        }
        getSiteData(hostItem.value.sessions);
      } else {
        const sessions = historyList.value.reduce(
          (a: SessionInterface[], b) => a.concat(b.sessions),
          []
        );
        if (sessions.length) {
          getSiteData(sessions);
        } else {
          getSiteData([]);
        }
      }
    }
    destroyTrackerInterval();
    initTrackerInterval();
  });
};
export const totalTime = (useCounter = false) => {
  let total = historyList.value.reduce(
    (a, b) => a + totalTimeCalculation(b.sessions),
    0
  );
  if (useCounter) {
    total += trackerCounter.value;
  }
  return total;
};

export const totalSessionTime = (useCounter = false) => {
  let total = totalTimeCalculation(hostItem.value.sessions);
  if (total) {
    if (useCounter) {
      total += trackerCounter.value;
    }
    return total;
  }
  return 0;
};

export const usageMask = (total: number) => {
  const keys = [SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE];
  const filter = keys.filter((key) => total >= key);
  if (filter.length) {
    return filter
      .reverse()
      .map((v, i) => {
        switch (i) {
          case 0: {
            return "minutes";
          }
          case 1: {
            return "hours";
          }
          case 2: {
            return "days";
          }
        }
      })
      .reverse();
  } else {
    return ["seconds"];
  }
};
