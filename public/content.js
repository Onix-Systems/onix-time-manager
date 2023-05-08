chrome.runtime.onMessage.addListener((request, sender) => {
  const redirect = "redirect";
  const blockPage = "blockPage";
  const limitsPage = "limitsPage";
  const popupTime = "popupTime";
  switch (request.message) {
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

          contentText.innerHTML = `You add <span>${baseUrl}</span> to a blacklist. It's probably there for a reason.`;

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
    case popupTime: {
      const elementsWithClass = document.querySelectorAll(".onix-tracker");
      if (!elementsWithClass.length) {
        const parent = document.createElement("div");
        parent.style.position = "relative";
        document.body.insertAdjacentElement("afterbegin", parent);

        const modals = document.createElement("div");
        modals.classList.add("onix-tracker");
        parent.appendChild(modals);
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "./block-page/timeModal.css";
        document.head.appendChild(link);

        modals.innerHTML = `
      <style>
      .card .percent {
        position: relative;
      }
      
      .card svg {
        position: relative;
        width: 65px;
        height: 65px;
        transform: rotate(-90deg);
        margin-left: 42px;

      }
      
      .card svg circle {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: #f0f0f0;
        stroke-width: 5;
        stroke-linecap: round;
      }
      
      .card svg circle:last-of-type {
        stroke-dasharray: 204.2px;
        stroke-dashoffset: calc(204.2px - (204.2px * var(--percent)) / 100);
        stroke: #3498db;
      }
      
      .card .number {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 20px;
      }
      
      </style>
  <h2 style="color: #0A0C2C; font-size: 10px; line-height: 12px; margin-top: 12px; text-align: center;">The site will be block after </h2>
  <div class="card">
    <div class="percent">
      <svg width="65" height="65">
        <circle cx="32.5" cy="32.5" r="30"></circle>
        <circle cx="32.5" cy="32.5" r="30" style="--percent: 70"></circle>
      </svg>
      
    </div>
  </div>
`;
        modals.style.display = "block";
        modals.style.position = "absolute";
        modals.style.background = "#FFFFFF";
        modals.style.border = "1px solid #EBF0FE";
        modals.style.width = "150px";
        modals.style.height = "118px";
        modals.style.right = "0";
        modals.style.top = "0";
        modals.style.zIndex = "10000";
        modals.style.borderRadius = "4px";

        const p = document.createElement("p");
        p.style.fontSize = "10px";
        p.style.lineHeight = "12px";
        p.style.color = "#386AF1";
        p.innerHTML = request.time;
        modals.appendChild(p);
      } else {
        elementsWithClass.forEach((element) => {
          const pElement = element.querySelector("p");
          if (pElement) {
            pElement.textContent = request.time;
          }
        });
      }
      break;
    }
  }
});
