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
          let endIndex = ageGroup.indexOf("-");
          if (endIndex === -1) {
            endIndex = ageGroup.indexOf(" u. mehr")
          }

          return {
            id: "age-group-" + ageGroup.substring(0, endIndex),
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
        <ul class="legend__years">
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
        <ul v-for="group in groupedAgeGroupsCheckboxesRef" class="legend__age-groups">
          <li v-for="checkbox in group">
            <input :id="checkbox.id" type="checkbox" v-model="checkbox.checked"/>
            <label :for="checkbox.id">{{ checkbox.name }} Jährige</label>
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

    .legend__years {
      li {
        margin-bottom: 8px;

        label {
          margin-right: 4px;
          width: 40px;
          text-align: right;
        }
      }
    }

    .legend__age-groups {
      li {
        margin-bottom: 2px;
      }
    }

    ul {
      list-style: none;
      min-width: 168px;
      margin: 0;
      padding: 0;

      li {
        display: flex;
        width: 100%;
        height: 24px;
        position: relative;

        input[type="checkbox"] {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
          -webkit-appearance: none;

          + label {
            position: absolute;
            top: 0;
            left: 0;

            &::before {
              width: 16px;
              height: 16px;
              background-color: white;
              border: 1px solid #2c3e50;
              display: block;
              content: "";
              float: left;
              margin-right: 6px;
              z-index: 5;
              position: relative;
            }
          }

          &#age-group-0:checked + label::before {
            background-color: #8cff3f;
          }

          &#age-group-30:checked + label::before {
            background-color: #7f3fff;
          }

          &#age-group-35:checked + label::before {
            background-color: #c72f2f;
          }

          &#age-group-40:checked + label::before {
            background-color: #0020ff;
          }

          &#age-group-45:checked + label::before {
            background-color: #ff7f00;
          }

          &#age-group-50:checked + label::before {
            background-color: #199f19;
          }

          &#age-group-55:checked + label::before {
            background-color: #ff7f7f;
          }

          &#age-group-60:checked + label::before {
            background-color: #00d9ff;
          }

          &#age-group-65:checked + label::before {
            background-color: #ff207f;
          }

          &#age-group-70:checked + label::before {
            background-color: #c7a92f;
          }

          &#age-group-75:checked + label::before {
            background-color: #007fff;
          }

          &#age-group-80:checked + label::before {
            background-color: #9774ff;
          }

          &#age-group-85:checked + label::before {
            background-color: #7f2020;
          }

          &#age-group-90:checked + label::before {
            background-color: #ff9d3f;
          }

          &#age-group-95:checked + label::before {
            background-color: #007f5f;
          }
        }
      }
    }
  }
}
</style>
