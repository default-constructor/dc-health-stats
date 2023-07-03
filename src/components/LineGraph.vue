<script lang="ts" setup>
import {watchEffect} from "vue"
import {Line, line, select} from "d3"
import {ChartData} from "@/models/chart-data.model"

const props = defineProps({
  scale: Object,
  xLabels: Array,
  chartData: Array
})

const createGraph = (scale: any, data: ChartData[]) => {
  const graph = select(".line-graph")
  graph.selectChild().remove()

  const lineGraph = graph.append("g").attr("class", "line-graph__line")

  lineGraph.append("path")
      .datum(data)
      .style("fill", "#00000000")
      .style("stroke-width", "2")
      .style("stroke", "#be1380")
      .attr("d", createLine(scale))
}

const createLine = (scale: any): Line<any> => {
  return line()
      .x((d: any) => scale.x(d.x))
      .y((d: any) => scale.y(d.y))
}

watchEffect(() => {
  if (props.scale && props.chartData) {
    createGraph(props.scale as any, props.chartData as ChartData[])
  }
})
</script>

<template>
  <g class="line-graph"></g>
</template>

<style lang="scss">

</style>
