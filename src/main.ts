import { createApp } from "vue";
import App from "./App.vue";
import Popup from "./PopupTemplate.vue";
import BlockPage from "./BlockPage.vue";
import "./scss/style.scss";

const appEl = document.querySelector("#app");
const popupEl = document.querySelector("#popup");
const blockPageEl = document.querySelector("#blockPage");

if (appEl && window.location.pathname === "/index.html") {
  createApp(App).mount(appEl);
} else if (popupEl && window.location.pathname === "/popup.html") {
  createApp(Popup).mount(popupEl);
} else if (blockPageEl && window.location.pathname === "/blockPage.html") {
  createApp(BlockPage).mount(blockPageEl);
}
