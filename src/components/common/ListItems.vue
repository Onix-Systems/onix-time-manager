<template lang="pug">
.item(v-for="(value, key) in items", :key="key")
  .item--main
    .item--logo
      img(
        :src="`https://s2.googleusercontent.com/s2/favicons?domain=${imgPath(value)}&sz=96`",
        alt="Domain icon"
      )
    .item--info(:class="{ limits }")
      p.bold {{ `Block after ${value.hours ? value.hours + " hours " : " "} ${value.minutes ? value.minutes + " minutes " : " "} ${value.seconds ? value.seconds + " seconds " : " "}` }}
      p {{ limits ? value.domain : value }}
    .item--controls
      button(
        v-if="editMode",
        :class="{ redirect, limits }",
        @click="$emit('edit-item', key)"
      )
      button.delete(v-if="deleteMode", @click="$emit('delete-item', key)")
</template>

<script setup lang="ts">
import { limitsData } from "@/composables/limitsComp";
import { closeModal, isOpen, openModal } from "@/composables/modalActions";
import { EnumModalKeys } from "@/constants/EnumModalKeys";
import { defineProps, defineEmits, ref, computed } from "vue";
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  deleteMode: {
    type: Boolean,
    default: false,
  },
  redirect: {
    type: Boolean,
    default: false,
  },
  limits: {
    type: Boolean,
    default: false,
  },
  disableActions: {
    type: Boolean,
    default: false,
  },
  popupLimit: {
    type: Boolean,
    default: false,
  },
  sites: {
    type: Boolean,
    default: false,
  },
  sitesImg: {
    type: Boolean,
    default: false,
  },
  sitesButton: {
    type: Boolean,
    default: false,
  },
  redirectButton: {
    type: Boolean,
    default: false,
  },
  popupPermission: {
    type: Boolean,
    default: false,
  },
  sitesLimit: {
    type: Boolean,
    default: false,
  },
});
const hostname = (link: string) => {
  const hostname = new URL(link).hostname;
  const protocol = new URL(link).protocol;
  const newUrl = `${protocol}//${hostname}/`;

  return newUrl;
};

const imgPath = (value: { domain?: string; initial?: string } & string) => {
  if (props.limits) {
    return value.domain;
  } else if (props.redirect) {
    return value.initial;
  } else {
    return value;
  }
};
const emit = defineEmits(["update:siteDomain", "edit-item", "delete-item"]);
</script>

<style scoped lang="scss">
.item {
  padding: 12px;
  border-bottom: 1px solid var(--backgr-card-lightgrey2);

  &--main {
    display: flex;
    align-items: center;
    column-gap: 16px;
  }

  &--logo {
    min-width: 40px;

    img {
      width: 100%;
      height: 40px;

      border-radius: 50%;
    }
  }

  &--info {
    display: flex;
    flex-direction: column;

    flex: 1 1 0;

    p {
      font-family: Nunito, sans-serif;
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: var(--txt-main-darkblue);

      &.gray {
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;

        color: var(--txt-dark-grey);
      }

      &.bold {
        display: none;
      }
    }

    &.limits {
      p {
        &.bold {
          display: block;
        }

        &:last-child {
          padding-top: 6px;

          font-weight: 500;
          font-size: 12px;
          line-height: 16px;

          color: var(--txt-dark-grey);
        }
      }
    }
  }

  &--controls {
    display: flex;
    column-gap: 16px;

    button {
      cursor: pointer;

      width: 24px;
      height: 24px;
      margin-right: 12px;

      border: none;
      background-color: transparent;
      background-repeat: no-repeat;
      background-size: contain;

      &.delete {
        background-image: url("@/assets/trashF.svg");
      }
      &.limits {
        background-image: url("@/assets/settingsF.svg");
      }
      &.redirect {
        background-image: url("@/assets/redirectF.svg");
      }
    }
  }
}
</style>
