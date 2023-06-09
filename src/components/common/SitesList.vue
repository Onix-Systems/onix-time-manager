<template lang="pug">
.sites(:class="{ sites__selected: showPadding }")
  .sites--item(
    v-for="item in historyList",
    :class="{ 'current-session': item.domain === selectedHostName }",
    @click="onNextClicked(item)"
  )
    domain-list-item(
      :item="item",
      show-sessions="true",
      :current-time="currentSession(item)",
      :total-time="totalTime(showPadding)"
    )
    .sites--item-activity
      .item-block
        .item-block--title Current Session
        .item-block--info {{ format(sessionMask(currentSession(item)), currentSession(item), true, false) }}
      .item-block
        .item-block--title Longest Session
        .item-block--info {{ format(sessionMask(longestSession(item)), longestSession(item), true, false) }}
      .item-block
        .item-block--title Sessions
        .item-block--info {{ sessionCount(item.sessions) }}
    .tracker--sites-bar
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

import DomainListItem from "@/components/DomainListItem.vue";

import { format, sessionMask } from "@/composables/common/dateComposable";
import {
  currentSession,
  exceptionsCheck,
  historyList,
  isList,
  longestSession,
  onNextClicked,
  selectedHostName,
  sessionCount,
  totalTime,
} from "@/composables/popupTrackerActions";

const props = defineProps({
  isShowCurrentSession: {
    type: Boolean,
    default: true,
  },
});

const showPadding = computed(() => {
  return props.isShowCurrentSession && !exceptionsCheck.value && isList.value;
});
</script>

<style scoped lang="scss">
.loader {
  content: "";
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 32px;
  height: 32px;
  margin: calc(50% - 16px) calc(50% - 16px);

  &:before {
    content: "";
    display: block;
    position: absolute;
    width: 32px;
    height: 32px;

    border-radius: 50%;
  }
}
.sites {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 456px;
  height: 405px;
  overflow: auto;
  box-sizing: border-box;

  * {
    font-family: var(--font-nunito);
  }

  &--item {
    cursor: pointer;
    box-sizing: border-box;
    display: flex;

    width: 100%;
    height: 60px;
    padding: 12px;

    border-radius: 8px;

    &-activity {
      display: none;
      column-gap: 9px;

      .item-block {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;

        width: 100%;
        padding: 7px 10px;

        background: var(--white);
        border-radius: 6px;

        &--title {
          font-size: 12px;
          font-weight: 500;
          line-height: 16px;

          color: var(--txt-dark-grey);
        }

        &--info {
          font-size: 16px;
          font-weight: 600;
          line-height: 25px;

          color: var(--txt-main-darkblue);
        }
      }
    }
  }

  &__selected {
    position: relative;
    padding-top: 150px;

    .current-session {
      position: absolute;
      top: 0;
      flex-direction: column;
      justify-content: space-between;

      height: 143px;
      background: var(--backgr-card-lightgrey);

      .sites--item-content {
        padding-top: 6px;
      }

      ::v-deep(.percent-section--line) {
        background: white;
      }

      ::v-deep(.sessions) {
        visibility: hidden;
      }

      .sites--item-activity {
        display: flex;
      }
    }
  }
}
</style>
