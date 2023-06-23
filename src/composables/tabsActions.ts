import { ref } from "vue";

import TrackingView from "@/views/TrackingView.vue";
import PermissionsView from "@/views/PermissionsView.vue";
import LimitsView from "@/views/LimitsView.vue";
import RedirectView from "@/views/RedirectView.vue";
import HistoryView from "@/views/HistoryView.vue";
import SettingsView from "@/views/SettingsView.vue";
import UsageView from "@/views/UsageView.vue";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";

export const dashboardTabs = {
  TrackingView,
  PermissionsView,
  LimitsView,
  RedirectView,
  HistoryView,
  SettingsView,
  UsageView,
};

export const dashboardTab = ref<MenuItemsEnum>(MenuItemsEnum.TrackingView);
