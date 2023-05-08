<template lang="pug">
.bar-chart
  bar(:data="data", :options="optionsData")
</template>

<script setup lang="ts">
import { names, optionsData, timeData } from "@/composables/common/chartBar";
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const data = computed(() => {
  return {
    labels: [...names.value],
    datasets: [
      {
        data: [...timeData.value],
        backgroundColor: ["#386AF1"],
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: "#88A6F7",
      },
    ],
  };
});
</script>

<style scoped lang="scss">
.bar-chart {
  display: block;
  width: 381px;
  height: 283px;
}
</style>
