<template lang="pug">
.dought
  Doughnut(:data="data", :options="options")
</template>

<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import { data, options } from "@/composables/chartConfig";

ChartJS.register(ArcElement, Tooltip, Legend);
</script>

<style scoped lang="scss"></style>
