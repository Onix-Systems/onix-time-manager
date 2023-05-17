function formatTime(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time - hours * 3600) / 60);
  const seconds = time % 60;
  return `${minutes < 10 ? "0" + minutes : minutes}m ${
    seconds < 10 ? "0" + seconds : seconds
  }s`;
}

chrome.runtime.onMessage.addListener((request, sender) => {
  const redirect = "redirect";
  const blockPage = "blockPage";
  const limitsPage = "limitsPage";
  const popupTime = "popupTime";
  const browserTimeSpent = "browserTimeSpent";
  const activeTab = "activeTab";
  switch (request.message) {
    case browserTimeSpent: {
      chrome.runtime.sendMessage({
        time: request.time,
        message: "browserTimeSpent",
      });
      break;
    }
    case activeTab: {
      chrome.runtime.sendMessage({
        currentUrl: request.currentUrl,
        currentTab: request.currentTab,
        time: request.time,
        message: "activeTab",
      });
      break;
    }
    case redirect: {
      chrome.runtime.sendMessage({
        message: "redirected",
        initial: request.initial,
      });
      window.open(request.url, "_self");
      break;
    }
    case blockPage: {
      const urlHtml = chrome.runtime.getURL("./block-page/blockPage.html");
      const urlCss = chrome.runtime.getURL("./block-page/blockPage.css");

      Promise.all([fetch(urlHtml), fetch(urlCss)])
        .then((responses) =>
          Promise.all(responses.map((response) => response.text()))
        )
        .then(([html, css]) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const link1 = document.createElement("link");
          link1.rel = "preconnect";
          link1.href = "https://fonts.googleapis.com";

          const link2 = document.createElement("link");
          link2.rel = "preconnect";
          link2.href = "https://fonts.gstatic.com";
          link2.crossOrigin = "anonymous";

          const link3 = document.createElement("link");
          link3.href =
            "https://fonts.googleapis.com/css2?family=Nunito:wght@600&display=swap";
          link3.rel = "stylesheet";

          const style = document.createElement("style");
          style.textContent = css;
          document.head.appendChild(style);
          document.head.appendChild(link1);
          document.head.appendChild(link2);
          document.head.appendChild(link3);

          document.documentElement.replaceChild(doc.body, document.body);

          const optionsLink = document.getElementById("options-link");
          const contentText = document.querySelector(".content--text");
          const contentImage = document.querySelector(".content--image");
          const baseUrl = window.location.href.split("/").slice(0, 3).join("/");

          contentText.innerHTML = `You add <span>${baseUrl}</span> to a blacklist. It's probably there for a reason.`;

          const warningImage = document.createElement("img");
          warningImage.src = `https://s2.googleusercontent.com/s2/favicons?domain=${baseUrl}&sz=96`;
          warningImage.alt = "Warning";

          contentImage.appendChild(warningImage);

          optionsLink.href = chrome.runtime.getURL("index.html");
          optionsLink.addEventListener("click", (event) => {
            event.preventDefault();
            chrome.runtime.sendMessage({
              message: "goToOptions",
            });
          });
        });

      break;
    }
    case limitsPage: {
      const urlHtml = chrome.runtime.getURL("./limits-page/limitsPage.html");
      const urlCss = chrome.runtime.getURL("./block-page/blockPage.css");
      const urlImg = chrome.runtime.getURL("assets/warning-error.svg");

      Promise.all([fetch(urlHtml), fetch(urlCss)])
        .then((responses) =>
          Promise.all(responses.map((response) => response.text()))
        )
        .then(([html, css]) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const link1 = document.createElement("link");
          link1.rel = "preconnect";
          link1.href = "https://fonts.googleapis.com";

          const link2 = document.createElement("link");
          link2.rel = "preconnect";
          link2.href = "https://fonts.gstatic.com";
          link2.crossOrigin = "anonymous";

          const link3 = document.createElement("link");
          link3.href =
            "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
          link3.rel = "stylesheet";

          const style = document.createElement("style");
          style.textContent = css;
          document.head.appendChild(style);
          document.head.appendChild(link1);
          document.head.appendChild(link2);
          document.head.appendChild(link3);

          document.documentElement.replaceChild(doc.body, document.body);

          const optionsLink = document.getElementById("options-link");
          const contentText = document.querySelector(".content--text");
          const contentImage = document.querySelector(".content--image");
          const baseUrl = window.location.href.split("/").slice(0, 3).join("/");

          contentText.innerHTML = `The time limit for this site has expired. <span>${baseUrl}</span> is blocked`;

          const warningImage = document.createElement("img");
          warningImage.src = urlImg;
          warningImage.alt = "Warning";

          contentImage.appendChild(warningImage);

          optionsLink.href = chrome.runtime.getURL("index.html");
          optionsLink.addEventListener("click", (event) => {
            event.preventDefault();
            chrome.runtime.sendMessage({
              message: "goToOptions",
            });
          });
        });

      break;
    }
    case popupTime:
      {
        const elementsWithClass = document.querySelectorAll(".onix-tracker");

        if (request.time < 300) {
          if (!elementsWithClass.length) {
            const parent = document.createElement("div");
            parent.style.position = "relative";
            document.body.insertAdjacentElement("afterbegin", parent);
            parent.innerHTML = `
            <style>
              input[type="checkbox"] {
                position: fixed;
                right: 271px;
                bottom: 60px;
                -webkit-appearance: none;
                appearance: none;
                cursor: pointer;
                z-index: 99999;
    
                width: 32px;
                height: 32px;
                
                transition: right 0.8s;
              }
              input[type="checkbox"]:checked {
                right: 292px;
              }
              
              input[type="checkbox"]:not(:checked) {
                right: 11px;
              }

              input[type="checkbox"]:checked + .onix-tracker {
                right: 0;
              }
              
              input[type="checkbox"]:checked + .onix-tracker .arrow svg {
                transform: rotate(180deg);
              }
              
              .arrow {
                position: absolute;
                top: 33px;
                left: -16px;
                display: flex;
                justify-content: center;
                align-items: center;
                                
                width: 32px;
                height: 32px;
                
                background: #EBF0FE;
                box-shadow: 0 1px 4px rgba(56, 106, 241, 0.25);
                border-radius: 4px;
              }
              
              .arrow svg {
                width: 7px;
                height: 15px;
                
                transition-duration: 0.8s;
              }
              
              .onix-tracker {
                position: fixed;
                right: -281px;
                bottom: 31px;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                justify-content: center;
                z-index: 99998;
              
                padding: 18px 30px;
                
                background: #FFFFFF;
                border-width: 1px 0 1px 1px;
                border-style: solid;
                border-color: #EBF0FE;
                box-shadow: 0 4px 4px rgba(56, 106, 241, 0.1);
                border-radius: 8px 0 0 8px;

                transition: right 0.8s ease 0s;
              }
              
              h2 {
                font-family: Inter, sans-serif;
                font-size: 18px;
                font-weight: 500; 
                line-height: 22px;
                text-align: center;
                
                color: #0A0C2C; 
              }
              p {
                padding-top: 6px;
                
                font-family: Inter, sans-serif;
                font-size: 24px;
                font-weight: 600;
                line-height: 29px;
                text-align: center;
    
                color: #386AF1;
              }
            </style>
            <input type="checkbox" name="checkbox-checked" checked />
            <div class="onix-tracker">
              <div class="arrow">
                <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 11L1 6L5 0.999999" stroke="#386AF1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h2>The site will be blocked after</h2>
              <p>${formatTime(request.time)}</p>
            </div>  
            `;
            const pElement = document.createElement("link");
            pElement.href =
              "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
            pElement.rel = "stylesheet";
          } else {
            elementsWithClass.forEach((element) => {
              const pElement = element.querySelector("p");
              if (pElement) {
                pElement.textContent = formatTime(request.time);
              }
            });
          }
        } else {
          elementsWithClass.forEach((element) => {
            element.style.display = "none";
          });
        }
      }
      break;
  }
});
