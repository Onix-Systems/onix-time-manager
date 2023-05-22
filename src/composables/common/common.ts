import { validUrlRegex } from "@/composables/common/dateComposable";

export const isValidUrl = (urlString: string) => {
  try {
    return Boolean(validUrlRegex.test(checkForSecure(urlString)));
  } catch (e) {
    return false;
  }
};

export const checkForSecure = (url: string) => {
  if (!url.includes("https://")) {
    return `https://${url}`;
  }
  return url;
};
