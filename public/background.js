const validUrlRegex = /^(http|https):\/\//i; // Modified regular expression to properly match URLs

let tabIdCopy = 0;
let currentUrl = "";

let settings = [];
let showNotification = false;
let currentInformation = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onActivated.addListener((tab) => {
    updateCurrentSession(tabIdCopy);
    tabIdCopy = tab.tabId;
    detectRedirect();
    updatePageTime(tabIdCopy, false);
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && validUrlRegex.test(tab.url)) {
      if (tabId === tabIdCopy) {
        tabIdCopy = tabId;
        updateCurrentSession(tabIdCopy);
        detectRedirect();
        updatePageTime(tabIdCopy, true);
      }
    }
  });
  chrome.tabs.onRemoved.addListener((tabId, info) => {
    updateCurrentSession(tabId);
  });
});

const updateCurrentSession = (tabID) => {
  if (currentInformation[currentUrl]) {
    let data = currentInformation[currentUrl].sessions;
    if (data[tabID] && data[tabID].length) {
      data[tabID][0].activity[0].end = Date.now();
    }
    chrome.storage.local.set({ pages: currentInformation }).then();
  }
};

const createNotification = (message = "") => {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "favicon.ico",
      title: "Time Manager",
      message: message,
    },
    () => {
      showNotification = false;
    }
  );
};

const createMessage = (data) => {
  chrome.tabs.sendMessage(tabIdCopy, data, function (response) {
    if (chrome.runtime.lastError) {
      return chrome.runtime.lastError.message;
    }
    return response;
  });
};

const updatePageTime = (tabId, isUpdated) => {
  chrome.tabs.get(tabId, (tab) => {
    chrome.storage.local.get(["settings"], (result) => {
      settings = result.settings;

      if (validUrlRegex.test(tab.url)) {
        showNotification = true;
        const { url } = tab;
        currentUrl = new URL(url).hostname;

        chrome.storage.local.get({ pages: {} }, async (result) => {
          let { pages } = result;
          let timeSpent = 0;

          if (isUpdated) {
            if (!pages[currentUrl]) {
              pages[currentUrl] = { icon: tab.favIconUrl, sessions: {} };
            }
            const sessions = pages[currentUrl].sessions;
            if (!sessions[tab.id]) {
              sessions[tab.id] = [];
            }
            sessions[tab.id].unshift({
              id: tab.id + new Date().getTime(),
              path: tab.url,
              activity: [{ begin: new Date().getTime(), end: 0 }],
            });
            const copySite = { ...pages[currentUrl] };
            console.log(pages);
          } else {
            const sessions = pages?.[currentUrl]?.sessions ?? {};
            if (sessions[tab.id]) {
              sessions[tab.id][0].activity.unshift({
                begin: new Date().getTime(),
                end: 0,
              });
              sessions[tab.id][0].activity.forEach((item) => {
                if (!item.end) {
                  timeSpent += new Date().getTime() - item.begin;
                } else {
                  timeSpent += item.end - item.begin;
                }
              });
            }
          }
          createMessage({
            currentUrl: currentUrl,
            timeSpent,
            message: "activeTab",
          });
          console.log(pages);

          currentInformation = pages;

          await chrome.storage.local.set({ pages });
        });
      }
    });
  });
};

// Redirect
const detectRedirect = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length) {
      chrome.storage.local.get("redirect").then((res) => {
        if (res && res.redirect) {
          const index = res.redirect.findIndex(
            (value) => value.initial === tabs[0].url
          );
          if (index > -1) {
            createMessage({
              initial: res.redirect[index].initial,
              url: res.redirect[index].redirect,
              message: "redirect",
            });
          }
        }
      });
    }
  });
};
chrome.runtime.onMessage.addListener((request, sender) => {
  const redirect = "redirect";
  const goToOptions = "goToOptions";
  switch (request.message) {
    case redirect: {
      const hostname = new URL(request.initial).hostname;
      createNotification(
        `You have been redirected from ${hostname} due to settings, please check on dashboard.`
      );
      break;
    }
    case goToOptions: {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs && tabs.length) {
          chrome.tabs.update(tabs[0].id, {
            url: chrome.runtime.getURL("index.html"),
          });
        }
      });
      break;
    }
  }
});
