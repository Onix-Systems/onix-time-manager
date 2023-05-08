import { ref } from "vue";
import { PopupNavItemsEnum } from "@/constants/popup/popupNavItemsEnum";

//data

export const popupNavigations = Object.values(PopupNavItemsEnum);
export const popupNavigationSelected = ref(
  PopupNavItemsEnum.tracker as PopupNavItemsEnum
);

//functions

export const openOptions = () => {
  return chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
};

export const selectNavItem = (item: PopupNavItemsEnum) => {
  popupNavigationSelected.value = item;
};
