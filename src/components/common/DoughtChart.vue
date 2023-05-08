<template lang="pug">
.dought
  Doughnut(:data="data", :options="options")
    div
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import { data, options } from "@/composables/chartConfig";
import { topTasks } from "@/composables/chartConfig";
import { computed } from "@vue/reactivity";

ChartJS.register(ArcElement, Tooltip, Legend);
const props = defineProps(["disableHover"]);
const labelsArray = computed(() => {
  return topTasks.value.map((task: any) => task);
});
if (props.disableHover) {
  options.plugins.tooltip = {
    enabled: false,
  };
}
</script>

<style lang="scss">
.dought {
  height: 220px;
}
.my-class {
  font-style: normal;
  font-weight: 600;
  font-size: 11px;
  line-height: 17px;
  color: #585858;
  text-align: center;
  margin: 4px 0;
  &:first-child {
    color: #000000;
    font-weight: 900;
    font-size: 24px;
    line-height: 29px;
  }
}
</style>
