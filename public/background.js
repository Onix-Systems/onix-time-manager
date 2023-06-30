const validUrlRegex = /^(http|https):\/\//i; // Modified regular expression to properly match URLs

let tabIdCopy = 0;
let currentUrl = "";

let intervalId = 0;
let siteIsBlocked = false;
let settings = "";
let showNotification = false;
let currentInformation = {};
let isTabCreated = false;
let tabPause = 0;
let trackerPause = false;
let reloaded = 0;

let trackerInterval = 0;
let counter = 0;

let isMessageSent = false;
const generalLimit = {
  current: 0,
  limit: -1,
};
const localLimit = {
  current: 0,
  limit: -1,
};

chrome.storage.local.get("currentDate").then((res) => {
  if (res.currentDate) {
    if (new Date(res.currentDate).getDate() !== new Date().getDate()) {
      generalLimit.current = 0;
      localLimit.current = 0;
      generalLimit.limit = -1;
      localLimit.limit = -1;
    }
  } else {
    chrome.storage.local.set({ currentDate: new Date() });
  }
});

const getSettings = () => {
  chrome.storage.local.get("settings").then((res) => {
    if (res.settings) {
      settings = res.settings;
      console.log("settings", settings);
    }
  });
};

const initTrackerInterval = () => {
  trackerInterval = setInterval(() => {
    if (!trackerPause) {
      counter++;
      tabPause++;

      if (tabPause === 600) {
        trackerPause = true;
        createMessage({ message: "pausePopup" });
      }
      if (tabPause === 480) {
        checkVideoIsPlayed();
      }
      chrome.storage.local.set({ counter });
      checkForLimits();
    }
  }, 1000);
};
const destroyTrackerInterval = () => {
  clearInterval(trackerInterval);
  counter = 0;
  chrome.storage.local.set({ counter });
};
const stopTracker = () => {
  getStorageData("pagesOR").then((res) => {
    if (res && res.pagesOR) {
      setEndDate(res, tabIdCopy).then(() => {
        destroyTrackerInterval();
      });
    }
  });
};
const getTabInfoPromise = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get("tabInfo").then((res) => {
      if (res.tabInfo) {
        resolve(res.tabInfo);
      } else {
        resolve(false);
      }
    });
  });
};
const getLimitsPromise = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get("limits").then((res) => {
      if (res.limits) {
        resolve(res.limits);
      } else {
        resolve(false);
      }
    });
  });
};

const getTabData = (tabId) => chrome.tabs.get(tabId);
const getStorageData = (scope) => chrome.storage.local.get([scope]);

const dateDiffMeth = (a, b, divider) => {
  const begin = new Date(a);
  const end = new Date(b);
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
  return Math.abs(Math.floor((utc2 - utc1) / divider));
};

const updateLimitData = () => {
  getStorageData("timeSpent").then((res) => {
    if (res.timeSpent) {
      const { general } = res.timeSpent;
      const originList = res.timeSpent.list;
      Promise.all([getTabInfoPromise(), getLimitsPromise()]).then((res) => {
        const result = res.reduce((a, b) => {
          if (b) {
            return { ...a, ...b };
          } else {
            return a;
          }
        }, {});
        const { browserTime, list, browserLimit, sitesLimit, hostName } =
          result;
        console.log("browserLimit", result);
        if (browserLimit) {
          if (general > browserTime.timeLimit) {
            generalLimit.current = browserTime.timeLimit;
            generalLimit.limit = -1;
            createMessage({
              message: "limitsPage",
            });
            stopTracker();
            return;
          } else {
            generalLimit.current = general;
            generalLimit.limit = browserTime.timeLimit;
          }
        } else {
          generalLimit.current = 0;
          generalLimit.limit = -1;
        }

        if (sitesLimit) {
          const listKeys = Object.keys(list);
          const key = `https://${hostName}`;
          if (listKeys.includes(key)) {
            if (originList[key] > list[key].siteLimit.timeLimit) {
              localLimit.current = list[key].siteLimit.timeLimit;
              localLimit.limit = -1;
              createMessage({
                message: "limitsPage",
              });
              stopTracker();
            } else {
              localLimit.current = originList[key];
              localLimit.limit = list[key].siteLimit.timeLimit;
            }
          } else {
            localLimit.current = 0;
            localLimit.limit = -1;
          }
        } else {
          localLimit.current = 0;
          localLimit.limit = -1;
        }
      });
    }
  });
};

const saveGeneralLimit = () => {
  return new Promise((resolve) => {
    getStorageData("timeSpent").then((res) => {
      const saveData = (general, limits, currentDate) => {
        Promise.all([getTabInfoPromise(), getLimitsPromise()]).then((res) => {
          const result = res.reduce((a, b) => {
            if (b) {
              return { ...a, ...b };
            } else {
              return a;
            }
          }, {});
          const { browserTime, list, browserLimit, sitesLimit, hostName } =
            result;
          if (!browserLimit || !browserTime.timeLimit) {
            general = 0;
          }
          if (sitesLimit) {
            const listKeys = Object.keys(list);
            const key = `https://${hostName}`;
            if (listKeys.includes(key)) {
              limits[key] += counter;
            }
          }
          const timeSpent = {
            general,
            list: limits,
            date: currentDate,
          };
          chrome.storage.local.set({ timeSpent }).finally(() => {
            resolve(true);
          });
        });
      };
      if (res.timeSpent) {
        let { general, list, date } = res.timeSpent;
        general += counter;
        saveData(general, list, date);
      } else {
        saveData(counter, {}, parseDate(new Date()));
      }
    });
  });
};

const setEndDate = (res, sessionId) => {
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
              const isSave =
                dateDiffMeth(
                  new Date(res.tabInfo.updateAt),
                  new Date(),
                  1000
                ) >= 2;
              if (isSave) {
                const begin = new Date(
                  pages[hostName].sessions[sessionId][findIndex].activity[
                    activityIndex
                  ].begin
                );
                if (counter) {
                  pages[hostName].sessions[sessionId][findIndex].activity[
                    activityIndex
                  ].end = begin.setSeconds(begin.getSeconds() + counter);
                } else {
                  pages[hostName].sessions[sessionId][findIndex].activity[
                    activityIndex
                  ].end = new Date().getTime();
                  const begin =
                    pages[hostName].sessions[sessionId][findIndex].activity[
                      activityIndex
                    ].begin;
                  const end =
                    pages[hostName].sessions[sessionId][findIndex].activity[
                      activityIndex
                    ].end;
                  counter = dateDiffMeth(begin, end, 1000);
                }
                saveGeneralLimit().then(() => {
                  counter = 0;
                  updateLimitData();
                });
              } else {
                pages[hostName].sessions[sessionId][findIndex].activity.splice(
                  activityIndex,
                  1
                );
              }
              chrome.storage.local.set({ pagesOR: pages });
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
  isMessageSent = false;
  return new Promise((resolve) => {
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
          setTimeout(() => {
            const tabId = tab.tabId ? tab.tabId : tab;
            getTabData(tabId).then(({ id, windowId, url, favIconUrl }) => {
              const urlData = url ? new URL(url) : url;
              let hostName = url;
              if (url && urlData.protocol !== "chrome-extension:") {
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

                        const begin = new Date(
                          pages[hostName].sessions[id][findIndex].activity[
                            activityIndex
                          ].begin
                        );

                        if (counter) {
                          pages[hostName].sessions[id][findIndex].activity[
                            activityIndex
                          ].end = begin.setSeconds(
                            begin.getSeconds() + counter
                          );
                        } else {
                          pages[hostName].sessions[id][findIndex].activity[
                            activityIndex
                          ].end = new Date().getTime();
                          const begin =
                            pages[hostName].sessions[id][findIndex].activity[
                              activityIndex
                            ].begin;
                          const end =
                            pages[hostName].sessions[id][findIndex].activity[
                              activityIndex
                            ].end;
                          counter = dateDiffMeth(begin, end, 1000);
                        }
                        saveGeneralLimit().then(() => {
                          counter = 0;
                          updateLimitData();
                        });
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
                      pages[hostName].sessions[id].unshift(
                        createSessionStructure()
                      );
                    }
                  } else {
                    createEmptyDomain();
                  }
                  chrome.storage.local.set({ pagesOR: pages });
                  resolve(true);
                });
              } else {
                resolve(true);
              }
            });
          }, 500);
        });
      });
    } else {
      resolve(true);
    }
  });
};

const checkForUrl = (tab) => {
  const tabId = tab.tabId ? tab.tabId : tab;
  getTabData(tabId).then((res) => {
    if (res.url) {
      const { url } = res;
      const urlData = url ? new URL(url) : url;
      currentUrl = urlData;
      let hostName = url;
      if (url && urlData.protocol !== "chrome-extension:") {
        hostName = urlData.hostname;
      } else {
        hostName = "extensions";
      }
      const keys = ["newtab", "extensions"];
      destroyTrackerInterval();
      if (keys.every((e) => hostName !== e) && !siteIsBlocked) {
        initTrackerInterval();
      }
    }
  });
};

const checkVideoIsPlayed = () => {
  chrome.tabs.sendMessage(
    tabIdCopy,
    { message: "videoIsLoading" },
    (response) => {
      if (chrome.runtime.lastError) {
        return chrome.runtime.lastError.message;
      }
      if (!response) {
        const message = `You have no activity for 8 minutes on ${
          new URL(currentUrl).hostname
        }. Please move your mouse.`;
        createNotification(message);
      }
      return response;
    }
  );
};

const checkScriptIsLoaded = () => {
  if (reloaded < 1) {
    chrome.tabs.sendMessage(
      tabIdCopy,
      { message: "checkLoaded" },
      (response) => {
        if (chrome.runtime.lastError || !response) {
          console.log("Content script is not loaded");
          chrome.tabs.reload(tabIdCopy);
          reloaded++;
          return chrome.runtime.lastError.message;
        } else {
          console.log("Content script is loaded");
        }
        return response;
      }
    );
  }
};
chrome.tabs.onActivated.addListener((tab) => {
  if (!isTabCreated || !tabIdCopy) {
    tabIdCopy = tab.tabId;
    siteIsBlocked = false;
    tabPause = 0;
    trackerPause = false;
    reloaded = 0;
    checkScriptIsLoaded();
    createMessage({
      message: "clearPopup",
    });
    setBegin(tab, true).then(() => {
      checkForUrl(tab);
      updateLimitData();
    });
    detectRules();
  } else {
    isTabCreated = false;
  }
});
let time = 0;
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && validUrlRegex.test(tab.url)) {
    console.log("onUpdated", tabId, tab);
    siteIsBlocked = false;
    tabPause = 0;
    trackerPause = false;
    checkScriptIsLoaded();
    if (time) {
      const dif = time.getTime() - new Date().getTime();
      const secondsCount = dif / 1000;
      const secondsBetweenDates = Math.abs(secondsCount);
      if (secondsBetweenDates > 1) {
        time = new Date();
        setBegin(tabId).then(() => {
          checkForUrl(tabId);
          updateLimitData();
        });
      }
    } else {
      time = new Date();
      setBegin(tabId).then(() => {
        checkForUrl(tabId);
        updateLimitData();
      });
    }
    detectRules();
    tabIdCopy = tabId;
    isTabCreated = false;
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  console.log("onCreated", tab);
  isTabCreated = true;
  siteIsBlocked = false;
  tabPause = 0;
  reloaded = 0;
  trackerPause = false;
  tabIdCopy = tab.id;
  checkScriptIsLoaded();
  if (tab.pendingUrl) {
    const proceed = () => {
      const { pendingUrl } = tab;
      const urlData = pendingUrl ? new URL(pendingUrl) : pendingUrl;
      let hostName = pendingUrl;
      if (pendingUrl && urlData.protocol !== "chrome-extension:") {
        hostName = urlData.hostname;
      } else {
        hostName = "extensions";
      }
      const keys = ["newtab", "extensions"];
      destroyTrackerInterval();
      if (keys.every((e) => hostName !== e)) {
      } else {
        chrome.storage.local.set({
          tabInfo: {
            hostName: "extensions",
            id: tab.id,
            windowId: tab.windowId,
            updateAt: new Date().getTime(),
          },
        });
      }
    };

    getStorageData("tabInfo").then((res) => {
      if (res && res.tabInfo) {
        getStorageData("pagesOR").then((result) => {
          if (result && result.pagesOR) {
            setEndDate(result, res.tabInfo.id).then(() => {
              proceed();
            });
          } else {
            proceed();
          }
        });
      } else {
        proceed();
      }
    });
  }
  detectRules();
});
chrome.tabs.onRemoved.addListener((sessionId) => {
  if (tabIdCopy === sessionId) {
    console.log("onRemoved", sessionId);
    siteIsBlocked = false;
    tabPause = 0;
    trackerPause = false;
    getStorageData("pagesOR").then((res) => {
      if (res && res.pagesOR) {
        setEndDate(res, sessionId).then();
      }
    });
  }
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

// Redirect
const detectRules = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length) {
      checkForRedirection(tabs[0]);
      checkForPermission(tabs[0].url);
    }
  });
};

const checkForLimits = () => {
  const d = new Date();
  const midnight = d.setHours(24, 0, 0, 0);
  getStorageData("timeSpent").then((res) => {
    if (res.timeSpent) {
      let { list, date } = res.timeSpent;
      if (parseDate(new Date()) !== date) {
        console.log(true);
        generalLimit.current = 0;
        localLimit.current = 0;
        generalLimit.limit = -1;
        localLimit.limit = -1;
        Object.keys(list).forEach((item) => {
          list[item] = 0;
        });
        const timeSpent = {
          date: parseDate(new Date()),
          general: 0,
          list,
        };
        chrome.storage.local.set({ timeSpent }).then(() => {
          updateLimitData();
        });
      }
    }
  });
  const checkRules = (diff) => {
    if (diff === 500 && settings && settings.getNotification) {
      createNotification(settings.notification);
    }
    if (!diff) {
      createMessage({
        message: "limitsPage",
      });
      stopTracker();
    }
    if (diff < 300) {
      createMessage({
        time: diff,
        message: "popupTime",
      });
    }
  };
  if (localLimit.limit !== -1) {
    const diff = localLimit.limit - (localLimit.current + counter);
    checkRules(diff);

    if (!diff) {
      localLimit.limit = -1;
      return;
    }
    if (diff < 300) {
      return;
    }
  }
  if (generalLimit.limit !== -1) {
    const diff = generalLimit.limit - (generalLimit.current + counter);
    checkRules(diff);
    if (!diff) {
      generalLimit.limit = -1;
      return;
    }
    if (diff < 300) {
      return;
    }
  }
  createMessage({
    message: "clearPopup",
  });
};
const checkForRedirection = (tab) => {
  chrome.storage.local.get("redirect").then((res) => {
    if (res && res.redirect) {
      const site = res.redirect.find((value) => {
        return value.initial === tab.url;
      });
      if (site) {
        createNotification(
          `You have been redirected from ${site.initial} due to settings, please check on dashboard.`
        );
        chrome.tabs.update(tab.id, {
          url: site.redirect,
        });
      }
    }
  });
};

const checkForPermission = (tabUrl) => {
  chrome.storage.local.get("permission").then((res) => {
    if (res && res.permission) {
      const type = res.permission.type;
      if (type !== "off") {
        const list = res.permission.list[type];
        const keys = Object.keys(list);
        if (keys.length && tabUrl.includes("https://")) {
          const includes = keys.includes(new URL(tabUrl).hostname);
          if (includes) {
            if (type === "blacklist") {
              createMessage({
                message: "blockPage",
              });
              stopTracker();
              siteIsBlocked = true;
            }
          } else if (type === "whitelist") {
            createMessage({
              message: "blockPage",
            });
            stopTracker();
            siteIsBlocked = true;
          }
        }
      }
    }
  });
};

//this need for listening actions from content.js
chrome.runtime.onMessage.addListener((request, sender) => {
  const goToOptions = "goToOptions";
  const activity = "activity";
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
    case activity: {
      trackerPause = false;
      tabPause = 0;
      break;
    }
  }
});

getSettings();

chrome.management.onDisabled.addListener((info) => {
  console.log("chrome.management.onDisabled");
  createMessage({
    message: "clearPopup",
  });
});

const parseDate = (date) => {
  return date.toISOString().split("T")[0];
};
