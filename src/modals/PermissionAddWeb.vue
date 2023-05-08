<template lang="pug">
main-modal
  template(v-slot:content)
    .content
      template(v-if="!isDelete")
        .content--header
          .title {{ "Add a website" }}
          button.close(@click="close")
        .content--actions
          input.content--actions-input(
            v-model="sitePermissionData.domain",
            :class="{ error: !errorUrl }"
          )
          .content--actions-input-error {{ !errorUrl ? "Please check validity of initial url" : "" }}
          .content--actions-lists
            button.content--actions-whitelist(
              :class="isActive(PermissionList.whitelist)",
              @click="updatePermissionDataList(PermissionList.whitelist)"
            ) {{ PermissionList.whitelist }}
            button.content--actions-blacklist(
              :class="isActive(PermissionList.blacklist)",
              @click="updatePermissionDataList(PermissionList.blacklist)"
            ) {{ PermissionList.blacklist }}
      template(v-else)
        .content--header
          .title
          button.close(@click="close")
        .content--actions.delete
          h3.title Are you sure you want to delete this website?
          p.subtitle After deleting you can’t block the site through the one of the list.
      .content--footer
        button.content--footer-btn.cancel(@click="close") {{ "Cancel" }}
        button.content--footer-btn.save(
          @click="save",
          :class="{ disable: !isDelete && !sitePermissionData.domain }"
        ) {{ !isDelete ? "Add" : "Delete" }}
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, ref } from "vue";
import MainModal from "@/modals/MainModal.vue";
import { PermissionList } from "@/constants/PermissionList";
import { editSitesInList, permissionData } from "@/composables/permissionComp";

const emit = defineEmits(["close", "delete"]);
const props = defineProps({
  isDelete: {
    type: Boolean,
    default: false,
  },
});

const defaultData = {
  list: PermissionList[permissionData.value.permission],
  domain: "",
};
const sitePermissionData = ref({ ...defaultData });

const errorUrl = ref(true);

onMounted(() => {
  sitePermissionData.value = { ...defaultData };
});

const isActive = (item: PermissionList) => {
  if (item === sitePermissionData.value.list) {
    return "active";
  }
};

const updatePermissionDataList = (item: PermissionList) => {
  sitePermissionData.value.list = item;
};

const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

const close = () => {
  emit("close");
};
const save = () => {
  if (!props.isDelete) {
    errorUrl.value = isValidUrl(sitePermissionData.value.domain);
    if (sitePermissionData.value.domain && errorUrl.value) {
      let settingsList = {
        ...permissionData.value[sitePermissionData.value.list],
      };
      const copyWebInfo = { ...sitePermissionData.value };
      copyWebInfo.domain = `https://${new URL(copyWebInfo.domain).hostname}/`;
      settingsList.list = Object.assign(settingsList.list, {
        [copyWebInfo.domain]: copyWebInfo.domain,
      });
      editSitesInList(sitePermissionData.value.list, settingsList.list);
      close();
    }
  } else {
    emit("delete");
    close();
  }
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

  &--header {
    display: flex;
    justify-content: space-between;

    .title {
      margin-bottom: 24px;
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
  &--actions {
    position: relative;
    &-input {
      box-sizing: border-box;
      height: 40px;
      width: 100%;
      margin-bottom: 15px;
      padding: 12px 16px;
      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 16px;
      color: var(--txt-main-darkblue);
      background: var(--white);
      border: 1px solid var(--backgr-card-lightgrey);
      border-radius: 6px;
      &.error {
        border: 1px solid var(--error);
      }
      &-error {
        position: absolute;
        top: 43px;
        left: 6px;
        font-style: normal;
        font-weight: 500;
        font-size: 10px;
        line-height: 10px;
        color: var(--error);
      }
    }
    &-whitelist,
    &-blacklist {
      height: 40px;
      width: 110px;
      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 16px;
      text-transform: capitalize;
      color: var(--txt-dark-grey);
      background: var(--white);
      border: 1px solid #f5f5f7;
      border-radius: 6px;
      &.active {
        color: var(--txt-dark-blue);
        background: var(--bttn-active-lightblue);
        border: none;
      }
    }
    &-lists {
      display: flex;
      gap: 10px;
      margin-bottom: 29px;
    }
    &.delete {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;

      margin: 26px 0 48px 0;

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
  &--footer {
    display: flex;
    gap: 26px;
    &-btn {
      height: 48px;
      width: 100%;
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      border-radius: 6px;
      &.save {
        color: var(--white);
        background: var(--txt-dark-blue);
        &.disable {
          color: #f2f2f2;
          background: #88a6f7;
        }
      }

      &.cancel {
        color: var(--txt-dark-blue);
        background: var(--white);
        border: 1px solid var(--txt-dark-blue);
      }
    }
  }
}
</style>
