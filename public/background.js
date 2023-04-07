const validUrlRegex = /^(http|https|www)/;
let isVisited = false;
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onActivated.addListener((tab) => {
    isVisited = true;
    const tabId = tab.tabId;
    updatePageTime(tabId);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && validUrlRegex.test(tab.url)) {
      updatePageTime(tabId);
    }
  });
});

chrome.alarms.onAlarm.addListener(() => {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "favicon.ico",
      title: "Stay Hydrated",
      message: "Have a sip of water human!",
    },
    () => {
      console.log("notification");
    }
  );
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background.js got a message");
  console.log(request);
  console.log(sender);
  sendResponse("bar");
  createAlarm();
});

const createAlarm = () => {
  console.log("createAlarm");
  chrome.alarms.create("drink_water", {
    delayInMinutes: 0,
  });
};

function updatePageTime(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (validUrlRegex.test(tab.url)) {
      const { url } = tab;
      const today = new Date().toLocaleDateString();
      let limitsSites = [];
      let blockedSites = [];
      const checkLimits = () => {
        if (limitsSites && limitsSites.length) {
          const isBlock = limitsSites.find((site) =>
            tab.url.includes(site.url)
          );
          if (limitsSites && isBlock) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime - isBlock.blockTime < 600) {
              // chrome.runtime.sendMessage("foo", (response) => {
              //   console.log(response);
              // });
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
              if (existingPage.history.length >= 7) {
                existingPage.history.pop();
              }
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

      createUpdateSite();
      const intervalId = setInterval(() => {
        createUpdateSite();
        checkLimits();
        checkBlocker();
      }, 1000);

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
}
