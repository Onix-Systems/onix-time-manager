const validUrlRegex = /^(http|https|www)/;

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onActivated.addListener((tab) => {
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
      const startTime = Date.now();
      const { url, title } = tab;

      const intervalId = setInterval(() => {
        const endTime = Date.now();
        const timeSpentInSeconds = Math.round((endTime - startTime) / 1000);

        const pageData = { url, title, timeSpent: timeSpentInSeconds };

        chrome.storage.local.get({ pages: [] }, (result) => {
          let { pages } = result;

          const existingPage = pages.find((p) => p.url === url);
          if (existingPage) {
            existingPage.timeSpent++;
          } else {
            pages.push(pageData);
          }

          chrome.storage.local.set({ pages });
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
