const validUrlRegex = /^(http|https):\/\//i; // Modified regular expression to properly match URLs

let tabIdCopy = 0;
let currentUrl = "";

let intervalId = 0;
let siteIsBlocked = false;
let settings = "";
let showNotification = false;
let currentInformation = {};
let isTabCreated = false;

const getTabData = (tabId) => chrome.tabs.get(tabId);
const getStorageData = (scope) => chrome.storage.local.get([scope]);

const noActivityCheck = (date) => {
  const begin = new Date(date);
  const end = new Date();
  let divider = 60000;

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
  const diff = Math.floor((utc2 - utc1) / divider);
  return diff < 10;
};

const setEndDate = (res, sessionId) => {
  console.log("setEndDate", sessionId);
  return new Promise((resolve) => {
    let pages = res.pagesOR;
    const keys = Object.keys(pages);
    keys.forEach((hostName, index) => {
      const sessionsKeys = Object.keys(pages[hostName].sessions);
      if (sessionsKeys.includes(sessionId.toString())) {
        const findIndex = pages[hostName].sessions[sessionId].findIndex((f) => {
          return f.activity.some((s) => !s.end);
        });
        if (findIndex !== -1) {
          getStorageData("tabInfo").then((res) => {
            if (res && res.tabInfo) {
              const activityIndex = pages[hostName].sessions[sessionId][
                findIndex
              ].activity.findIndex((value) => !value.end);
              if (noActivityCheck(res.tabInfo.updateAt)) {
                pages[hostName].sessions[sessionId][findIndex].activity[
                  activityIndex
                ].end = new Date().getTime();
              } else {
                pages[hostName].sessions[sessionId][findIndex].activity.splice(
                  activityIndex,
                  1
                );
              }
              chrome.storage.local.set({ pagesOR: pages });
              console.log("setEndDate set pages", pages);
              resolve(true);
            }
          });
        }
      }
      if (index + 1 === keys.length) {
        resolve(true);
      }
    });
  });
};
const setBegin = (tab, onActive = false) => {
  console.log("setBegin", tab);
  if (chrome && chrome.tabs && (tab || tab.tabId)) {
    getStorageData("tabInfo").then((res) => {
      new Promise((resolve) => {
        if (res && res.tabInfo) {
          getStorageData("pagesOR").then((result) => {
            if (result && result.pagesOR) {
              setEndDate(result, res.tabInfo.id).then(() => {
                resolve(true);
              });
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      }).then(() => {
        const tabId = tab.tabId ? tab.tabId : tab;
        getTabData(tabId).then(({ id, windowId, url, favIconUrl }) => {
          const urlData = new URL(url);
          let hostName = url;
          if (urlData.protocol !== "chrome-extension:") {
            hostName = urlData.hostname;
          } else {
            hostName = "extensions";
          }
          chrome.storage.local.set({
            tabInfo: {
              hostName,
              id,
              windowId,
              updateAt: new Date().getTime(),
            },
          });
          const keys = ["newtab", "extensions"];
          if (hostName && keys.every((e) => !hostName.includes(e))) {
            getStorageData("pagesOR").then((res) => {
              const createDomainStructure = () => {
                return {
                  icon: favIconUrl,
                  sessions: {},
                };
              };

              const createActivityStructure = () => {
                return { begin: new Date().getTime() };
              };

              const createSessionStructure = () => {
                return {
                  id: id + new Date().getTime(),
                  path: url,
                  activity: [createActivityStructure()],
                };
              };

              const createEmptyDomain = () => {
                pages[hostName] = createDomainStructure();
                pages[hostName].sessions[id] = [];
                pages[hostName].sessions[id].push(createSessionStructure());
              };
              let pages = {};
              if (res && res.pagesOR) {
                pages = res.pagesOR;
              }
              if (pages[hostName]) {
                if (pages[hostName].sessions[id]) {
                  const findIndex = pages[hostName].sessions[id].findIndex(
                    (f) => {
                      return f.activity.some((s) => !s.end);
                    }
                  );
                  if (findIndex !== -1) {
                    const activityIndex = pages[hostName].sessions[id][
                      findIndex
                    ].activity.findIndex((value) => !value.end);
                    pages[hostName].sessions[id][findIndex].activity[
                      activityIndex
                    ].end = new Date().getTime();
                  }
                  if (onActive) {
                    pages[hostName].sessions[id][0].activity.unshift(
                      createActivityStructure()
                    );
                  } else {
                    pages[hostName].sessions[id].unshift(
                      createSessionStructure()
                    );
                  }
                } else {
                  pages[hostName].sessions[id] = [];
                  pages[hostName].sessions[id].push(createSessionStructure());
                }
              } else {
                createEmptyDomain();
              }
              chrome.storage.local.set({ pagesOR: pages });
              console.log("setBegin set pages", pages);
            });
          }
        });
      });
    });
  }
};

chrome.tabs.onActivated.addListener((tab) => {
  console.log("onActivated", tab);
  setBegin(tab, true);
});
let time = 0;
chrome.tabs.onUpdated.addListener((tab) => {
  console.log("onUpdated", tab);
  if (time) {
    const dif = time.getTime() - new Date().getTime();
    const secondsCount = dif / 1000;
    const secondsBetweenDates = Math.abs(secondsCount);
    if (secondsBetweenDates > 1) {
      time = new Date();
      setBegin(tab);
    }
  } else {
    time = new Date();
    setBegin(tab);
  }
});
chrome.tabs.onRemoved.addListener((sessionId) => {
  console.log("onRemoved", sessionId);
  getStorageData("pagesOR").then((res) => {
    if (res && res.pagesOR) {
      setEndDate(res, sessionId).then();
    }
  });
});

chrome.windows.onRemoved.addListener((sessionId) => {
  console.log("chrome windows onRemoved", sessionId);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onActivated.addListener((tab) => {
    if (!isTabCreated || !tabIdCopy) {
      clearInterval(intervalId);
      siteIsBlocked = false;
      tabIdCopy = tab.tabId;
      detectRules();
      updatePageTime(tabIdCopy, false);
    } else {
      isTabCreated = false;
      clearInterval(intervalId);
    }
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && validUrlRegex.test(tab.url)) {
      if (validUrlRegex.test(tab.url) && !currentUrl) {
        showNotification = true;
      }
      clearInterval(intervalId);
      siteIsBlocked = false;
      tabIdCopy = tabId;
      detectRules();
      updatePageTime(tabIdCopy, true);
      isTabCreated = false;
    }
  });
  chrome.tabs.onCreated.addListener((tab) => {
    clearInterval(intervalId);
    if (validUrlRegex.test(tab.url)) {
      showNotification = true;
    } else {
      currentUrl = "";
    }
    isTabCreated = true;
    tabIdCopy = tab.id;
    detectRules();
  });
  chrome.tabs.onRemoved.addListener((tabId, info) => {
    if (tabIdCopy === tabId) {
      siteIsBlocked = false;
      clearInterval(intervalId);
    }
  });
  chrome.windows.onRemoved.addListener((tabId, info) => {
    siteIsBlocked = false;
    clearInterval(intervalId);
  });
});

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
        const { url } = tab;
        currentUrl = new URL(url).hostname;
        //check Permission
        if (settings && settings.permission) {
          chrome.storage.local.get("permission").then((res) => {
            if (res && res.permission) {
              const type = res.permission.type;
              if (type !== "off") {
                const list = res.permission.list[type];
                const keys = Object.keys(list);
                if (keys.length) {
                  const includes = keys.includes(currentUrl);
                  if (includes) {
                    if (type === "blacklist") {
                      createMessage({
                        message: "blockPage",
                      });
                      siteIsBlocked = true;
                    }
                  } else if (type === "whitelist") {
                    createMessage({
                      message: "blockPage",
                    });
                    siteIsBlocked = true;
                  }
                }
              }
            }
          });
        }

        //work with sessions data and limits
        chrome.storage.local.get({ pages: {} }, async (result) => {
          let { pages } = result;

          if (!pages[currentUrl]) {
            pages[currentUrl] = {
              icon: tab.favIconUrl,
              sessions: {},
            };
          }
          const sessions = pages[currentUrl].sessions;
          if (!sessions[tab.id]) {
            sessions[tab.id] = [];
          }

          const createSession = () => {
            sessions[tab.id].unshift({
              id: tab.id + new Date().getTime(),
              path: tab.url,
              activity: [
                { begin: new Date().getTime(), end: new Date().getTime() },
              ],
            });
          };

          if (isUpdated) {
            createSession();
          } else {
            if (sessions[tab.id] && sessions[tab.id].length) {
              sessions[tab.id][0].activity.unshift({
                begin: new Date().getTime(),
                end: new Date().getTime(),
              });
            } else {
              createSession();
            }
          }

          //this function need for finish current session
          const trackerFunction = () => {
            if (sessions[tab.id]) {
              sessions[tab.id][0].activity[0].end = new Date().getTime();
            }
            limitsFunction();
          };

          //this function need for check limits
          const limitsFunction = () => {
            chrome.storage.local.get("limits", async (result) => {
              const limits = result.limits;
              if (result && limits) {
                let browserBlockAfter = 0;
                let siteBlockAfter = 0;
                const currentDate = parseDate(new Date().getTime());
                if (limits.browserLimit) {
                  browserBlockAfter =
                    limits.browserTime.timeLimit - limits.browserTime.timeSpent;
                  if (
                    settings.getNotification &&
                    showNotification &&
                    browserBlockAfter > 0 &&
                    browserBlockAfter <= 360
                  ) {
                    createNotification(settings.notification);
                  }
                  if (
                    limits.browserTime.timeSpent >= limits.browserTime.timeLimit
                  ) {
                    createMessage({
                      message: "limitsPage",
                    });
                    siteIsBlocked = true;
                  }
                  if (!siteIsBlocked) {
                    if (limits.browserTime.date !== currentDate) {
                      limits.browserTime.timeSpent = 0;
                      limits.browserTime.date = currentDate;
                    } else {
                      limits.browserTime.timeSpent += 1;
                    }
                  }
                }
                let limit = undefined;

                if (limits.sitesLimit) {
                  const limitUrl = `https://${currentUrl}`;
                  limit =
                    limits &&
                    limits.list &&
                    Object.keys(limits.list).includes(limitUrl)
                      ? limits.list[limitUrl]
                      : "";
                  if (limit) {
                    siteBlockAfter =
                      limit.siteLimit.timeLimit - limit.siteLimit.timeSpent;
                    if (
                      settings.getNotification &&
                      showNotification &&
                      siteBlockAfter > 0 &&
                      siteBlockAfter <= 360
                    ) {
                      createNotification(settings.notification);
                    }
                    if (
                      limit.siteLimit.timeSpent >= limit.siteLimit.timeLimit
                    ) {
                      createMessage({
                        message: "limitsPage",
                      });
                      siteIsBlocked = true;
                    }
                    if (!siteIsBlocked) {
                      if (limit.siteLimit.date !== currentDate) {
                        limit.siteLimit.timeSpent = 0;
                        limit.siteLimit.date = currentDate;
                      } else {
                        limit.siteLimit.timeSpent += 1;
                      }
                    }
                  }
                }
                if (
                  (browserBlockAfter <= 360 || siteBlockAfter <= 360) &&
                  siteBlockAfter >= 0 &&
                  browserBlockAfter >= 0
                ) {
                  if (
                    browserBlockAfter && limit
                      ? browserBlockAfter < siteBlockAfter
                      : limits.browserLimit
                  ) {
                    createMessage({
                      time: browserBlockAfter,
                      message: "popupTime",
                    });
                  } else if (limit && limits.sitesLimit) {
                    createMessage({
                      time: siteBlockAfter,
                      message: "popupTime",
                    });
                  }
                }
                chrome.storage.local.set({ limits }).then();
              }
            });
          };

          trackerFunction();
          await chrome.storage.local.set({ pages });

          //this interval for checking limits and finish session every second to avoid errors with browser tabs
          intervalId = setInterval(() => {
            if (!siteIsBlocked) {
              trackerFunction();
            } else {
              createMessage({
                message: "stopTracking",
              });
            }
            currentInformation = pages;
            chrome.storage.local.set({ pages });
          }, 1000);
        });
      }
    });
  });
};

// Redirect
const detectRules = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length) {
      checkForRedirection(tabs[0]);
    }
  });
};

const checkForRedirection = (tab) => {
  chrome.storage.local.get("redirect").then((res) => {
    if (res && res.redirect) {
      const site = res.redirect.find((value) => {
        return value.initial === tab.url;
      });
      if (site) {
        chrome.tabs.update(
          tab.id,
          {
            url: site.redirect,
          },
          () => {
            if (settings && settings.getNotification) {
              createNotification(
                `You have been redirected from ${site.initial} due to settings, please check on dashboard.`
              );
            }
          }
        );
      }
    }
  });
};

//this need for listening actions from content.js
chrome.runtime.onMessage.addListener((request, sender) => {
  const goToOptions = "goToOptions";
  switch (request.message) {
    //this need for open options page
    case goToOptions: {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs && tabs.length) {
          chrome.tabs
            .update(tabs[0].id, {
              url: chrome.runtime.getURL("index.html") + "#" + request.to,
            })
            .then();
        }
      });
      break;
    }
  }
});

//parse date to format day.month.year 19.05.2023
const parseDate = (dateString) => {
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
