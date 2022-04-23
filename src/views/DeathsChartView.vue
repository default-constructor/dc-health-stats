<script lang="ts">
import {defineComponent, ref, watchEffect} from "vue"
import {useTotalDeathsApi} from "../apis/total-deaths.api"
import StackedAreaChart from "../components/StackedAreaChart.vue"
import {ChartData} from "../models/chart-data.model"
import {TotalDeaths} from "../models/total-deaths.model"

export default defineComponent({
  name: 'DeathsChartView',
  components: {StackedAreaChart},

  setup() {
    const chartDataRef = ref([] as ChartData[])

    const groupedAgeGroupsCheckboxesRef = ref()
    const groupedAgeGroups = [
      ["0-30", "30-35", "35-40"],
      ["40-45", "45-50", "50-55"],
      ["55-60", "60-65", "65-70"],
      ["70-75", "75-80", "80-85"],
      ["85-90", "90-95", "95 u. mehr"]
    ]

    const minYear = 2005;
    const currentYear = (new Date()).getFullYear();
    const fromYearRef = ref(currentYear - 5)
    const toYearRef = ref(currentYear)
    const yearsRef = ref(Array.from(Array(currentYear - minYear + 1), (_, i) => minYear + i))

    const {loadTotalDeaths, loading, result, error} = useTotalDeathsApi()

    const loadChartData = async () => {
      if (fromYearRef.value > toYearRef.value) {
        return
      }

      const ageGroups = groupedAgeGroupsCheckboxesRef.value
          .map((checkboxGroup: any[]) =>
              checkboxGroup
                  .filter((checkbox: any) => checkbox.checked)
                  .map((checkbox: any) => checkbox.name)
          )
          .flat() as string[]

      await loadTotalDeaths(fromYearRef.value, toYearRef.value, ageGroups)
      chartDataRef.value = prepareChartData(result.value)
    }

    const prepareChartData = (data: TotalDeaths[]): ChartData[] => {
      return data.map((deaths => {
        return {
          x: ("0" + deaths.week).slice(-2) + "/" + deaths.year,
          y: deaths.count,
          z: deaths.ageGroup
        } as ChartData
      }))
    }

    watchEffect(() => {
      if (groupedAgeGroupsCheckboxesRef.value) {
        loadChartData()
      }
    })

    groupedAgeGroupsCheckboxesRef.value = groupedAgeGroups.map((value: string[]) =>
        value.map((ageGroup: string) => {
          return {
            name: ageGroup as string,
            checked: true as boolean
          } as any
        })
    )

    return {
      chartDataRef,
      fromYearRef,
      toYearRef,
      yearsRef,
      groupedAgeGroupsCheckboxesRef
    }
  }
})
</script>

<template>
  <article id="deaths-chart-view">
    <h2>DeathsChartView</h2>
    <div class="death-chart">
      <StackedAreaChart :chartData="chartDataRef" class="death-chart__chart"></StackedAreaChart>
      <div class="death-chart__legend">
        <ul>
          <li>
            <label>Von: </label>
            <select v-model="fromYearRef">
              <option v-for="year in yearsRef" :value="year">{{ year }}</option>
            </select>
          </li>
          <li>
            <label>Bis: </label>
            <select v-model="toYearRef">
              <option v-for="year in yearsRef" :value="year">{{ year }}</option>
            </select>
          </li>
        </ul>
        <ul v-for="group in groupedAgeGroupsCheckboxesRef">
          <li v-for="checkbox in group">
            <input :id="checkbox.name" type="checkbox" v-model="checkbox.checked"/>
            <label :for="checkbox.name">{{ checkbox.name }} Jährige</label>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.death-chart {
  margin: 0 32px;

  &__legend {
    display: flex;
    justify-content: flex-start;
    margin: 0 128px;

    ul {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      list-style: none;
      width: 192px;
      margin: 0;
      padding: 0;

      li {
        display: flex;
        margin: 4px 0;
        width: 100%;

        label {
          min-width: 32px;
          text-align: right;
          margin: 0 4px;
        }
      }
    }
  }
}
</style>
