<script lang="ts">
import {defineComponent, watchEffect} from "vue"
import {ChartData} from "@/models/chart-data.model"
import {area, group, scaleOrdinal, schemeCategory10, select, stack, sum} from "d3"
import {Area} from "d3-shape"

export default defineComponent({
  name: "StackedAreaGraph",
  components: {},
  props: {
    scale: Object,
    chartData: {
      type: Array,
      required: true
    },
    colors: {
      type: Array
    }
  },

  setup(props) {
    const createGraph = (scale: any, data: ChartData[], zLabels: string[], zColors: string[]) => {
      const areaColors = (zColors && zColors.length > 0 ? zColors : schemeCategory10)
          .map((color: string) => color + "99")
      const zScale = scaleOrdinal(areaColors).domain(zLabels).range(areaColors)

      const graph = select(".stacked-area-graph")
      graph.selectChild().remove()

      const stackedAreaGraph = graph.append("g").attr("class", "stacked-area-graph__area")

      stackedAreaGraph.selectAll("layers")
          .data(createStack(data))
          .enter()
          .append("path")
          .style("fill", (d: any, key: any) => zScale(zLabels[key]))
          .attr("d", createArea(scale))
    }

    const createArea = (scale: any): Area<any> => {
      return area()
          .x((d: any) => scale.x(d.data['x']))
          .y0((d: any[]) => scale.y(d[0]))
          .y1((d: any[]) => scale.y(d[1]))
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
      if (props.scale && props.chartData && props.colors) {
        const data = props.chartData as ChartData[]
        createGraph(
            props.scale as any,
            data,
            [...new Set(data.map((d: ChartData) => d.z) as string[]).values()],
            props.colors as string[]
        )
      }
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
