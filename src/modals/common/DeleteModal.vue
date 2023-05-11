<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      .content--header
        .title
        button.close(@click="close")
      .content--inputs
        h3.title Are you sure you want to delete this {{ props.deleteType }}?
        p.subtitle {{ props.deleteContext }}
      .content--buttons
        button.content--button.cancel(@click="close") Cancel
        button.content--button.submit(@click="submit") Delete
</template>
<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import MainModal from "@/modals/MainModal.vue";

const props = defineProps({
  deleteType: {
    type: String,
    required: true,
  },
  deleteContext: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["onClosed", "onSubmit"]);

const close = () => {
  emit("onClosed");
};
const submit = () => {
  emit("onSubmit");
  close();
};
</script>

<style scoped lang="scss">
html {
  overflow: hidden;
}
.modal--wrapper {
  padding: 32px 36px;

  .content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: 654px;

    &--header {
      display: flex;
      justify-content: space-between;

      margin: 10px 8px 20px 0;

      .title {
        font-style: normal;
        font-weight: 500;
        font-size: 22px;
        line-height: 27px;
        color: #7e7e7e;
      }
      .close {
        display: block;

        width: 12px;
        height: 12px;
        padding: 0;
        margin: 0;

        background-image: url("@/assets/icons/cross.svg");
        background-repeat: no-repeat;
        background-position: center;
        background-color: transparent;
        border: none;
      }
    }
    &--inputs {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      width: 100%;
      margin-bottom: 32px;
      gap: 8px;

      .title {
        font-family: var(--font-nunito);
        font-size: 24px;
        font-weight: 500;
        line-height: 33px;
        text-align: center;

        color: var(--txt-main-darkblue);
      }
      .subtitle {
        max-width: 401px;

        font-family: var(--font-nunito);
        font-size: 18px;
        font-weight: 600;
        line-height: 25px;
        text-align: center;
        white-space: break-spaces;

        color: var(--txt-dark-grey);
      }
    }

    &--buttons {
      display: flex;
      justify-content: space-between;

      gap: 26px;
      width: 100%;

      .content--button {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        cursor: pointer;

        height: 48px;
        width: 100%;
        padding: 15px;

        font-style: normal;
        font-weight: 500;
        font-size: 15px;
        line-height: 18px;

        border: none;
        border-radius: 6px;

        &.cancel {
          background-color: var(--white);
          outline: 1px solid var(--txt-dark-blue);
          color: var(--txt-dark-blue);
        }
        &.submit {
          color: var(--txt-anti-flashlight);
          background-color: var(--txt-dark-blue);
        }
      }
    }
  }
}
</style>
