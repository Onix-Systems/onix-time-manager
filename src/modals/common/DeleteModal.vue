<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      .content--header
        .title
        button.close(@click="close")
      .content--body
        h3.title Are you sure you want to delete this {{ props.deleteType }}?
        p.subtitle {{ props.deleteContext }}
      .content--buttons
        button.content--button.primary(@click="close") Cancel
        button.content--button.raised(@click="submit") Delete
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
@import "@/scss/common/modal.scss";
.modal--wrapper {
  padding: 32px 36px;

  .content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    width: 100%;
    max-width: 654px;

    &--body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      width: 100%;
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
  }
}
</style>
