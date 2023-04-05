const validUrlRegex = /^(http|https|www)/;
let isVisited = false;
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onActivated.addListener((tab) => {
    isVisited = true;
    updatePageTime(tab.tabId);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && validUrlRegex.test(tab.url)) {
      updatePageTime(tabId);
    }
  });
});

function updatePageTime(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (validUrlRegex.test(tab.url)) {
      const { url } = tab;

      const today = new Date().toLocaleDateString();

      const pageData = {
        url,
        timeSpent: 0,
        visited: 0,
        firstOpen: "",
        lastOpen: "",
        history: [],
      };
      const intervalId = setInterval(() => {
        chrome.storage.local.get({ pages: [] }, (result) => {
          let { pages } = result;

          const existingPage = pages.find(
            (p) => p.url === new URL(url).hostname
          );
          if (existingPage) {
            existingPage.timeSpent++;
            existingPage.lastOpen = today;
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
            pages.push(pageData);
          }

          chrome.storage.local.set({ pages }, () => {
            pages;
          });
        });
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
