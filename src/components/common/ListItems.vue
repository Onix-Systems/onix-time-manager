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
        template(v-if="calculation") {{ localLimit(value) }}
        template(v-else-if="limits") {{ time(value.siteLimit, block) }}
        template(v-if="redirect") {{ `Redirection to ${value.redirect}` }}
      p(v-if="redirect") From {{ value.initial }}
      p(v-else) {{ limits ? value.domain : value }}
      p.sub-limit(v-if="permissionLimit && !!findLimit(value)") {{ localLimit({ domain: value, siteLimit: findLimit(value).siteLimit }) }}
    .item--controls
      button.settings(
        v-if="editMode",
        @click="$emit('onEdit', permission ? value : key)"
      )
      button.delete(v-if="deleteMode", @click="$emit('onDelete', key)")
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
import { convertTimeHMS, format } from "@/composables/common/dateComposable";
import {
  destroyTrackerInterval,
  showTimeLoader,
  trackerCounter,
} from "@/composables/common/timeCounter";
import {
  generalListSpent,
  reachLocalLimits,
  selectedHostName,
} from "@/composables/popupTrackerActions";
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  limitsData: {
    type: Array,
    required: false,
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
  block: {
    type: Boolean,
    default: false,
  },
  limits: {
    type: Boolean,
    default: false,
  },
  calculation: {
    type: Boolean,
    default: false,
  },
  permission: {
    type: Boolean,
    default: false,
  },
  permissionLimit: {
    type: Boolean,
    default: false,
  },
});

const time = (blockItem: any, block: boolean) => {
  const blockAfter = block
    ? blockItem.timeLimit - blockItem.timeSpent
    : blockItem.timeLimit;
  const h = convertTimeHMS(blockAfter).hour || 0;
  const m = convertTimeHMS(blockAfter).minute || 0;
  const s = convertTimeHMS(blockAfter).second || 0;
  const addS = (numb: number | string) => {
    return Number(numb) > 1 ? "s" : "";
  };
  const prefixH = !block ? ` hour${addS(h)} ` : "h ";
  const prefixM = !block ? ` minute${addS(h)} ` : "m ";
  const prefixS = !block ? ` second${addS(h)} ` : "s ";
  if (h > 0 || m > 0 || s > 0) {
    return `Block after ${h ? h + prefixH : " "} ${m ? m + prefixM : " "} ${
      s ? s + prefixS : " "
    }`;
  } else {
    return "Blocked";
  }
};

const findLimit = (domain: string) => {
  if (props.limitsData) {
    return Object.values(props.limitsData).find(
      (item: any) => item.domain === domain
    );
  }
};

const localLimit = ({
  siteLimit,
  domain,
}: {
  siteLimit: { timeLimit: number };
  domain: string;
}) => {
  const useCounter = domain.includes(selectedHostName.value);
  const limitSpent = generalListSpent.value[domain];

  const spent =
    siteLimit.timeLimit -
    limitSpent -
    1 -
    (useCounter ? trackerCounter.value : 0);
  if (spent > 0) {
    return `${
      props.permissionLimit ? "You add limit time." : ""
    }Block after ${format(
      siteLimit.timeLimit > 3600 ? "HHh mmm sss" : "mmm sss",
      spent,
      true
    )}`;
  } else {
    if (siteLimit.timeLimit === limitSpent + 1 + trackerCounter.value) {
      destroyTrackerInterval();
      showTimeLoader.value = false;
    }
    return "Blocked";
  }
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
    min-width: 32px;

    img {
      width: 100%;
      height: 32px;

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
      &.sub-limit {
        padding-top: 6px;
        font-size: 14px;
        line-height: 15px;
        font-weight: 400;
        color: #a9a9a9;
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
