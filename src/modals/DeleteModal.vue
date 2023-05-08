<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      .content--header
        .title
        button.close(@click="close")
      .content--inputs.delete
        h3.title Are you sure you want to delete this history page?
        p.subtitle You won't be able to view this story again after deleting it
      .content--buttons
        button.content--button.cancel(@click="close") Cancel
        button.content--button.submit(@click="submit") {{ "Delete" }}
</template>
<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import MainModal from "@/modals/MainModal.vue";
import {
  checkDataInStorage,
  getHistory,
  historyStorage,
} from "@/composables/popup/pages/trackerPageActions";

const emit = defineEmits(["close", "selected", "update"]);
const props = defineProps({
  sortedItems: {
    type: Array,
    required: true,
  },
  selectedItems: {
    type: Array,
  },
});
const close = () => {
  emit("close");
};
const submit = () => {
  getHistory();
  const history = { ...historyStorage.value };
  if (props.selectedItems) {
    const domainKeys = props.selectedItems.filter((item) => {
      return typeof item === "number";
    });
    props.selectedItems.forEach((item: any) => {
      if (domainKeys.includes(item)) {
        const site: any = props.sortedItems[item];
        if (site) {
          Object.values(site.urls).forEach((elem: any) => {
            elem.visited.forEach((data: any) => {
              const [day, month, year] = data.split(".");
              const selectData = {
                year,
                month,
                day,
              };
              if (checkDataInStorage(selectData)) {
                delete history[selectData.year][Number(selectData.month)][
                  Number(selectData.day)
                ][site.domain];
              }
            });
          });
        }
      } else {
        const [key, subKey] = item.split("-");
        if (!domainKeys.includes(Number(key))) {
          const site: any = props.sortedItems[key];
          const siteKey = Object.keys(site.urls)[subKey];
          const siteUrl: any = site.urls[siteKey];
          if (siteUrl) {
            siteUrl.visited.forEach((data: any) => {
              const [day, month, year] = data.split(".");
              const selectData = {
                year,
                month,
                day,
              };
              if (checkDataInStorage(selectData)) {
                delete history[selectData.year][Number(selectData.month)][
                  Number(selectData.day)
                ][site.domain]["urls"][siteKey];
              }
            });
          }
        }
      }
    });
  }
  chrome.storage.local.set({ pages: history }, () => {
    getHistory();
  });
  emit("close");
};
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
  &--block {
    display: flex;
    margin-bottom: 24px;
    input.content--input.content--input-dis {
      margin: 0 10px;
    }
  }

  &--header {
    display: flex;
    justify-content: space-between;

    margin-bottom: 26px;

    .title {
      font-style: normal;
      font-weight: 500;
      font-size: 22px;
      line-height: 27px;
      color: #7e7e7e;
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

      border: 1px solid #a9a9a9;
      border-radius: 6px;

      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 15px;
      color: #545d64;

      &::placeholder {
        color: #d9d9d9;
      }
      &.error {
        border: 1px solid #e53935;
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
        color: #7e7e7e;
      }
      .subtitle {
        max-width: 401px;

        white-space: break-spaces;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        color: #a9a9a9;
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
      color: #e53935;
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
      background-color: #000000;

      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      color: #ffffff;

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
</style>
