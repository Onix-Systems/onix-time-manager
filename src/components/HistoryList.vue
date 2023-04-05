<template lang="pug">
.history-section
  ul.list
    li.item(
      v-for="(item, index) in labels",
      :key="item",
      :class="isActive(item, index)",
      @click="editActiveSite(item, index)"
    )
      .color(:style="{ background: colors[index] }")
      a.name(
        v-if="topTasks && item !== 'others' && isActive(item, index)",
        :href="`https://${item}`",
        target="_blank"
      ) {{ item }}
      .name(v-else) {{ item }}
</template>

<script setup lang="ts">
import {
  topTasks,
  colors,
  labels,
  activeSite,
  editActiveSite,
} from "@/composables/chartConfig";

const isActive = (item: string, index: number) => {
  return index === activeSite.value && item !== "others" ? "active" : "";
};
</script>

<style scoped lang="scss">
.history-section {
  display: flex;
  flex-direction: column;
  margin-left: 42px;
  .list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 19px;
      .name {
        text-decoration: none;
        color: black;
      }
      .color {
        width: 22px;
        height: 22px;
        margin-right: 12px;
        border-radius: 50%;
      }
      &.active {
        .name {
          text-decoration: underline;
          color: #4196db;
        }
        .color {
          width: 18px;
          height: 18px;
          border: 2px solid black;
        }
      }
    }
  }
  .total {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    border-top: 1px solid black;
  }
}
</style>
