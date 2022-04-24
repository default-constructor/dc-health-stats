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
      [{name: "0-30", color: "#8cff3f"}, {name: "30-35", color: "#7f3fff"}, {name: "35-40", color: "#c72f2f"}],
      [{name: "40-45", color: "#0020ff"}, {name: "45-50", color: "#ff7f00"}, {name: "50-55", color: "#199f19"}],
      [{name: "55-60", color: "#ff7f7f"}, {name: "60-65", color: "#00d9ff"}, {name: "65-70", color: "#ff207f"}],
      [{name: "70-75", color: "#c7a92f"}, {name: "75-80", color: "#007fff"}, {name: "80-85", color: "#9774ff"}],
      [{name: "85-90", color: "#7f2020"}, {name: "90-95", color: "#ff9d3f"}, {name: "95 u. mehr", color: "#007f5f"}]
    ]
    const ageGroupColorsRef = ref()

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

      chartDataRef.value = getChartData(result.value)
      ageGroupColorsRef.value = getAgeGroupColors(result.value)
    }

    const getChartData = (data: TotalDeaths[]): ChartData[] => {
      return data.map((deaths => {
        return {
          x: ("0" + deaths.week).slice(-2) + "/" + deaths.year,
          y: deaths.count,
          z: deaths.ageGroup
        } as ChartData
      }))
    }

    const getAgeGroupColors = (data: TotalDeaths[]): string[] => {
      const ageGroups = [...new Set(data.map((deaths: TotalDeaths) => deaths.ageGroup)).values()];

      return groupedAgeGroups.map((value: any[]) => value
          .filter((item: any) => ageGroups.find((ageGroup: string) => ageGroup === item.name))
          .map((item: any) => item.color))
          .flat() as string[]
    }

    watchEffect(() => {
      if (groupedAgeGroupsCheckboxesRef.value) {
        loadChartData()
      }
    })

    groupedAgeGroupsCheckboxesRef.value = groupedAgeGroups.map((value: any[]) =>
        value.map((item: any) => {
          const name = item.name
          let endIndex = name.indexOf("-")
          if (endIndex === -1) {
            endIndex = name.indexOf(" u. mehr")
          }

          return {
            id: "age-group-" + name.substring(0, endIndex),
            name: name as string,
            checked: true as boolean
          } as any
        })
    )

    return {
      chartDataRef,
      fromYearRef,
      toYearRef,
      yearsRef,
      groupedAgeGroupsCheckboxesRef,
      ageGroupColorsRef
    }
  }
})
</script>

<template>
  <article id="deaths-chart-view">
    <h2>DeathsChartView</h2>
    <div class="death-chart">
      <StackedAreaChart :chartData="chartDataRef" :colors="ageGroupColorsRef" class="death-chart__chart">
      </StackedAreaChart>
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
              z-index: 1;
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
