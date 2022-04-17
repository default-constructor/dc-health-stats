<script lang="ts">
import {defineComponent, ref} from "vue";
import {useTotalDeathsApi} from "../apis/total-deaths.api";
import StackedAreaChart from "../components/StackedAreaChart.vue";
import {ChartData} from "../models/chart-data.model";
import {TotalDeaths} from "../models/total-deaths.model";

export default defineComponent({
  name: 'DeathsChartView',
  components: {StackedAreaChart},

  async setup() {
    const prepareChartData = (data: TotalDeaths[]): ChartData[] => {
      const preparedChartData: ChartData[] = []
      data.forEach((d: TotalDeaths, index) => {
        preparedChartData[index] = {
          x: ("0" + d.week).slice(-2) + "/" + d.year,
          y: d.count,
          z: d.ageGroup
        } as ChartData
      })

      return preparedChartData
    }

    const chartData = ref();

    const {loadTotalDeaths, loading, result, error} = useTotalDeathsApi()

    await loadTotalDeaths()
    chartData.value = prepareChartData(result.value)

    return {
      chartData
    }
  }
})
</script>

<template>
  <article id="deaths-chart-view">
    <h2>DeathsChartView</h2>
    <StackedAreaChart :chartData="chartData"></StackedAreaChart>
  </article>
</template>

<style lang="scss" scoped>
</style>
