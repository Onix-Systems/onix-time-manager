import { ref } from "vue";
import { PopupNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";

//data

export const popupNavigations = Object.values(PopupNavItemsEnum);
export const popupNavigationSelected = ref(
  PopupNavItemsEnum.tracker as PopupNavItemsEnum
);

//functions

export const openOptions = (tab = MenuItemsEnum.Tracking, target = false) => {
  const url = chrome.runtime.getURL("index.html#" + tab);
  if (target) {
    chrome.tabs.update({ url }).then();
  } else {
    chrome.tabs.create({ url }).then();
  }
};

export const selectNavItem = (item: PopupNavItemsEnum) => {
  popupNavigationSelected.value = item;
};
