<template lang="pug">
.item(v-for="(value, key) in items", :key="key")
  .item--main
    .item--logo
      img(
        :src="`https://s2.googleusercontent.com/s2/favicons?domain=${imgPath(value)}&sz=96`",
        alt="Domain icon"
      )
    .item--info(:class="{ limits, redirect }")
      p.bold
        template(v-if="limits") {{ `Block after ${value.hours ? value.hours + " hours " : " "} ${value.minutes ? value.minutes + " minutes " : " "} ${value.seconds ? value.seconds + " seconds " : " "}` }}
        template(v-if="redirect") {{ `Redirection to ${value.redirect}` }}
      p(v-if="redirect") From {{ value.initial }}
      p(v-else) {{ limits ? value.domain : value }}
    .item--controls
      button.settings(v-if="editMode", @click="$emit('onEdit', key)")
      button.delete(v-if="deleteMode", @click="$emit('onDelete', key)")
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
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
});

const imgPath = (value: { domain?: string; initial?: string } & string) => {
  if (props.limits) {
    return value.domain;
  } else if (props.redirect) {
    return value.initial;
  } else {
    return value;
  }
};
const emit = defineEmits(["onEdit", "onDelete"]);
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

    &.limits,
    &.redirect {
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
      &.settings {
        background-image: url("@/assets/settingsF.svg");
      }
    }
  }
}
</style>
