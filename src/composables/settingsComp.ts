import { ref } from "vue";

export const showContent = ref(false);

const initialData: any = {
  password: false,
  code: "",
  permission: true,
  getNotification: false,
  notification:
    "The limit time of using this site is ending. If you want to change the limit time, change it on the setting page",
};

export const bytesInUse = ref("");
export const showSetPassword = ref(false);

export const editShowSetPassword = (reset = false) => {
  if (!settingsData.value.password || reset) {
    showSetPassword.value = !showSetPassword.value;
  } else {
    updateSettings("password", false);
    updateSettings("code", "");
    setSettings();
  }
};

export const getBytes = () => {
  chrome.storage.local.getBytesInUse(null, (size) => {
    bytesInUse.value = (size / 1024).toFixed(2);
  });
};
export const settingsData = ref({ ...initialData });

export const updateSettings = (name: string, status: any) => {
  settingsData.value[name] = status;
  setSettings();
};

export const setSettings = () => {
  chrome.storage.local.set(
    {
      settings: settingsData.value,
    },
    () => {
      updateSettingsData();
    }
  );
};

export const updateSettingsData = () => {
  chrome.storage.local.get(["settings"], (result) => {
    if (result.settings) {
      settingsData.value = result.settings;
    } else {
      setSettings();
    }
  });
};
