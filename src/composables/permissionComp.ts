import { PermissionList } from "@/constants/PermissionList";
import { computed, ref } from "vue";
import { PermissionInterface } from "@/types/PermissionInterface";

const defaultData = {
  type: PermissionList.off,
  list: {
    whitelist: {},
    blacklist: {},
  },
} as PermissionInterface;

export const permissionData = ref<PermissionInterface>({
  ...defaultData,
});

export const isOff = computed(() => {
  return permissionData.value.type === PermissionList.off;
});
export const isWhiteList = computed(() => {
  return permissionData.value.type === PermissionList.whitelist;
});
export const isBlackList = computed(() => {
  return permissionData.value.type === PermissionList.blacklist;
});

export const whiteList = computed(() => {
  return permissionData.value.list.whitelist;
});

export const blackList = computed(() => {
  return permissionData.value.list.blacklist;
});

export const findIndexByDomain = (domain: string, white = false) => {
  const list = white ? whiteList.value : blackList.value;
  return Object.keys(list).findIndex((f) => f === domain);
};

export const showEmptyTemplate = computed(() => {
  return (
    (isWhiteList.value && !Object.keys(whiteList.value).length) ||
    (isBlackList.value && !Object.keys(blackList.value).length)
  );
});

export const selectList = (key: PermissionList) => {
  permissionData.value.type = key;
  setPermission();
};

export const getPermission = () => {
  chrome.storage.local.get(["permission"], (result) => {
    if (!result.permission) {
      permissionData.value = { ...defaultData };
      setPermission();
    } else {
      permissionData.value = result.permission;
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
