import { createApp } from "vue";
import App from "./App.vue";
import Popup from "./PopupTemplate.vue";
import "./scss/style.scss";

const appEl = document.querySelector("#app");
const popupEl = document.querySelector("#popup");

if (appEl && window.location.pathname === "/index.html") {
  createApp(App).mount(appEl);
} else if (popupEl && window.location.pathname === "/popup.html") {
  createApp(Popup).mount(popupEl);
}
