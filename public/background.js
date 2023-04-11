const validUrlRegex = /^(http|https):\/\//i; // Modified regular expression to properly match URLs
let isVisited = false;

let intervalId = 0;
let timeActivity = 0;
let timeUserIsUnActive = 0;
let disabledTracker = false;
let showNotification = false;

let settings = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.activity) {
    timeUserIsUnActive = 0;
    if (disabledTracker) {
      disabledTracker = false;
      activeTabListener();
    }
  }
});

const activeTabListener = () => {
  chrome.tabs.onActivated.addListener((tab) => {
    isVisited = true;
    const tabId = tab.tabId;
    updatePageTime(tabId);
  });
};
chrome.runtime.onInstalled.addListener(() => {
  activeTabListener();
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && validUrlRegex.test(tab.url)) {
      updatePageTime(tabId);
    }
  });
});
const createNotification = () => {
  chrome.storage.local.get(["notificationMassage"], (result) => {
    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: "favicon.ico",
        title: "Onix Time Manager",
        message: result.notificationMassage
          ? result.notificationMassage
          : "We wanted to inform you that you have reached your daily limit. Further tracking beyond this point will not be recorded.",
      },
      () => {
        showNotification = false;
      }
    );
  });
};

const updatePageTime = (tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    chrome.storage.local.get(["settings"], (result) => {
      settings = result.settings;
      let timeout = 0;
      if (settings && settings.tracking) {
        timeout = 300000;
      } else {
        timeout = 0;
      }
      if (
        settings &&
        (settings.trackingActivityTime.minute ||
          settings.trackingActivityTime.second)
      ) {
        timeActivity = timeToSeconds(settings.trackingActivityTime);
      }
      if (validUrlRegex.test(tab.url)) {
        showNotification = true;
        const { url } = tab;
        const today = new Date().toLocaleDateString();
        let limitsSites = [];
        let blockedSites = [];
        timeUserIsUnActive = 0;
        const checkLimits = () => {
          if (limitsSites && limitsSites.length) {
            const isBlock = limitsSites.find((site) =>
              tab.url.includes(site.url)
            );
            if (limitsSites && isBlock) {
              const currentTime = Math.floor(Date.now() / 1000);
              if (
                showNotification &&
                isBlock.blockTime - currentTime <
                  timeToSeconds(settings.limitsMassageTime) &&
                settings &&
                settings.getNotification
              ) {
                createNotification();
              }
              if (currentTime > isBlock.blockTime) {
                chrome.tabs.update(tabId, {
                  url: chrome.runtime.getURL("blockPage.html"),
                });
              }
            }
          }
        };
        const checkBlocker = () => {
          if (blockedSites && blockedSites.length) {
            const isBlock = blockedSites.find((site) =>
              tab.url.includes(site.url)
            );
            if (blockedSites && isBlock) {
              chrome.tabs.update(tabId, {
                url: chrome.runtime.getURL("blockPage.html"),
              });
            }
          }
        };
        chrome.storage.local.get(["limitsSites"], (result) => {
          limitsSites = result.limitsSites;
          checkLimits();
        });
        chrome.storage.local.get(["blockedSites"], (result) => {
          blockedSites = result.blockedSites;
          checkBlocker();
        });

        const pageData = {
          url,
          timeSpent: 0,
          visited: 0,
          firstOpen: "",
          lastOpen: "",
          history: [],
          icon: "",
        };

        const createUpdateSite = () => {
          chrome.storage.local.get({ pages: [] }, (result) => {
            let { pages } = result;
            const existingPage = pages.find(
              (p) => p.url === new URL(url).hostname
            );
            if (existingPage) {
              existingPage.timeSpent++;
              existingPage.lastOpen = today;
              existingPage.icon = tab.favIconUrl;
              if (existingPage.history[0].day === today) {
                existingPage.history[0].timeSpent++;
                if (isVisited) {
                  existingPage.history[0].visited++;
                }
              } else {
                existingPage.history.unshift({
                  day: today,
                  url: existingPage.url,
                  timeSpent: 1,
                  visited: 1,
                });
              }
              if (isVisited) {
                existingPage.visited++;
                isVisited = false;
              }
            } else {
              if (isVisited) {
                pageData.visited++;
                isVisited = false;
              }
              pageData.history.unshift({
                day: today,
                url: new URL(pageData.url).hostname,
                timeSpent: 1,
                visited: 1,
              });
              pageData.timeSpent++;
              pageData.firstOpen = today;
              pageData.lastOpen = today;
              pageData.url = new URL(pageData.url).hostname;
              pageData.icon = tab.favIconUrl;
              pages.push(pageData);
            }

            chrome.storage.local.set({ pages }, () => {
              pages;
            });
          });
        };

        if (settings && !settings.tracking) {
          createUpdateSite();
        }
        setTimeout(() => {
          intervalId = setInterval(() => {
            timeUserIsUnActive += 1;
            createUpdateSite();
            checkLimits();
            checkBlocker();
            if (timeUserIsUnActive === timeActivity) {
              clearInterval(intervalId);
              disabledTracker = true;
            }
          }, 1000);
        }, timeout);

        chrome.tabs.onActivated.addListener((newTab) => {
          if (newTab.tabId !== tabId) {
            clearInterval(intervalId);
          }
        });

        chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo) => {
          if (updatedTabId === tabId && changeInfo.status === "complete") {
            clearInterval(intervalId);
          }
        });
      }
    });
  });
};

const timeToSeconds = (timeStr) => {
  if (timeStr) {
    const { hour, minute, second } = timeStr;
    const hours = parseInt(hour ? hour : 0);
    const minutes = parseInt(minute ? minute : 0);
    const seconds = parseInt(second ? second : 0);

    return hours * 3600 + minutes * 60 + seconds;
  }
};
