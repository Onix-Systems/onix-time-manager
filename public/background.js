const validUrlRegex = /^(http|https):\/\//i; // Modified regular expression to properly match URLs
let isVisited = false;
let intervalId = 0;
let showNotification = false;

let settings = [];

const activeTabListener = () => {
  chrome.tabs.onActivated.addListener((tab) => {
    isVisited = true;
    const tabId = tab.tabId;
    updatePageTime(tabId);
    detectRedirect();
  });
};
chrome.runtime.onInstalled.addListener(() => {
  activeTabListener();
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && validUrlRegex.test(tab.url)) {
      updatePageTime(tabId);
      detectRedirect();
    }
  });
});
const createNotification = (message = "") => {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "favicon.ico",
      title: "Onix Time Manager",
      message: message,
    },
    () => {
      showNotification = false;
    }
  );
};

const popupTime = (timeMess) => {
  return chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    (tabs) => {
      if (tabs && tabs.length) {
        chrome.tabs.sendMessage(tabs[0].id, {
          time: timeMess,
          message: "popupTime",
        });
      }
    }
  );
};

const updatePageTime = (tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    chrome.storage.local.get(["settings"], (result) => {
      settings = result.settings;

      if (validUrlRegex.test(tab.url)) {
        const currentDate = new Date();
        const yearIndex = currentDate.getFullYear().toString();
        const monthIndex = (currentDate.getMonth() + 1).toString(); // add 1 to the month because it's zero-indexed
        const dayIndex = currentDate.getDate().toString();
        const timeIndex = currentDate.getHours().toString();
        const todayInString = `${dayIndex.padStart(
          2,
          "0"
        )}.${monthIndex.padStart(2, "0")}.${yearIndex}`;
        const convertedDate = `${monthIndex.padStart(
          2,
          "0"
        )}.${dayIndex.padStart(2, "0")}.${yearIndex}`;

        showNotification = true;
        const { url } = tab;
        const currentUrl = new URL(url).hostname;
        const currentUrls = new URL(url).pathname;
        let limitsSites = {};
        let permissionData = { permission: "" };

        chrome.storage.local.get(["limits"], (result) => {
          if (result && result.limits) {
            limitsSites = result.limits;
          }
        });

        chrome.storage.local.get(["permission"], (result) => {
          if (result && result.permission && Object.keys(result.permission)) {
            permissionData = result.permission;
          } else {
            permissionData = {};
          }
        });

        const isValidTodayDaily = (date, daily) => {
          const startDate = new Date(date);
          const currentDate = new Date(convertedDate);
          const timeDiff = currentDate.getTime() - startDate.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);
          return daysDiff === daily;
        };

        const isValidTodayNameOfDayInWeek = (schedule) => {
          const weekly = Object.values(schedule.weekly);
          if (weekly.length) {
            const daysOfWeek = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ];
            const dayOfWeekIndex = (currentDate.getDay() + 6) % 7;
            return weekly.includes(daysOfWeek[dayOfWeekIndex]);
          }
          return 0;
        };

        const today = "Today";
        const everyDay = "Every Day";
        const daily = "Daily";
        const weekly = "Weekly";

        const checkLimits = () => {
          const limitsPage = () => {
            chrome.tabs.query(
              { active: true, lastFocusedWindow: true },
              (tabs) => {
                if (tabs && tabs.length) {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    message: "limitsPage",
                  });
                  clearInterval(intervalId);
                  updateCurrentSession();
                }
              }
            );
          };

          let blockAfter = 0;
          let siteTimeLimit = 0;
          if (limitsSites && limitsSites.browserLimit && limitsSites.schedule) {
            if (
              new Date(limitsSites.browserTimeSpent.date) <
              new Date(convertedDate)
            ) {
              limitsSites.browserTimeSpent.date = convertedDate;
              limitsSites.browserTimeSpent.time = 0;
            }
            const schedule = limitsSites.schedule;
            const timeLimit = timeToSeconds(schedule.timeLimits);
            const usedTime = limitsSites.browserTimeSpent.time;
            blockAfter = timeLimit - usedTime;
            limitsSites.browserTimeSpent.time += 1;
            chrome.storage.local.set({ limits: limitsSites }).then();
            const limitCondition = () => {
              if (!schedule.isAllDay && timeLimit < usedTime) {
                limitsPage();
              }
            };

            if (
              !limitsSites.listLimit &&
              blockAfter > siteTimeLimit &&
              blockAfter > 0 &&
              blockAfter !== -Math.abs(blockAfter)
            ) {
              popupTime(blockAfter);
            }

            chrome.runtime.sendMessage({
              time: blockAfter,
              message: "browserTimeSpent",
            });

            switch (schedule.selectOption) {
              case today: {
                if (schedule.date === convertedDate) {
                  limitCondition();
                }
                break;
              }
              case everyDay: {
                limitCondition();
                break;
              }
              case daily: {
                if (isValidTodayDaily(schedule.date, schedule.daily)) {
                  limitCondition();
                }
                break;
              }
              case weekly: {
                if (isValidTodayNameOfDayInWeek(schedule)) {
                  limitCondition();
                }
                break;
              }
            }
          }
          if (
            limitsSites &&
            limitsSites.list &&
            limitsSites.listLimit &&
            Object.keys(limitsSites.list).length
          ) {
            const isBlock = limitsSites.list[`https://${currentUrl}/`];
            if (isBlock) {
              const timeObject = {
                hour: isBlock.hours,
                minute: isBlock.minutes,
                second: isBlock.seconds,
              };
              let timeInSeconds = timeToSeconds(timeObject);
              siteTimeLimit = timeInSeconds;
              if (
                !limitsSites.browserLimit &&
                siteTimeLimit > blockAfter &&
                siteTimeLimit > 0 &&
                siteTimeLimit !== -Math.abs(siteTimeLimit)
              ) {
                popupTime(siteTimeLimit);
              }
              chrome.runtime.sendMessage({
                siteUrl: currentUrl,
                time: timeInSeconds,
                message: "siteTimeSpent",
              });
              if (timeInSeconds) {
                timeInSeconds -= 1;
                Object.assign(isBlock, getTimeFromSeconds(timeInSeconds));
                chrome.storage.local.set({ limits: limitsSites }).then();
                if (
                  showNotification &&
                  timeInSeconds < timeToSeconds(settings.limitsMassageTime) &&
                  settings &&
                  settings.getNotification
                ) {
                  createNotification(settings.notification);
                }
              } else {
                limitsPage();
              }
            }
          }

          if (
            limitsSites &&
            limitsSites.list &&
            limitsSites.listLimit &&
            limitsSites.browserLimit &&
            limitsSites.schedule &&
            Object.keys(limitsSites.list).length
          ) {
            if (
              siteTimeLimit < blockAfter &&
              siteTimeLimit > 0 &&
              siteTimeLimit !== -Math.abs(siteTimeLimit) &&
              blockAfter > 0 &&
              blockAfter !== -Math.abs(blockAfter)
            ) {
              popupTime(siteTimeLimit);
            } else {
              popupTime(blockAfter);
            }
          }
        };
        const checkBlocker = () => {
          const permissionStatus = permissionData.permission;
          const isValidStatus = () => {
            return (
              permissionStatus === "whitelist" ||
              permissionStatus === "blacklist"
            );
          };
          if (isValidStatus()) {
            const list = Object.values(
              permissionData[permissionStatus].list
            ).map((item) => item);
            const isValidData = list.length;
            const schedule = permissionData[permissionStatus].schedule;
            const isFound = isValidData
              ? list.find((site) => tab.url.includes(site))
              : false;

            const blockPage = () => {
              chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                (tabs) => {
                  if (tabs && tabs.length) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                      message: "blockPage",
                    });
                    clearInterval(intervalId);
                    updateCurrentSession();
                  }
                }
              );
            };
            const timeAmTo24 = (item) => {
              const [hourString, period] = item.split(" ");
              let hour = parseInt(hourString);
              if (period === "PM" && hour !== 12) {
                hour += 12;
              } else if (period === "AM" && hour === 12) {
                hour = 0;
              }
              return hour;
            };
            switch (schedule.selectOption) {
              case today: {
                if (
                  permissionStatus === "blacklist" &&
                  isValidData &&
                  isFound
                ) {
                  if (schedule.date === convertedDate) {
                    if (schedule.isAllDay) {
                      blockPage();
                    } else if (
                      timeIndex >= timeAmTo24(schedule.time.from) &&
                      timeIndex < timeAmTo24(schedule.time.to)
                    ) {
                      blockPage();
                    }
                  }
                }
                if (permissionStatus === "whitelist") {
                  if (schedule.date === convertedDate) {
                    if (isFound) {
                      if (!schedule.isAllDay) {
                        if (
                          timeIndex <= timeAmTo24(schedule.time.from) ||
                          timeIndex >= timeAmTo24(schedule.time.to)
                        ) {
                          blockPage();
                        }
                      }
                    } else {
                      blockPage();
                    }
                  }
                }
                break;
              }
              case everyDay: {
                if (
                  permissionStatus === "blacklist" &&
                  isValidData &&
                  isFound
                ) {
                  if (schedule.isAllDay) {
                    blockPage();
                  } else {
                    if (
                      timeIndex >= timeAmTo24(schedule.time.from) &&
                      timeIndex < timeAmTo24(schedule.time.to)
                    ) {
                      blockPage();
                    }
                  }
                }
                if (permissionStatus === "whitelist") {
                  if (isFound) {
                    if (!schedule.isAllDay) {
                      if (
                        timeIndex <= timeAmTo24(schedule.time.from) ||
                        timeIndex >= timeAmTo24(schedule.time.to)
                      ) {
                        blockPage();
                      }
                    }
                  } else {
                    blockPage();
                  }
                }
                break;
              }
              case daily: {
                if (
                  permissionStatus === "blacklist" &&
                  isValidData &&
                  isFound
                ) {
                  if (isValidTodayDaily(schedule.date, schedule.daily)) {
                    if (schedule.isAllDay) {
                      blockPage();
                    } else {
                      if (
                        timeIndex >= timeAmTo24(schedule.time.from) &&
                        timeIndex < timeAmTo24(schedule.time.to)
                      ) {
                        blockPage();
                      }
                    }
                  }
                }
                if (permissionStatus === "whitelist") {
                  if (isValidTodayDaily(schedule.date, schedule.daily)) {
                    if (isFound) {
                      if (!schedule.isAllDay) {
                        if (
                          timeIndex <= timeAmTo24(schedule.time.from) ||
                          timeIndex >= timeAmTo24(schedule.time.to)
                        ) {
                          blockPage();
                        }
                      }
                    } else {
                      blockPage();
                    }
                  }
                }
                break;
              }
              case weekly: {
                if (
                  permissionStatus === "blacklist" &&
                  isValidData &&
                  isFound
                ) {
                  if (isValidTodayNameOfDayInWeek(schedule)) {
                    if (schedule.isAllDay) {
                      blockPage();
                    } else {
                      if (
                        timeIndex >= timeAmTo24(schedule.time.from) &&
                        timeIndex < timeAmTo24(schedule.time.to)
                      ) {
                        blockPage();
                      }
                    }
                  }
                }
                if (permissionStatus === "whitelist") {
                  if (isValidTodayNameOfDayInWeek(schedule)) {
                    if (isFound) {
                      if (!schedule.isAllDay) {
                        if (
                          timeIndex <= timeAmTo24(schedule.time.from) ||
                          timeIndex >= timeAmTo24(schedule.time.to)
                        ) {
                          blockPage();
                        }
                      }
                    } else {
                      blockPage();
                    }
                  }
                }
                break;
              }
            }
          }
        };
        checkBlocker();
        checkLimits();
        let currentInformation = {};
        const createUpdateSite = () => {
          chrome.storage.local.get({ pages: {} }, (result) => {
            let { pages } = result;
            const findYear = pages[yearIndex];
            if (!findYear) {
              pages[yearIndex] = {};
            }

            const findMonth = pages[yearIndex][monthIndex];
            if (!findMonth) {
              pages[yearIndex][monthIndex] = {};
            }

            const findDay = pages[yearIndex][monthIndex][dayIndex];
            if (!findDay) {
              pages[yearIndex][monthIndex][dayIndex] = {};
            }
            let findSite = pages[yearIndex][monthIndex][dayIndex][currentUrl];
            if (!findSite) {
              pages[yearIndex][monthIndex][dayIndex][currentUrl] = {
                domain: currentUrl,
                visited: 1,
                icon: tab.favIconUrl,
                dayActivity: {},
                timeSpent: 1,
                sessions: [],
                currentSession: 1,
                firstVisit: todayInString,
                lastVisit: todayInString,
                urls: {
                  [currentUrls]: {
                    firstVisit: todayInString,
                    timeSpent: 1,
                  },
                },
              };
              pages[yearIndex][monthIndex][dayIndex][currentUrl]["dayActivity"][
                timeIndex
              ] = {
                timeSpent: 1,
                visited: 1,
              };
              isVisited = false;
            } else {
              const site = pages[yearIndex][monthIndex][dayIndex][currentUrl];
              if (typeof site.sessions === "object") {
                site.sessions = Object.values(site.sessions).map(
                  (item) => item
                );
              }
              site.icon = tab.favIconUrl;
              site.timeSpent += 1;
              site.currentSession += 1;
              site.lastVisit = todayInString;
              chrome.runtime.sendMessage({
                siteUrl: site.domain,
                time: site.currentSession,
                message: "currentSession",
              });
              const addCurrentTime = () => {
                site["dayActivity"][timeIndex].timeSpent += 1;
                if (isVisited) {
                  site.visited += 1;
                  site["dayActivity"][timeIndex].visited += 1;
                  isVisited = false;
                }
              };
              if (site.urls[currentUrls]) {
                site.urls[currentUrls].timeSpent += 1;
              } else {
                site.urls[currentUrls] = {
                  firstVisit: todayInString,
                  timeSpent: 1,
                };
              }
              if (site["dayActivity"][timeIndex]) {
                addCurrentTime();
              } else {
                site.visited += 1;
                site["dayActivity"][timeIndex] = {
                  timeSpent: 1,
                  visited: 1,
                };
                addCurrentTime();
              }
            }
            currentInformation = pages;

            chrome.storage.local.set({ pages }).then();
          });
        };

        intervalId = setInterval(() => {
          createUpdateSite();
          checkLimits();
          checkBlocker();
        }, 1000);

        const updateCurrentSession = () => {
          if (Object.keys(currentInformation).length) {
            let data =
              currentInformation[yearIndex][monthIndex][dayIndex][currentUrl];
            data.sessions.push(data.currentSession);
            data.currentSession = 0;
            chrome.storage.local.set({ pages: currentInformation }).then();
          }
        };

        chrome.tabs.onActivated.addListener((newTab) => {
          if (newTab.tabId !== tabId) {
            clearInterval(intervalId);
            updateCurrentSession();
          }
        });

        chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo) => {
          if (updatedTabId === tabId && changeInfo.status === "complete") {
            clearInterval(intervalId);
            updateCurrentSession();
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

function getTimeFromSeconds(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

// Redirect
const detectRedirect = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    chrome.storage.local.get("redirect").then((res) => {
      if (res && res.redirect) {
        const index = res.redirect.findIndex(
          (value) => new URL(value.initial).hostname === new URL(url).hostname
        );
        if (index > -1) {
          chrome.tabs.sendMessage(tabs[0].id, {
            initial: res.redirect[index].initial,
            url: res.redirect[index].redirect,
            message: "redirect",
          });
        }
      }
    });
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
