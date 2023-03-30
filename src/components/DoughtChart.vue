<template lang="pug">
.dought
  Doughnut(:data="data", :options="options")
</template>

<script lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import * as chartConfig from "../../src/chartConfig";

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: "App",
  components: {
    Doughnut,
  },
  data() {
    return chartConfig;
  },
};
</script>

<style lang="scss">
.dought {
  width: 400px;
}
</style>
