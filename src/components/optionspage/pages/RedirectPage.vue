<template lang="pug">
.redirect-page
  .option--header
    .option--header-left
      .option--header--title {{ MenuItemsEnum.Redirect }}
      .option--header--subtitle {{ "Set up redirect for the blocked sites" }}
    .option--header-right
      button.option--header-btn(@click="openModal(EnumModalKeys.Redirect)") Add redirect
  .limits-page--content(v-if="data.length")
    list-items(
      :items="data",
      :editMode="true",
      :deleteMode="true",
      :redirect="true",
      @edit-item="editItem($event)",
      @delete-item="deleteItem($event)"
    )
  placeholder-component(:img-name="'redirect-placeholder.svg'", v-else)
    template(v-slot="")
      | The list of redirects is empty. Please set up a redirect to see them here.
redirect-modal(
  v-if="isOpen(EnumModalKeys.Redirect)",
  @close="modalClose",
  :initial-data="editData",
  :is-edit="isEdit",
  :edit-index="currentIndex",
  :is-delete="isDelete"
)
</template>

<script setup lang="ts">
import { MenuItemsEnum } from "@/constants/menuItemsEnum";
import PlaceholderComponent from "@/components/optionspage/common/PlaceholderComponent.vue";
import RedirectModal from "@/modals/RedirectModal.vue";
import { isOpen, openModal, closeModal } from "@/composables/modalActions";
import { EnumModalKeys } from "@/constants/EnumModalKeys";
import { onMounted, ref } from "vue";
import ListItems from "@/components/common/ListItems.vue";
const data = ref([] as { initial: string; redirect: string }[]);

const isEdit = ref(false);
const editData = ref({});
const currentIndex = ref(-1);

const isDelete = ref(false);

const modalClose = () => {
  closeModal(EnumModalKeys.Redirect);
  loadData();
  resetEdit();
};

const resetEdit = () => {
  currentIndex.value = -1;
  editData.value = {};
  isEdit.value = false;
  isDelete.value = false;
};

const editItem = (index: number) => {
  isEdit.value = true;
  editData.value = { ...data.value[index] };
  currentIndex.value = index;
  openModal(EnumModalKeys.Redirect);
};
const deleteItem = (index: number) => {
  isDelete.value = true;
  currentIndex.value = index;
  openModal(EnumModalKeys.Redirect);
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
