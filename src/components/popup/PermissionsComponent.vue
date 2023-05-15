<template lang="pug">
.permissions
  empty-template.fixed(
    v-if="isOff",
    :image-path="'off-template.svg'",
    :message="'The list option is disabled. You can use all sites without limits.'"
  )
    button.content--button.tab-active(
      @click="openOptions(MenuItemsEnum.Permissions)"
    ) Change rules
  empty-template.fixed(
    v-else-if="showEmptyTemplate",
    :image-path="'empty-permission-list.svg'",
    :message="'The list for permissions websites is empty. Add the sites you want to set permission to access.'"
  )
    button.content--button.tab-active.icon.icon--plus(
      @click="openOptions(MenuItemsEnum.Permissions)"
    ) Add rules
  .permissions-page--items(v-else)
    h2 You are in
      span {{ isBlackList ? "Blacklist" : "Whitelist" }} mode.
      template(v-if="isWhiteList") You can only visit sites that are on this list
      template(v-else) You cannot visit any of the websites on this list.
    .limits-page--content
      list-items(:items="isBlackList ? blackList : whiteList as any")
</template>

<script setup lang="ts">
import ListItems from "@/components/common/ListItems.vue";
import EmptyTemplate from "@/components/common/EmptyTemplate.vue";

import { openOptions } from "@/composables/popup/common/popupActions";
import {
  isWhiteList,
  showEmptyTemplate,
  isOff,
  isBlackList,
  blackList,
  whiteList,
} from "@/composables/permissionComp";

import { MenuItemsEnum } from "@/constants/menuItemsEnum";
</script>

<style scoped lang="scss">
.permissions {
  position: relative;
  padding: 0 12px;

  &-page {
    &--content {
      overflow: auto;
      min-height: 387px;
    }

    &--items {
      h2 {
        width: 100%;
        padding-top: 24px;
        margin: 0 auto 24px;

        font-family: var(--font-nunito);
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        text-align: left;

        color: var(--txt-dark-grey);

        span {
          padding: 0 3px;
          color: var(--txt-main-darkblue);
        }
      }
    }
  }
}
</style>
