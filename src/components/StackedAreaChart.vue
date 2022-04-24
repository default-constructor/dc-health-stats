<script lang="ts">
import {defineComponent, watchEffect} from "vue"
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
  stack,
  sum
} from "d3"
import {Area} from "d3-shape"

export default defineComponent({
  name: 'StackedAreaChart',
  components: {},
  props: {
    chartData: {
      type: Array,
      required: true
    },
    colors: {
      type: Array
    }
  },

  setup(props) {
    const margin = {left: 64, top: 16, right: 64, bottom: 16}
    const size = {width: 1280, height: 512}
    const chart = {
      width: size.width - margin.left - margin.right,
      height: size.height - margin.top - margin.bottom
    }

    const createChart = (data: ChartData[], xLabels: string[], zLabels: string[], zColors: string[]) => {
      const xScale = scaleBand().domain(xLabels).range([0, chart.width])
      const maxYScale = getMaxYScale(data)
      const yScale = scaleLinear().domain([0, maxYScale]).range([chart.height, 0])
      const areaColors = zColors && zColors.length > 0 ? zColors : schemeCategory10
      const zScale = scaleOrdinal(areaColors).domain(zLabels).range(areaColors)

      const svg = createSvg(size, margin)

      svg.append("g")
          .attr("transform", "translate(0," + chart.height + ")")
          .call(axisBottom(xScale).ticks(52))

      svg.append("g")
          .call(axisLeft(yScale))

      svg.selectAll("layers")
          .data(createStack(data))
          .enter()
          .append("path")
          .style("fill", (d: any, key: any) => zScale(zLabels[key]))
          .attr("d", createArea(xScale, yScale))
    }

    const createArea = (xScale: any, yScale: any): Area<any> => {
      return area()
          .x((d: any) => xScale(d.data['x']))
          .y0((d: any[]) => yScale(d[0]))
          .y1((d: any[]) => yScale(d[1]))
    }

    const getMaxYScale = (data: ChartData[]): number => {
      const grouped = new Map()
      for (const d of data) {
        const sum = (grouped.has(d.x) ? grouped.get(d.x) : 0) + d.y
        grouped.set(d.x, sum)
      }

      return Math.max(...Array.from(grouped.values()) as number[])
    }

    const createStack = (data: ChartData[]) => {
      const groupedMap = group(data, (d: ChartData) => d.x, (d: ChartData) => d.z)
      const stackKeys = Array.from(new Set(data.map(d => d.z)).values()).sort()

      const reducer = (v: any[]) => sum(v, d => d.y)

      const tabledData = Array.from(groupedMap.entries())
          .map(group => {
            const obj = {} as any
            obj['x'] = group[0]
            for (let col of stackKeys) {
              const vals = group[1].get(col)
              obj[col] = !vals ? 0 : reducer(Array.from(vals.values()))
            }

            return obj
          })
          .sort((a, b) => a['x'] - b['x'])

      return stack()
          .keys(stackKeys)
          .value((d: any, key: string) => d[key])
          (tabledData)
    }

    const createSvg = (size: any, margin: any) => {
      let selection = select("#stacked-area-graph")
      selection.selectChild().remove()

      return selection
          .append("svg")
          .attr("width", size.width)
          .attr("height", size.height)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    }

    watchEffect(() => {
      const data = props.chartData as ChartData[]
      const xLabels = [...new Set(data.map((d: ChartData) => d.x) as string[]).values()]
      const zLabels = [...new Set(data.map((d: ChartData) => d.z) as string[]).values()]
      const zColors = [...new Set(props.colors as string[]).values()]

      createChart(data, xLabels, zLabels, zColors)
    })

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
