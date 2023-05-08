<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      template(v-if="!isDelete")
        .content--header
          .title Set up a redirect
          button.close(@click="close")
        .content--inputs
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
      template(v-else)
        .content--header
          .title
          button.close(@click="close")
        .content--inputs.delete
          h3.title Are you sure you want to delete this redirect?
          p.subtitle After deleting you will not be able to use this redirect for blocked site again.
      .content--buttons
        button.content--button.cancel(@click="close") Cancel
        button.content--button.submit(
          :class="{ disabled: !isDelete && !urlGroup.initial }",
          @click="submit"
        ) {{ !isDelete ? "Set" : "Delete" }}
</template>

<script setup lang="ts">
import { defineEmits, onMounted, reactive, defineProps, ref } from "vue";
import MainModal from "@/modals/MainModal.vue";

const emit = defineEmits(["close", "edit"]);
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
  isDelete: {
    type: Boolean,
    default: false,
  },
  editIndex: {
    type: Number,
    default: 0,
  },
});
const close = () => {
  emit("close");
};

const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

const errors = ref({
  initial: true,
  redirect: true,
  initialSame: true,
});

const urlGroup = ref({
  initial: "",
  redirect: "",
});

const submit = () => {
  if (!props.isDelete) {
    errors.value.initial = isValidUrl(urlGroup.value.initial);
    errors.value.redirect = isValidUrl(urlGroup.value.redirect);

    if (errors.value.initial && errors.value.redirect) {
      chrome.storage.local.get("redirect").then((res) => {
        if (props.initialData.initial !== urlGroup.value.initial) {
          errors.value.initialSame = !res.redirect.some(
            (element: { initial: string; redirect: string }) =>
              new URL(element.initial).hostname ===
              new URL(urlGroup.value.initial).hostname
          );
        }
        if (errors.value.initialSame) {
          let array = res.redirect;
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
  } else {
    chrome.storage.local.get("redirect").then((res) => {
      let array = res.redirect;
      array.splice(props.editIndex, 1);
      chrome.storage.local.set({ redirect: [...array] }).then(() => {
        close();
      });
    });
  }
};

onMounted(() => {
  urlGroup.value = { ...props.initialData };
});
</script>

<style scoped lang="scss">
html {
  overflow: hidden;
}
.content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  width: 654px;

  &--header {
    display: flex;
    justify-content: space-between;

    margin-bottom: 26px;

    .title {
      font-style: normal;
      font-weight: 500;
      font-size: 22px;
      line-height: 27px;
      color: var(--txt-main-darkblue);
    }
    .close {
      display: block;

      width: 30px;
      height: 30px;
      padding: 0;
      margin: 0;

      background-image: url("@/assets/icons/cross.svg");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      background-color: transparent;
      border: none;
    }
  }
  &--inputs {
    display: flex;
    flex-direction: column;
    width: 100%;

    margin-bottom: 8px;

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
  &--buttons {
    display: flex;
    justify-content: space-between;

    gap: 26px;
    width: 100%;

    .content--button {
      box-sizing: border-box;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      height: 48px;
      width: 100%;
      padding: 15px;

      border: none;
      border-radius: 6px;
      background-color: var(--white);

      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      color: var(--txt-dark-blue);

      &.cancel {
        background-color: transparent;
        outline: 1px solid var(--txt-dark-blue);
      }
      &.submit {
        color: var(--white);
        background-color: var(--txt-dark-blue);

        &.disabled {
          pointer-events: none;
          background: #88a6f7;
          color: #f2f2f2;
        }
      }
    }
  }
}
</style>
