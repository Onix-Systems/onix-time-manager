<template lang="pug">
.redirect-page
  .option--header
    .option--header-left
      .option--header--title {{ MenuItemsEnum.Redirect }}
      .option--header--subtitle {{ "Set up redirect for the blocked sites" }}
    .option--header-right
      button.option--header-btn(@click="openModal(EnumModalKeys.RedirectEdit)") Add redirect
  .limits-page--content(v-if="data.length")
    list-items(
      :items="data",
      :edit-mode="true",
      :delete-mode="true",
      :redirect="true",
      @onEdit="editItem($event)",
      @onDelete="deleteItem($event)"
    )
  placeholder-component(:img-name="'redirect-placeholder.svg'", v-else)
    template(v-slot="")
      | The list of redirects is empty. Please set up a redirect to see them here.
new-redirect-modal(
  v-if="isOpen(EnumModalKeys.Edit)",
  :initial-data="editData",
  :edit-index="currentIndex",
  @onClosed="modalClose"
)
delete-modal(
  v-if="isOpen(EnumModalKeys.Delete)",
  :delete-type="`this redirect`",
  :delete-context="`After deleting you will not be able to use this redirect for block the site again`",
  @onSubmit="deleteAction",
  @onClosed="closeModal(EnumModalKeys.Delete)"
)
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import ListItems from "@/components/common/ListItems.vue";
import PlaceholderComponent from "@/components/optionspage/common/PlaceholderComponent.vue";

import NewRedirectModal from "@/modals/NewRedirectModal.vue";
import DeleteModal from "@/modals/common/DeleteModal.vue";

import { isOpen, openModal, closeModal } from "@/composables/modalActions";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import { EnumModalKeys } from "@/constants/EnumModalKeys";

const data = ref([] as { initial: string; redirect: string }[]);

const editData = ref({});
const currentIndex = ref(-1);

const modalClose = () => {
  loadData();
  resetEdit();
  closeModal(EnumModalKeys.Edit);
};

const resetEdit = () => {
  currentIndex.value = -1;
  editData.value = {};
};

const editItem = (index: number) => {
  editData.value = { ...data.value[index] };
  currentIndex.value = index;
  openModal(EnumModalKeys.Edit);
};
const deleteItem = (index: number) => {
  currentIndex.value = index;
  openModal(EnumModalKeys.Delete);
};

const loadData = () => {
  chrome.storage.local.get("redirect").then((res) => {
    if (res && res.redirect && res.redirect.length) {
      data.value = res.redirect;
    } else {
      chrome.storage.local.set({ redirect: [] });
      data.value = [];
    }
  });
};

const deleteAction = () => {
  chrome.storage.local.get("redirect").then((res) => {
    const array = res.redirect;
    array.splice(currentIndex.value, 1);
    chrome.storage.local.set({ redirect: [...array] }).then(() => {
      loadData();
    });
  });
};
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.limits-page--content {
  margin-top: 24px;
}
.redirect-page {
  &--header {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  &--title {
    display: flex;
    flex-direction: column;
    .main {
      font-style: normal;
      font-weight: 600;
      font-size: 28px;
      line-height: 34px;
      color: #545d64;
    }
    .sub {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 17px;
      color: #a9a9a9;
    }
  }
  &--button {
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 170px;
    height: 36px;

    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    color: #a9a9a9;

    background: transparent;
    border: 1px solid #a9a9a9;
    border-radius: 6px;

    &::before {
      content: "";
      display: block;

      width: 10px;
      height: 10px;
      margin-right: 13px;

      background-image: url("@/assets/icons/plus.svg");
      background-size: contain;
      background-repeat: no-repeat;
    }
  }
  &--content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    padding-top: 40px;

    width: 100%;
    height: 100%;
  }
}
</style>
