import { PermissionList } from "@/constants/PermissionList";
import { computed, ref } from "vue";
import { PermissionInterface } from "@/types/PermissionInterface";
import { UserData } from "@/composables/scheduleComp";
import { ScheduleInterface } from "@/types/dataInterfaces";
import { dayData } from "@/composables/common/dateComposable";

const defaultList = {
  schedule: {
    isAllDay: false,
    selectOption: "Today",
    weekly: [],
    daily: 1,
    date: `${String(dayData.value.month).padStart(2, "0")}.${String(
      dayData.value.day
    ).padStart(2, "0")}.${dayData.value.year}`,
    time: { from: "12 AM", to: "12 PM" },
  } as ScheduleInterface,
  list: {},
};
const defaultPermission = {
  permission: PermissionList.off,
  whitelist: {
    ...defaultList,
  },
  blacklist: {
    ...defaultList,
  },
};

export const permissionData = ref({
  ...defaultPermission,
} as PermissionInterface);

export const sitesList = (listKey: PermissionList) => {
  return permissionData.value[listKey].list;
};

export const isOff = computed(() => {
  return permissionData.value.permission === PermissionList.off;
});

export const isWhiteList = computed(() => {
  return permissionData.value.permission === PermissionList.whitelist;
});
export const isBlackList = computed(() => {
  return permissionData.value.permission === PermissionList.blacklist;
});

export const isLengthWhiteList = computed(() => {
  if (isWhiteList.value) {
    return Object.keys(sitesList(PermissionList.whitelist)).length;
  }
  return 0;
});

export const showEmptyTemplate = computed(() => {
  return (
    (isWhiteList.value && !isLengthWhiteList.value) ||
    (isBlackList.value && !isLengthBlackList.value)
  );
});
export const isLengthBlackList = computed(() => {
  if (isBlackList.value) {
    return Object.keys(sitesList(PermissionList.blacklist)).length;
  }
  return 0;
});

export const deleteItem = (key: string) => {
  if (isWhiteList.value) {
    delete permissionData.value[PermissionList.whitelist].list[key];
  }
  if (isBlackList.value) {
    delete permissionData.value[PermissionList.blacklist].list[key];
  }
  setPermission();
};

export const editItem = (key: string, newKey: string) => {
  if (isWhiteList.value) {
    const item = permissionData.value[PermissionList.whitelist].list[key];
    delete permissionData.value[PermissionList.whitelist].list[key];
    permissionData.value[PermissionList.whitelist].list[newKey] = item;
  }
  if (isBlackList.value) {
    const item = permissionData.value[PermissionList.blacklist].list[key];
    delete permissionData.value[PermissionList.blacklist].list[key];
    permissionData.value[PermissionList.blacklist].list[newKey] = item;
  }
  setPermission();
};

export const getPermission = () => {
  chrome.storage.local.get(["permission"], (result) => {
    if (!result.permission) {
      permissionData.value = { ...defaultPermission };
      setPermission();
    } else {
      permissionData.value = result.permission;
      resetUserData();
    }
  });
};

export const setPermission = () => {
  chrome.storage.local.set(
    {
      permission: permissionData.value,
    },
    () => {
      getPermission();
    }
  );
};

export const selectList = (key: PermissionList) => {
  permissionData.value.permission = key;
  setPermission();
};

export const editSitesInList = (key: string, data: object) => {
  permissionData.value[key].list = data;
  setPermission();
};

export const currentSchedule = computed(() => {
  if (isBlackList.value || isWhiteList.value) {
    return permissionData.value[permissionData.value.permission].schedule;
  }
  return {};
});

export const resetUserData = () => {
  if (isBlackList.value || isWhiteList.value) {
    UserData.value = {
      ...currentSchedule.value,
    };
  }
};

export const saveData = () => {
  permissionData.value[permissionData.value.permission].schedule =
    UserData.value;
  setPermission();
};

let lastPermission = "";
export const togglePermission = () => {
  const temp = permissionData.value.permission;
  if (lastPermission) {
    selectList(lastPermission as PermissionList);
  } else {
    if (permissionData.value.permission === "off") {
      selectList(PermissionList.whitelist);
    } else {
      selectList(PermissionList.off);
    }
  }
  lastPermission = temp;
};
