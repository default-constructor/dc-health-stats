<script lang="ts">
import {defineComponent, watchEffect} from "vue"
import {ChartData} from "../models/chart-data.model"
import {area, group, scaleLinear, scaleOrdinal, scalePoint, schemeCategory10, select, stack, sum} from "d3"
import {Area} from "d3-shape"

export default defineComponent({
  name: "StackedAreaGraph",
  components: {},
  props: {
    xLabels: Array,
    maxYValue: Number,
    chartData: {
      type: Array,
      required: true
    },
    colors: {
      type: Array
    }
  },

  setup(props) {
    const margin = {left: 64, top: 16, right: 64, bottom: 64}
    const size = {width: 1280, height: 512}
    const chart = {
      width: size.width - margin.left - margin.right,
      height: size.height - margin.top - margin.bottom
    }

    const createGraph = (
        data: ChartData[],
        xLabels: string[],
        maxYValue: number,
        zLabels: string[],
        zColors: string[]
    ) => {
      const xScale = scalePoint().domain(xLabels).align(0).range([0, chart.width])
      const yScale = scaleLinear().domain([0, maxYValue]).range([chart.height, 0])
      const areaColors = (zColors && zColors.length > 0 ? zColors : schemeCategory10)
          .map((color: string) => color + "99")
      const zScale = scaleOrdinal(areaColors).domain(zLabels).range(areaColors)

      const graph = select(".stacked-area-graph")
      graph.selectChild().remove()

      const graphArea = graph.append("g").attr("class", "stacked-area-graph__area")

      graphArea.selectAll("layers")
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

    watchEffect(() => {
      const data = props.chartData as ChartData[]
      const zLabels = [...new Set(data.map((d: ChartData) => d.z) as string[]).values()]
      const zColors = [...new Set(props.colors as string[]).values()]

      createGraph(data, props.xLabels as string[], props.maxYValue as number, zLabels, zColors)
    })

    return {}
  }
})
</script>

<template>
  <g class="stacked-area-graph"></g>
</template>

<style lang="scss">

</style>
