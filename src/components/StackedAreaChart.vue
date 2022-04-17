<script lang="ts">
import {defineComponent, onMounted} from "vue"
import {ChartData} from "../models/chart-data.model"
import {
  area,
  axisBottom,
  axisLeft,
  group,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  schemeCategory10,
  select,
  stack
} from "d3";

export default defineComponent({
  name: 'StackedAreaChart',
  components: {},
  props: {
    chartData: {
      type: Array,
      required: true
    }
  },

  setup(props) {
    onMounted(() => {
      const margin = {left: 4, top: 4, right: 4, bottom: 4}
      const size = {width: 1024, height: 512}
      const chart = {
        width: size.width - margin.left - margin.right,
        height: size.height - margin.top - margin.bottom
      }

      let data = props.chartData as ChartData[]
      let xLabels = [...new Set(data.map((d: ChartData) => d.x as string))]
      const zLabels = [...new Set(data.map((d: ChartData) => d.z as string))]

      const xScale = scaleBand().domain(xLabels).range([0, chart.width])
      const yScale = scaleLinear().domain([0, 30000]).range([chart.height, 0])
      const zScale = scaleOrdinal().domain(zLabels).range(schemeCategory10)

      const svg = createSvg(size, margin)

      svg.append("g")
          .attr("transform", "translate(0," + chart.height + ")")
          .call(axisBottom(xScale).ticks(24))

      svg.append("g")
          .call(axisLeft(yScale).ticks(10))

      svg.selectAll("layers")
          .data(createStack(data, zLabels))
          .enter()
          .append("path")
          .style("fill", (d: any) => zScale(zLabels[d.key - 1]))
          .attr("d", createArea(xScale, yScale))
    })

    const createArea = (xScale: any, yScale: any) => {
      return area()
          .x((d: any) => xScale(d.data[0]))
          .y0((d: any[]) => yScale(d[0]))
          .y1((d: any[]) => yScale(d[1]))
    }

    const createStack = (data: ChartData[], zLabels: string[]) => {
      const groupedData = group(data, (d: ChartData) => d.x)

      return stack()
          .keys(zLabels.map((label: string, index: number) => index + 1))
          .value((d: any, key: number) => d[1][key - 1].y)
          (groupedData)
    }

    const createSvg = (size: any, margin: any) => {
      return select("#stacked-area-graph")
          .append("svg")
          .attr("width", size.width)
          .attr("height", size.height)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    }

    return {}
  }
})
</script>

<template>
  <div class="stacked-area-chart">
    <div class="stacked-area-chart__graph">
      <div id="stacked-area-graph"></div>
    </div>
    <div class="stacked-area-chart__legend">

    </div>
  </div>
</template>

<style lang="scss">

</style>
