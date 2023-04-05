import { ref } from "vue";

export const activeTabIndex = ref(0);

export const editTabIndex = (index: number) => {
  activeTabIndex.value = index;
};
