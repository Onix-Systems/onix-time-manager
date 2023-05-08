<template lang="pug">
.permissions
  .permissions-empty(v-if="showEmptyTemplate")
    h2 The list for permissions websites is empty. Add the sites you want to set permission to access.
    img(:src="require(`@/assets/icons/empty-permission-list.svg`)")
  .permissions-page--items(v-else)
    h2 You are in
      span {{ isWhiteList ? "Whitelist" : "Blacklist" }} mode.
      template(v-if="isWhiteList") You can only visit sites that are on this list
      template(v-else) You cannot visit any of the websites on this list.
    .limits-page--content
      list-items(:items="sitesList(permissionData.permission)")
</template>

<script setup lang="ts">
import ListItems from "@/components/common/ListItems.vue";
import {
  isWhiteList,
  permissionData,
  showEmptyTemplate,
  sitesList,
} from "@/composables/permissionComp";
</script>

<style scoped lang="scss">
.permissions {
  padding: 0 12px;

  img {
    display: block;
    margin: 0 auto;
  }
  h2 {
    width: 100%;
    padding-top: 24px;
    margin: 0 auto 50px;

    font-family: Nunito, sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    text-align: center;

    color: var(--txt-light-grey);
  }

  &-page {
    &--content {
      overflow: auto;
      min-height: 387px;
    }

    &--items {
      h2 {
        margin-bottom: 24px;

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
