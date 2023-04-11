<template lang="pug">
dropdown-component
  template(v-slot:selectedItem="")
    .selected-item(v-if="settingsData[name].minute") {{ `${settingsData[name].minute}${settingsData[name].minute <= 2 ? " min" : " mins"}` }}
    .selected-item(v-if="settingsData[name].second") {{ settingsData[name].second + " seconds" }}
  template(v-slot:content="props")
    div(
      v-for="item in items",
      @click="selectItem(item, props.toggleVisibility())"
    )
      .item--name(
        v-if="item.minute",
        :class="{ active: item.minute === settingsData[name].minute }"
      ) {{ `${item.minute}${item.minute <= 2 ? " min" : " mins"}` }}
      .item--name(
        v-if="item.second",
        :class="{ active: item.second === settingsData[name].second }"
      ) {{ item.second + " seconds" }}
</template>

<script setup lang="ts">
import DropdownComponent from "@/components/common/DropdownComponent";
import { defineProps } from "vue";
import { settingsData, updateSettings } from "@/composables/settingsComp";
const props = defineProps({
  name: String,
});
const items = [
  { hour: 0, minute: 0, second: 30 },
  { hour: 0, minute: 1, second: 0 },
  { hour: 0, minute: 2, second: 0 },
  { hour: 0, minute: 5, second: 0 },
  { hour: 0, minute: 10, second: 0 },
  { hour: 0, minute: 20, second: 0 },
];

const selectItem = (item: object, close?: any) => {
  updateSettings(props.name, item);
  if (close) {
    return close;
  }
};
</script>

<style scoped lang="scss"></style>
