import { ref } from "vue";
import { ModalTypes } from "@/types/modalTypes";

export const loaderKeys = ref<ModalTypes>({});
export const currentKey = ref();

export function startLoader(key: string) {
  currentKey.value = key;
  loaderKeys.value[currentKey.value] = true;
}

export function finishLoader(key: string) {
  currentKey.value = key;
  loaderKeys.value[currentKey.value] = false;
}

export function isLoader(key: string) {
  return loaderKeys.value[key];
}
