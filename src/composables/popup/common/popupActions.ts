import { ref } from "vue";
import { PopupNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";
import { MenuItemsEnum } from "@/constants/menuItemsEnum";

//data

export const popupNavigations = Object.values(PopupNavItemsEnum);
export const popupNavigationSelected = ref(
  PopupNavItemsEnum.tracker as PopupNavItemsEnum
);

//functions

export const openOptions = (tab = MenuItemsEnum.Tracking) => {
  chrome.tabs
    .create({
      url: chrome.runtime.getURL("index.html#" + tab),
    })
    .then();
};

export const selectNavItem = (item: PopupNavItemsEnum) => {
  popupNavigationSelected.value = item;
};
