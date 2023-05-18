<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      .content--header
        .title {{ isEdit ? "Edit" : "Set up" }} a redirect
        button.close(@click="close")
      .content--body
        input.content--input(
          type="text",
          placeholder="Enter the website address",
          @input="errors.initial = true",
          :class="{ error: !errors.initial || !errors.initialSame }",
          v-model="urlGroup.initial"
        )
        .content--error(
          :class="{ show: !errors.initial || !errors.initialSame }"
        )
          p {{ !errors.initial ? "Please check validity of initial url" : "You already have this url in the list" }}
        input.content--input(
          type="text",
          placeholder="Enter the website for redirect",
          @input="errors.redirect = true",
          :class="{ error: !errors.redirect }",
          v-model="urlGroup.redirect"
        )
        .content--error(:class="{ show: !errors.redirect }")
          p Please check validity of redirect url
      .content--buttons
        button.content--button.primary(@click="close") Cancel
        button.content--button.raised(
          :class="{ disabled: !urlGroup.initial }",
          @click="submit",
          :disabled="!urlGroup.initial"
        ) Set
</template>

<script setup lang="ts">
import {
  defineEmits,
  onMounted,
  defineProps,
  ref,
  reactive,
  computed,
} from "vue";
import MainModal from "@/modals/MainModal.vue";
import { validUrlRegex } from "@/composables/common/dateComposable";
import { checkForSecure, isValidUrl } from "@/composables/common/common";

const props = defineProps({
  initialData: {
    default: {
      initial: "",
      redirect: "",
    },
  },
  editIndex: {
    type: Number,
    default: -1,
  },
});
const emit = defineEmits(["onClosed"]);
const close = () => {
  emit("onClosed");
};

const isEdit = computed(() => {
  return props.editIndex !== -1;
});

const errors = reactive({
  initial: true,
  redirect: true,
  initialSame: true,
});

const urlGroup = ref({
  initial: "",
  redirect: "",
});

const submit = () => {
  errors.initial = isValidUrl(urlGroup.value.initial);
  errors.redirect = isValidUrl(urlGroup.value.redirect);

  if (errors.initial && errors.redirect) {
    chrome.storage.local.get("redirect").then((res) => {
      if (props.initialData.initial !== urlGroup.value.initial) {
        urlGroup.value.initial = checkForSecure(urlGroup.value.initial);
        errors.initialSame = !res.redirect.some(
          (element: { initial: string; redirect: string }) =>
            new URL(element.initial).hostname ===
            new URL(urlGroup.value.initial).hostname
        );
      }
      if (errors.initialSame) {
        const array = res.redirect;
        urlGroup.value.redirect = checkForSecure(urlGroup.value.redirect);
        if (!isEdit.value) {
          array.push(urlGroup.value);
          chrome.storage.local.set({ redirect: array }).then(() => {
            close();
          });
        } else {
          array[props.editIndex] = urlGroup.value;
          chrome.storage.local.set({ redirect: [...array] }).then(() => {
            close();
          });
        }
      }
    });
  }
};

onMounted(() => {
  urlGroup.value = { ...props.initialData };
});
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
