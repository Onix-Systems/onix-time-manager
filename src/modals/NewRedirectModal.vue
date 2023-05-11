<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      .content--header
        .title {{ props.isEdit ? "Edit" : "Set up" }} a redirect
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
import { defineEmits, onMounted, defineProps, ref, reactive } from "vue";
import MainModal from "@/modals/MainModal.vue";

const props = defineProps({
  initialData: {
    default: {
      initial: "",
      redirect: "",
    },
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  editIndex: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(["onClosed"]);
const close = () => {
  emit("onClosed");
};

const checkForSecure = (url: string) => {
  if (!url.includes("https://")) {
    return `https://${url}`;
  }
  return url;
};
const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(checkForSecure(urlString)));
  } catch (e) {
    return false;
  }
};

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
        if (!props.isEdit) {
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

  &--body {
    display: flex;
    flex-direction: column;
    width: 100%;

    .content--input {
      box-sizing: border-box;
      width: 100%;
      height: 40px;

      padding: 12px 16px;

      border: 1px solid #ebecee;
      border-radius: 6px;

      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 15px;
      color: var(--txt-main-darkblue);

      &::placeholder {
        color: var(--txt-light-grey);
      }
      &.error {
        border: 1px solid var(--error);
      }
    }
    &.delete {
      justify-content: center;
      align-items: center;
      gap: 8px;

      margin-bottom: 48px;

      .title {
        font-style: normal;
        font-weight: 500;
        font-size: 22px;
        line-height: 27px;
        text-align: center;
        color: var(--txt-main-darkblue);
      }
      .subtitle {
        max-width: 401px;

        white-space: break-spaces;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        color: var(--txt-dark-grey);
      }
    }
  }
  &--error {
    display: flex;

    visibility: hidden;

    height: 18px;
    width: 100%;

    &.show {
      visibility: visible;
    }
    p {
      margin: 5px 0 0 0;
      font-style: normal;
      font-weight: 500;
      font-size: 10px;
      line-height: 10px;
      color: var(--error);
    }
  }
}
</style>
