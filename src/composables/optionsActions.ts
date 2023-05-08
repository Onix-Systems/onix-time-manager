import { reactive, ref } from "vue";

export const activeTabIndex = ref("");
export const isActive = ref(false);

export const editTabIndex = (index: string) => {
  activeTabIndex.value = index;
};

export const openModal = () => {
  return (isActive.value = !isActive.value);
};
export const defineTime = {
  hours: null,
  minutes: null,
  seconds: null,
};
export const modalTime: any = reactive({ ...defineTime });

export const resetModalTime = () => {
  return Object.assign(modalTime, defineTime);
};

export const editTime = (name: string, number: number) => {
  modalTime[name] = number;
};

export const timeToSeconds = (timeStr: any) => {
  const { hours, minutes, seconds } = timeStr;
  const hour = parseInt(hours ? hours : 0);
  const minute = parseInt(minutes ? minutes : 0);
  const second = parseInt(seconds ? seconds : 0);

  return hour * 3600 + minute * 60 + second;
};
