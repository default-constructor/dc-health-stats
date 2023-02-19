<script setup lang="ts">
import {reactive, ref, toRefs, watch, watchEffect} from "vue"
import {useTotalDeathsApi} from "@/apis/total-deaths.api"
import StackedAreaGraph from "@/components/StackedAreaGraph.vue"
import {ChartData} from "@/models/chart-data.model"
import {TotalDeaths} from "@/models/total-deaths.model"
import Chart from "@/components/Chart.vue"
import {PcrPlusDeaths} from "@/models/pcr-plus-deaths.model"
import LabeledSelect from "@/components/LabeledSelect.vue"
import LabeledCheckbox from "@/components/LabeledCheckbox.vue"
import AreaGraph from "@/components/AreaGraph.vue"
import {usePcrPlusDeathsApi} from "@/apis/pcr-plus-deaths.api"
import VerticalLine from "@/components/VerticalLine.vue"
import LineGraph from "@/components/LineGraph.vue"
import {useExcessMortalityApi} from "@/apis/excess-mortality.api";
import {ExcessMortality} from "@/models/excess-mortality.model";

console.log("DeathsStatsView");

const totalDeathsRef = ref()
const totalDeathsChartDataRef = ref([] as ChartData[])
const pcrPlusDeathsChartDataRef = ref([] as ChartData[])
const noPcrPlusDeathsChartDataRef = ref([] as ChartData[])
const excessMortalityRef = ref()
const excessMortalityChartDataRef = ref([] as ChartData[])
const yearLinesDataRef = ref()

const groupedAgeGroups = [
  [{name: "0-30", color: "#00d9ff"}, {name: "30-35", color: "#ff4d4d"}, {name: "35-40", color: "#8cff3f"}, {name: "40-45", color: "#8565e1"}, {name: "45-50", color: "#ffe258"}],
  [{name: "50-55", color: "#007fff"}, {name: "55-60", color: "#e01a1a"}, {name: "60-65", color: "#199f19"}, {name: "65-70", color: "#7f3fff"}, {name: "70-75", color: "#e0b700"}],
  [{name: "75-80", color: "#0020ff"}, {name: "80-85", color: "#ad0404"}, {name: "85-90", color: "#007300"}, {name: "90-95", color: "#572ea8"}, {name: "95 u. mehr", color: "#b99a00"}]
]
const groupedAgeGroupsCheckboxesRef = ref(groupedAgeGroups.map((value: any[]) =>
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
))

const ageGroupsCheckboxRef = reactive({id: "age-groups", name: "Altersgruppen anzeigen", checked: false})
const pcrPlusDeathsCheckboxRef = reactive({id: "pcr-plus-deaths", name: "PCR+ anzeigen", checked: false})
const noPcrPlusDeathsCheckboxRef = reactive({id: "no-pcr-plus-deaths", name: "Ohne PCR+ anzeigen", checked: false})
const excessMortalityCheckboxRef = reactive({id: "excess-mortality", name: "Übersterblichkeit anzeigen", checked: false})

const maxPositiveYValueRef = ref(0)
const maxNegativeYValueRef = ref(0)
const xLabelsRef = ref([] as string[])
const ageGroupColorsRef = ref()

const minYear = 2005;
const currentYear = (new Date()).getFullYear();
const fromYearRef = ref((currentYear - 5))
const toYearRef = ref(currentYear)
const yearsRef = ref(Array.from(Array(currentYear - minYear + 1), (_, i) => minYear + i))

const {loadTotalDeaths, totalDeathsResult} = useTotalDeathsApi()
const {loadPcrPlusDeaths, pcrPlusDeathsResult} = usePcrPlusDeathsApi()
const {loadExcessMortalities, excessMortalitiesResult} = useExcessMortalityApi()

const getYearLinesData = (data: TotalDeaths[], maxYValue: number): ChartData[] => {
  return data
      .filter((deaths: TotalDeaths) => deaths.week === 1)
      .map((deaths: TotalDeaths) => ("0" + deaths.week).slice(-2) + "/" + deaths.year)
      .filter((label: string, index: number, self: string[]) => self.indexOf(label) === index)
      .map((label: string) => {
        return {
          x: label,
          y: maxYValue + 1500
        } as ChartData
      });
}

const retrieveAgeGroups = () => {
  return groupedAgeGroupsCheckboxesRef.value
      .map((checkboxGroup: any[]) => checkboxGroup
          .filter((checkbox: any) => checkbox.checked)
          .map((checkbox: any) => checkbox.name)
      )
      .flat() as string[]
}

const loadPcrPlusDeathsData = () => {
  if (!pcrPlusDeathsCheckboxRef.checked || fromYearRef.value > toYearRef.value) {
    return
  }

  loadPcrPlusDeaths(fromYearRef.value, toYearRef.value)
      .then(() => {
        pcrPlusDeathsChartDataRef.value = getPcrPlusDeathsChartData(pcrPlusDeathsResult.value)
      })
}

const loadTotalDeathsData = () => {
  if (!ageGroupsCheckboxRef.checked || fromYearRef.value > toYearRef.value) {
    return
  }

  loadTotalDeaths(fromYearRef.value, toYearRef.value, retrieveAgeGroups())
      .then(() => {
        totalDeathsRef.value = totalDeathsResult.value
        totalDeathsChartDataRef.value = getTotalDeathsChartData(totalDeathsResult.value)
        ageGroupColorsRef.value = getAgeGroupColors(totalDeathsResult.value)
        xLabelsRef.value = [...new Set(totalDeathsChartDataRef.value.map((d: ChartData) => d.x) as string[]).values()]
        maxPositiveYValueRef.value = Math.max(...Array.from(getGroupedData(totalDeathsChartDataRef.value).values()) as number[])
        yearLinesDataRef.value = getYearLinesData(totalDeathsResult.value, maxPositiveYValueRef.value)
      })
}

const retrieveExcessMortalityChartData = (data: ExcessMortality[]): ChartData[] => {
  return data.map((deaths => {
    return {
      x: ("0" + deaths.week).slice(-2) + "/" + deaths.year,
      y: deaths.rate
    } as ChartData
  }))
}

const loadExcessMortalityData = () => {
  if (!excessMortalityCheckboxRef.checked || fromYearRef.value > toYearRef.value) {
    return
  }

  loadExcessMortalities(fromYearRef.value, toYearRef.value, retrieveAgeGroups())
      .then(() => {
        excessMortalityRef.value = excessMortalitiesResult.value
        excessMortalityChartDataRef.value = retrieveExcessMortalityChartData(excessMortalitiesResult.value)
        maxNegativeYValueRef.value = Math.min(...Array.from(getGroupedData(excessMortalityChartDataRef.value).values()) as number[])
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

const setNoPcrPlusDeathsData = () => {
  const yearlyDeaths = new Map()
  if (totalDeathsResult.value) {
    totalDeathsResult.value.forEach((deaths: any) => {
      console.log(deaths)
      if (!yearlyDeaths.get(deaths.year)) {
        yearlyDeaths.set(deaths.year, undefined)
      }

      yearlyDeaths.get(deaths.year)
    })
  }
}

watch(ageGroupsCheckboxRef, (ageGroupsCheckbox) => {
  console.log("DeathsStatsView", "watch", "ageGroupsCheckbox", "checked", ageGroupsCheckbox.checked)
  loadTotalDeathsData()
})

watch(pcrPlusDeathsCheckboxRef, (pcrPlusDeathsCheckbox) => {
  console.log("DeathsStatsView", "watch", "pcrPlusDeathsCheckboxRef", "checked", pcrPlusDeathsCheckbox.checked)
  loadPcrPlusDeathsData()
})

watch(excessMortalityCheckboxRef, (excessMortalityCheckbox) => {
  console.log("DeathsStatsView", "watch", "excessMortalityCheckboxRef", "checked", excessMortalityCheckbox.checked)
  loadExcessMortalityData()
})

watchEffect(() => {
  if (fromYearRef.value || toYearRef.value) {
    loadTotalDeathsData()
    loadPcrPlusDeathsData()
    loadExcessMortalityData()
  }
})

pcrPlusDeathsCheckboxRef.checked = true
ageGroupsCheckboxRef.checked = true
</script>

<template>
  <article id="deaths-stats-view">
    <div class="death-stats">
      <Chart id="deaths-stats-chart" :xLabels="xLabelsRef" :maxPositiveYValue="maxPositiveYValueRef" :maxNegativeYValue="maxNegativeYValueRef">
        <template v-slot:graph="slotProps">
          <StackedAreaGraph
              v-if="ageGroupsCheckboxRef.checked"
              :scale="slotProps.scale"
              :chartData="totalDeathsChartDataRef"
              :colors="ageGroupColorsRef"
          >
          </StackedAreaGraph>
          <AreaGraph
              v-if="pcrPlusDeathsCheckboxRef.checked"
              :scale="slotProps.scale"
              :chartData="pcrPlusDeathsChartDataRef"
          >
          </AreaGraph>
          <LineGraph
              v-if="excessMortalityCheckboxRef.checked"
              :scale="slotProps.scale"
              :chartData="excessMortalityChartDataRef"
          >
          </LineGraph>
          <VerticalLine :scale="slotProps.scale" :data="yearLinesDataRef"></VerticalLine>
        </template>
        <template v-slot:legend>
          <div class="death-stats__legend">
            <ul class="legend__years">
              <li>
                <LabeledSelect id="from-year" label="Von Anfang" v-model="fromYearRef" :options="yearsRef">
                </LabeledSelect>
              </li>
              <li>
                <LabeledSelect id="to-year" label="Bis Ende" v-model="toYearRef" :options="yearsRef">
                </LabeledSelect>
              </li>
              <li>
                <LabeledCheckbox
                    :id="ageGroupsCheckboxRef.id"
                    :label="ageGroupsCheckboxRef.name"
                    v-model="ageGroupsCheckboxRef.checked"
                >
                </LabeledCheckbox>
              </li>
              <li>
                <LabeledCheckbox
                    :id="excessMortalityCheckboxRef.id"
                    :label="excessMortalityCheckboxRef.name"
                    v-model="excessMortalityCheckboxRef.checked"
                >
                </LabeledCheckbox>
              </li>
              <li>
                <LabeledCheckbox
                    :id="pcrPlusDeathsCheckboxRef.id"
                    :label="pcrPlusDeathsCheckboxRef.name"
                    v-model="pcrPlusDeathsCheckboxRef.checked"
                >
                </LabeledCheckbox>
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
          </div>
        </template>
        <template v-slot:info>
          <div class="death-stats__reference">
            <strong>Quellen:</strong><br>
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
        .labeled-checkbox,
        .labeled-select {
          margin-right: 24px;
        }
      }

      &.legend__age-groups {
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
        width: 100%;
        height: 24px;
        position: relative;
      }
    }

    .legend__years {
      li {
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
