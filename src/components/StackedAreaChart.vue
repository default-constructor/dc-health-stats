<script lang="ts">
import {defineComponent, ref} from "vue";
import {Area, Chart, Grid, Group, Line} from "vue3-charts";
import {ChartData} from "../models/chart-data.model";

export default defineComponent({
  name: 'StackedAreaChart',
  components: {Group, Chart, Grid, Area, Line},
  props: {
    chartData: {
      type: Map,
      required: true
    }
  },

  setup(props) {
    console.log("setup", props)

    let data = props.chartData.get("80-85") as ChartData[]

    const chartData = ref(data)
    const direction = ref('horizontal')
    const margin = ref({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    })
    const axis = ref({
      primary: {
        type: 'band',
        rotate: true
      },
      secondary: {
        domain: ['dataMin', 'dataMax'],
        type: 'linear',
        ticks: 8
      }
    })

    return {
      chartData,
      direction,
      margin,
      axis
    }
  }
})
</script>

<template>
  <div class="stacked-area-chart">
    <div class="stacked-area-chart__graph">
      <div class="graph">
        <Chart
            :size="{width: 1280, height: 512}"
            :data="chartData"
            :margin="margin"
            :direction="direction"
            :axis="axis"
        >
          <template #layers>
            <Grid strokeDasharray="2,2"/>
            <Group stacked>
              <Group>
                <Area :data-keys="['x', 'y']" type="normal" :area-style="{ fill: 'red' }"/>
                <Line :data-keys="['x', 'y']" hide-dot type="normal" :line-style="{stroke: 'red', strokeWidth: 1}"/>
              </Group>
            </Group>
          </template>
        </Chart>
      </div>
    </div>
    <div class="stacked-area-chart__legend">

    </div>
  </div>
</template>

<style lang="scss">

</style>
