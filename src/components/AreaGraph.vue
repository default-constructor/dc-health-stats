<script lang="ts" setup>
import {watchEffect} from "vue"
import {ChartData} from "@/models/chart-data.model"
import {area, select} from "d3"
import {Area} from "d3-shape"

const props = defineProps({
  scale: Object,
  xLabels: Array,
  chartData: Array
})

const createGraph = (scale: any, data: ChartData[]) => {
  const graph = select(".area-graph")
  graph.selectChild().remove()

  const areaGraph = graph.append("g").attr("class", "area-graph__area")

  areaGraph.append("path")
      .datum(data)
      .style("stroke-width", "1")
      .style("stroke", "#000000")
      .style("fill", "#00000066")
      .attr("d", createArea(scale))
}

const createArea = (scale: any): Area<any> => {
  return area()
      .x((d: any) => scale.x(d.x))
      .y0(scale.y(0))
      .y1((d: any) => scale.y(d.y))
}

watchEffect(() => {
  if (props.scale && props.chartData) {
    createGraph(props.scale as any, props.chartData as ChartData[])
  }
})
</script>

<template>
  <g class="area-graph"></g>
</template>

<style lang="scss">

</style>
