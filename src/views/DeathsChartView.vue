<script lang="ts">
import {defineComponent, ref} from "vue";
import {useTotalDeathsApi} from "../apis/total-deaths.api";
import StackedAreaChart from "../components/StackedAreaChart.vue";

export default defineComponent({
  name: 'DeathsChartView',
  components: {StackedAreaChart},

  async setup() {
    console.log("setup");

    const prepareData = (data: []): Map<string, []> => {
      const ageGroupMap = new Map()
      data.forEach((d: any) => {
        if (!ageGroupMap.get(d.ageGroup)) {
          ageGroupMap.set(d.ageGroup, [])
        }
        let ageGroupDeaths = ageGroupMap.get(d.ageGroup);
        ageGroupDeaths[ageGroupDeaths.length] = {
          x: ("0" + d.week).slice(-2) + "/" + d.year,
          y: d.count
        }
      })

      console.log("ageGroupMap", ageGroupMap)

      return ageGroupMap
    }

    const chartData = ref();

    const {loadTotalDeaths, loading, result, error} = useTotalDeathsApi()

    await loadTotalDeaths()
    chartData.value = prepareData(result.value)
    console.log("chartData", chartData)

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
