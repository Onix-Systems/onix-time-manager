import { ref } from "vue";
import { ModalTypes } from "@/types/modalTypes";

export const modalKeys = ref<ModalTypes>({});
export const currentKey = ref();

export function openModal(key: string) {
  currentKey.value = key;
  modalKeys.value[currentKey.value] = true;
}
export function closeModal(key: string) {
  currentKey.value = key;
  modalKeys.value[currentKey.value] = false;
}

export function isOpen(key: string) {
  return modalKeys.value[key];
}
