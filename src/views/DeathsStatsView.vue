<script lang="ts">
import {defineComponent, ref, watchEffect} from "vue"
import {useTotalDeathsApi} from "../apis/total-deaths.api"
import StackedAreaGraph from "../components/StackedAreaGraph.vue"
import {ChartData} from "../models/chart-data.model"
import {TotalDeaths} from "../models/total-deaths.model"
import Chart from "../components/Chart.vue";
import {PcrPlusDeaths} from "../models/pcr-plus-deaths.model";
import LabeledSelect from "../components/LabeledSelect.vue";
import LabeledCheckbox from "../components/LabeledCheckbox.vue";
import AreaGraph from "../components/AreaGraph.vue";
import {usePcrPlusDeathsApi} from "../apis/pcr-plus-deaths.api";

export default defineComponent({
  name: "DeathsStatsView",
  components: {AreaGraph, LabeledCheckbox, LabeledSelect, Chart, StackedAreaGraph},

  setup() {
    const totalDeathsChartDataRef = ref([] as ChartData[])
    const pcrPlusDeathsChartDataRef = ref([] as ChartData[])

    const groupedAgeGroupsCheckboxesRef = ref()
    const groupedAgeGroups = [
      [{name: "0-30", color: "#00d9ff"}, {name: "30-35", color: "#ff4d4d"}, {name: "35-40", color: "#8cff3f"}, {name: "40-45", color: "#8565e1"}, {name: "45-50", color: "#ffe258"}],
      [{name: "50-55", color: "#007fff"}, {name: "55-60", color: "#e01a1a"}, {name: "60-65", color: "#199f19"}, {name: "65-70", color: "#7f3fff"}, {name: "70-75", color: "#e0b700"}],
      [{name: "75-80", color: "#0020ff"}, {name: "80-85", color: "#ad0404"}, {name: "85-90", color: "#007300"}, {name: "90-95", color: "#572ea8"}, {name: "95 u. mehr", color: "#b99a00"}]
    ]

    const pcrPlusDeathsCheckboxRef = ref()
    const pcrPlus = {name: "PCR+", color: "#000000"}

    const maxYValueRef = ref(0)
    const xLabelsRef = ref([] as string[])
    const ageGroupColorsRef = ref()

    const minYear = 2005;
    const currentYear = (new Date()).getFullYear();
    const fromYearRef = ref((currentYear - 5))
    const toYearRef = ref(currentYear)
    const yearsRef = ref(Array.from(Array(currentYear - minYear + 1), (_, i) => minYear + i))

    const {loadTotalDeaths, totalDeathsResult} = useTotalDeathsApi()
    const {loadPcrPlusDeaths, pcrPlusDeathsResult} = usePcrPlusDeathsApi()

    const loadPcrPlusDeathsData = async () => {
      if (fromYearRef.value > toYearRef.value) {
        return
      }

      loadPcrPlusDeaths(fromYearRef.value, toYearRef.value)
          .then(() => {
            pcrPlusDeathsChartDataRef.value = getPcrPlusDeathsChartData(pcrPlusDeathsResult.value)
          })
    }

    const loadTotalDeathsData = async () => {
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

      loadTotalDeaths(fromYearRef.value, toYearRef.value, ageGroups)
          .then(() => {
            totalDeathsChartDataRef.value = getTotalDeathsChartData(totalDeathsResult.value)
            ageGroupColorsRef.value = getAgeGroupColors(totalDeathsResult.value)
            xLabelsRef.value = [...new Set(totalDeathsChartDataRef.value.map((d: ChartData) => d.x) as string[]).values()]
            maxYValueRef.value = Math.max(...Array.from(getGroupedData(totalDeathsChartDataRef.value).values()) as number[])
          })
    }

    const getTotalDeathsChartData = (data: TotalDeaths[]): ChartData[] => {
      return data.map((deaths => {
        return {
          x: ("0" + deaths.week).slice(-2) + "/" + deaths.year,
          y: deaths.count,
          z: deaths.ageGroup
        } as ChartData
      }))
    }

    const getPcrPlusDeathsChartData = (data: PcrPlusDeaths[]): ChartData[] => {
      return data.map((deaths => {
        return {
          x: ("0" + deaths.week).slice(-2) + "/" + deaths.year,
          y: deaths.count
        } as ChartData
      }))
    }

    const getAgeGroupColors = (data: TotalDeaths[]): String[] => {
      const ageGroups = [...new Set(data.map((deaths: TotalDeaths) => deaths.ageGroup)).values()];

      return groupedAgeGroups.map((value: any[]) => value
          .filter((item: any) => ageGroups.find((ageGroup: String) => ageGroup === item.name))
          .map((item: any) => item.color))
          .flat() as String[]
    }

    const getGroupedData = (data: ChartData[]) => {
      const grouped = new Map()
      for (const d of data) {
        const sum = (grouped.has(d.x) ? grouped.get(d.x) : 0) + d.y
        grouped.set(d.x, sum)
      }

      return grouped
    }

    watchEffect(() => {
      if (groupedAgeGroupsCheckboxesRef.value) {
        loadTotalDeathsData()
      }

      if (pcrPlusDeathsCheckboxRef.value) {
        loadPcrPlusDeathsData()
      }
    })

    pcrPlusDeathsCheckboxRef.value = {id: pcrPlus.name, name: pcrPlus.name + " anzeigen", checked: true}

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
            checked: true
          } as any
        })
    )

    return {
      totalDeathsChartDataRef,
      pcrPlusDeathsChartDataRef,
      fromYearRef,
      toYearRef,
      yearsRef,
      groupedAgeGroupsCheckboxesRef,
      pcrPlusDeathsCheckboxRef,
      maxYValueRef,
      xLabelsRef,
      ageGroupColorsRef
    }
  }
})
</script>

<template>
  <article id="deaths-stats-view">
    <div class="death-stats">
      <Chart id="deaths-stats-chart" :xLabels="xLabelsRef" :maxYValue="maxYValueRef">
        <template v-slot:graph>
          <StackedAreaGraph
              :xLabels="xLabelsRef"
              :maxYValue="maxYValueRef"
              :chartData="totalDeathsChartDataRef"
              :colors="ageGroupColorsRef"
          >
          </StackedAreaGraph>
          <AreaGraph
              :xLabels="xLabelsRef"
              :maxYValue="maxYValueRef"
              :chartData="pcrPlusDeathsChartDataRef"
          >
          </AreaGraph>
        </template>
        <template v-slot:legend>
          <div class="death-stats__legend">
            <ul class="legend__years">
              <li>
                <LabeledSelect id="from-year" label="Von Anfang " v-model="fromYearRef" :options="yearsRef">
                </LabeledSelect>
              </li>
              <li>
                <LabeledSelect id="to-year" label="Bis Ende " v-model="toYearRef" :options="yearsRef">
                </LabeledSelect>
              </li>
            </ul>
            <ul v-for="group in groupedAgeGroupsCheckboxesRef" class="legend__age-groups">
              <li v-for="checkbox in group">
                <LabeledCheckbox
                    :id="checkbox.id"
                    :label="checkbox.name + ' Jährige'"
                    v-model="checkbox.checked"
                >
                </LabeledCheckbox>
              </li>
            </ul>
            <ul>
              <li>
                <LabeledCheckbox
                    :id="pcrPlusDeathsCheckboxRef.id"
                    :label="pcrPlusDeathsCheckboxRef.name"
                    v-model="pcrPlusDeathsCheckboxRef.checked"
                >
                </LabeledCheckbox>
              </li>
            </ul>
          </div>
        </template>
        <template v-slot:info>
          <div class="death-stats__reference">
            <b>Quellen:</b><br>
            <span>Statistisches Bundesamt (<a href="https://www.destatis.de" target="_blank">www.destatis.de</a>)</span>
          </div>
        </template>
      </Chart>
    </div>
  </article>
</template>

<style lang="scss">
.death-stats {
  &__legend {
    ul {
      li {
        .labeled-select {
          margin-right: 24px;
        }

        .labeled-checkbox input {
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
            background-color: #00d9ff;
          }

          &#age-group-30:checked + label::before {
            background-color: #ff4d4d;
          }

          &#age-group-35:checked + label::before {
            background-color: #8cff3f;
          }

          &#age-group-40:checked + label::before {
            background-color: #8565e1;
          }

          &#age-group-45:checked + label::before {
            background-color: #ffe258;
          }

          &#age-group-50:checked + label::before {
            background-color: #007fff;
          }

          &#age-group-55:checked + label::before {
            background-color: #e01a1a;
          }

          &#age-group-60:checked + label::before {
            background-color: #199f19;
          }

          &#age-group-65:checked + label::before {
            background-color: #7f3fff;
          }

          &#age-group-70:checked + label::before {
            background-color: #e0b700;
          }

          &#age-group-75:checked + label::before {
            background-color: #0020ff;
          }

          &#age-group-80:checked + label::before {
            background-color: #ad0404;
          }

          &#age-group-85:checked + label::before {
            background-color: #007300;
          }

          &#age-group-90:checked + label::before {
            background-color: #572ea8;
          }

          &#age-group-95:checked + label::before {
            background-color: #b99a00;
          }

          &#pcr-plus:checked + label::before {
            background-color: #000000;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.death-stats {
  margin: 0 32px;

  &__legend {
    display: flex;
    justify-content: flex-start;
    margin: 0 128px;

    ul {
      list-style: none;
      min-width: 168px;
      margin: 0;
      padding: 0;

      li {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        height: 24px;
        position: relative;
      }
    }

    .legend__years {
      li {
        align-items: flex-end;
        margin-bottom: 8px;

        label {
          margin-right: 4px;
          width: 88px;
          text-align: right;
        }
      }
    }

    .legend__age-groups {
      li {
        margin-bottom: 2px;
      }
    }
  }
}
</style>
