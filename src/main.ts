import { createApp } from "vue";
import Dashboard from "./DashboardLayout.vue";
import Popup from "./PopupTemplate.vue";
import "./scss/style.scss";

const appEl = document.querySelector("#app");
const popupEl = document.querySelector("#popup");

if (appEl && window.location.pathname === "/index.html") {
  createApp(Dashboard).mount(appEl);
} else if (popupEl && window.location.pathname === "/popup.html") {
  createApp(Popup).mount(popupEl);
}
