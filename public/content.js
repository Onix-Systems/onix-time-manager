const baseUrl = window.location.href.split("/").slice(0, 3).join("/");

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
  const stopTracking = "stopTracking";
  switch (request.message) {
    case stopTracking: {
      chrome.runtime.sendMessage({
        message: "stopTracking",
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
      const title = `Not this time...`;
      const subtitle = `The <span>${baseUrl}</span> is on the blacklist. Get it out of there if you want to get on it.`;
      const to = "Permissions";
      pageTemplate(title, subtitle, to);
      break;
    }
    case limitsPage: {
      const title = `Oh no...`;
      const subtitle = `The time limit for this site has expired.</br> <span>${baseUrl}</span> is blocked`;
      const to = "Limits";
      pageTemplate(title, subtitle, to);
      break;
    }
    case popupTime:
      {
        const elementsWithClass = document.querySelectorAll(".limit-warning");
        if (request.time < 300) {
          if (!elementsWithClass.length) {
            const parent = document.createElement("div");
            parent.style.position = "relative";
            document.body.insertAdjacentElement("afterbegin", parent);
            parent.innerHTML = `
            ${popupStyles()}
            <div class="limit-warning">
              <input class="limit-warning--checkbox" type="checkbox" name="checkbox-checked" checked />
              <div class="limit-warning--section">
                <div class="limit-warning--arrow">
                  <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 11L1 6L5 0.999999" stroke="#386AF1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="limit-warning--overflow">
                  <h2 class="limit-warning--title">The site will be blocked after</h2>
                  <p class="limit-warning--time">${formatTime(request.time)}</p>
                </div>
              </div>  
            </div>
            `;
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

const pageTemplate = (title, subtitle, to) => {
  const urlHtml = chrome.runtime.getURL("./block-page/blockPage.html");
  const urlCss = chrome.runtime.getURL("./block-page/blockPage.css");

  Promise.all([fetch(urlHtml), fetch(urlCss)])
    .then((responses) =>
      Promise.all(responses.map((response) => response.text()))
    )
    .then(([html, css]) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      addCustomFonts();

      document.documentElement.replaceChild(doc.body, document.body);

      const optionsLink = document.getElementById("options-link");
      const contentTitle = document.querySelector(".content--title");
      const contentText = document.querySelector(".content--text");
      const contentImage = document.querySelector(".content--image");
      const contentRedirect = document.querySelector(".content--redirect");

      contentTitle.innerHTML = title;
      contentText.innerHTML = subtitle;
      contentRedirect.innerHTML = "View setting";

      const warningImage = document.createElement("img");
      warningImage.src = `https://s2.googleusercontent.com/s2/favicons?domain=${baseUrl}&sz=96`;
      warningImage.alt = "Warning";

      contentImage.appendChild(warningImage);

      optionsLink.href = chrome.runtime.getURL("index.html");
      optionsLink.addEventListener("click", (event) => {
        event.preventDefault();
        chrome.runtime
          .sendMessage({
            to,
            message: "goToOptions",
          })
          .then();
      });
    });
};

const addCustomFonts = () => {
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

  document.head.appendChild(link1);
  document.head.appendChild(link2);
  document.head.appendChild(link3);
};

const popupStyles = () => {
  return `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600&display=swap');
    
    .limit-warning {
      position: fixed;
      right: 40px;
      bottom: 16px;
      z-index: 99999;
    }
  
    input[type="checkbox"].limit-warning--checkbox {
      position: absolute;
      right: -25px;
      top: 0;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      z-index: 1;
      opacity: 0;
      
      width: 50px;
      height: 50px;
      
      transition: right 0.8s;
    }
    
    input[type="checkbox"].limit-warning--checkbox:checked {
      top: 29px;
    }
    
    input[type="checkbox"].limit-warning--checkbox:not(:checked) + .limit-warning--section{
      width: 50px;
      height: 50px;
      padding: 0 0 0 50px;
      
      background: transparent;
      border: transparent;
    }
    
    input[type="checkbox"].limit-warning--checkbox:not(:checked) + .limit-warning--section .limit-warning--arrow{
      top: 0;
    }
    
    input[type="checkbox"].limit-warning--checkbox:checked + .limit-warning--section{
      right: 0;
    }
    
    input[type="checkbox"].limit-warning--checkbox:checked + .limit-warning--section .limit-warning--arrow svg{
      transform: rotate(180deg);
    }
    
    .limit-warning--arrow {
      position: absolute;
      top: 29px;
      right: -25px;
      display: flex;
      justify-content: center;
      align-items: center;
                      
      min-width: 50px;
      min-height: 50px;
      
      background: #EBF0FE;
      border-radius: 25px;
      transition: top 0.8s;
    }
    
    .limit-warning--arrow svg {
      width: 9px;
      height: 17px;
      
      fill: transparent;
      transform: rotate(0deg);
      transition-duration: 0.8s;
    }
    
    .limit-warning--overflow {
      overflow: hidden;
    }
    
    .limit-warning--section {
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      justify-content: center;
      
      width: 340px;
      height: 108px;
      padding: 24px 46px;
      
      background: #FFFFFF;
      border: 1px solid #EBF0FE;
      border-radius: 8px;
      transition: all 0.8s ease 0s;
    }
    
    .limit-warning--title {
      margin: 0;
      padding: 0;
      
      font-family: 'Nunito';
      font-style: normal;
      font-weight: 600;
      font-size: 18px;
      line-height: 25px;
      white-space: nowrap;
      color: #0A0C2C; 
    }
    
    .limit-warning--time {
      margin: 0;
      padding: 0;
      
      font-family: 'Nunito';
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 33px;
      text-align: center;
      white-space: nowrap;
      
      color: #386AF1;
    }
  </style>
  `;
};
