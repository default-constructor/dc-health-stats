<script setup lang="ts">
import {reactive, ref} from "vue"
import {ChartData} from "@/models/chart-data.model"
import {useIcd10CasesApi} from "@/apis/icd-10-cases.api"
import {Icd10Cases} from "@/models/icd-10-cases.model";
import BarGraph from "@/components/BarGraph.vue";
import ActionButton from "@/components/ActionButton.vue";

console.log("Icd10StatsView")

const icd10CasesRef = ref()
const icd10CasesChartDataRef = ref([] as ChartData[])

const nocodeCheckboxRef = reactive({id: "nocode", name: "nocode", checked: false})

const maxYValueRef = ref(0)
const xLabelsRef = ref([] as string[])

const codeRef = ref("A00.0")
const minYear = 2016;
const currentYear = (new Date()).getFullYear()
const fromYearRef = ref((currentYear - 6))
const toYearRef = ref(currentYear)
const yearsRef = ref(Array.from(Array(currentYear - minYear + 1), (_, i) => minYear + i))

const {loadIcd10Cases, icd10CasesResult} = useIcd10CasesApi()

const loadIcd10CasesData = () => {
  if (fromYearRef.value > toYearRef.value) {
    return
  }

  let nocode = nocodeCheckboxRef.checked

  loadIcd10Cases(codeRef.value, fromYearRef.value, toYearRef.value, true)
      .then(() => {
        icd10CasesRef.value = icd10CasesResult.value
        icd10CasesChartDataRef.value = getIcd10CodesChartData(icd10CasesResult.value)
        xLabelsRef.value = [...new Set(icd10CasesChartDataRef.value.map((d: ChartData) => d.x) as string[]).values()]
        maxYValueRef.value = Math.max(...Array.from(icd10CasesChartDataRef.value.map((d: ChartData) => d.y).values()) as number[])
      })
}

const getIcd10CodesChartData = (data: Icd10Cases[]): ChartData[] => {
  return data.map(cases => {
    return {
      x: cases.quarter + "/" + cases.year,
      y: cases.count
    } as ChartData
  })
}

loadIcd10CasesData()
</script>

<template>
  <article id="icd-10-cases-view">
    <div class="icd-10-cases">
      <BarGraph
          :chartData="icd10CasesChartDataRef"
          :xLabels="xLabelsRef"
          :maxPositiveYValue="maxYValueRef"
      >
      </BarGraph>
      <input v-model="codeRef">
      <ActionButton label="Go" @click="loadIcd10CasesData"></ActionButton>
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
