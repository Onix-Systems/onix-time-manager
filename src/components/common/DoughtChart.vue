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

ChartJS.register(ArcElement, Tooltip, Legend);
const props = defineProps(["disableHover"]);
if (props.disableHover) {
  options.plugins.tooltip = {
    enabled: false,
  };
}
</script>

<style scoped lang="scss"></style>
