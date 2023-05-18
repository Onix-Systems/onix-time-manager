<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      .content--header
        .title Add a website
        button.close(@click="close")
      .content--body
        input.content--input(
          v-model="sitePermissionData",
          :class="{ error: hasError }"
        )
        .content--error(:class="{ show: hasError }")
          p(v-if="!errors.correct") Please check validity of initial url
          p(v-else) You already have this url in the list
      .content--buttons
        button.content--button.primary(@click="close") Cancel
        button.content--button.raised(
          :class="{ disabled: !sitePermissionData }",
          :disabled="!sitePermissionData",
          @click="save"
        ) Add
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted, ref } from "vue";

import MainModal from "@/modals/MainModal.vue";

import {
  blackList,
  isBlackList,
  permissionData,
  setPermission,
  whiteList,
} from "@/composables/permissionComp";
import { validUrlRegex } from "@/composables/common/dateComposable";
import { isValidUrl } from "@/composables/common/common";

const props = defineProps({
  editIndex: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["onClosed"]);

const isEdit = computed(() => {
  return !!props.editIndex;
});

const sitePermissionData = ref("");

const errors = ref({
  correct: true,
  unique: true,
});

const hasError = computed(() => {
  return !errors.value.correct || !errors.value.unique;
});
onMounted(() => {
  sitePermissionData.value = props.editIndex;
});

const isUniqueUrl = (urlString: string) => {
  try {
    const list = isBlackList.value ? blackList.value : whiteList.value;
    return Object.keys(list).every(
      (item) => item !== new URL(urlString).hostname
    );
  } catch (e) {
    return false;
  }
};
const close = () => {
  emit("onClosed");
  sitePermissionData.value = "";
};
const save = () => {
  errors.value.correct = isValidUrl(sitePermissionData.value);
  errors.value.unique = isUniqueUrl(sitePermissionData.value);
  if (sitePermissionData.value && errors.value.correct && errors.value.unique) {
    const listKey = permissionData.value.type as "whitelist" | "blacklist";
    if (isEdit.value) {
      delete permissionData.value.list[listKey][props.editIndex];
    }
    permissionData.value.list[listKey] = Object.assign(
      permissionData.value.list[listKey],
      {
        [new URL(sitePermissionData.value).hostname]: `https://${
          new URL(sitePermissionData.value).hostname
        }/`,
      }
    );
    setPermission();
    close();
  }
};
</script>

<style scoped lang="scss">
@import "@/scss/common/modal.scss";

.content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  width: 654px;
}
</style>
