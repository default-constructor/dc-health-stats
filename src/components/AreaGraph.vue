<script lang="ts" setup>
import {watchEffect} from "vue"
import {ChartData} from "../models/chart-data.model"
import {area, scaleLinear, scalePoint, select} from "d3"
import {Area} from "d3-shape"

const props = defineProps({
  xLabels: Array,
  maxYValue: Number,
  chartData: Array
})

const margin = {left: 64, top: 16, right: 64, bottom: 64}
const size = {width: 1280, height: 512}
const chart = {
  width: size.width - margin.left - margin.right,
  height: size.height - margin.top - margin.bottom
}

const createGraph = (
    data: ChartData[],
    xLabels: string[],
    maxYValue: number
) => {
  const xScale = scalePoint().domain(xLabels).align(0).range([0, chart.width])
  const yScale = scaleLinear().domain([0, maxYValue]).range([chart.height, 0])

  const graph = select(".area-graph")
  graph.selectChild().remove()

  const graphArea = graph.append("g").attr("class", "area-graph__area")

  graphArea.append("path")
      .datum(data)
      .style("fill", "#00000066")
      .style("stroke", "#000000")
      .style("stroke-width", "1")
      .attr("d", createArea(xScale, yScale))
}

const createArea = (xScale: any, yScale: any): Area<any> => {
  return area()
      .x((d: any) => xScale(d.x))
      .y0(yScale(0))
      .y1((d: any) => yScale(d.y))
}

watchEffect(() => {
  if (props.chartData && props.xLabels && props.maxYValue) {
    createGraph(props.chartData as ChartData[], props.xLabels as string[], props.maxYValue as number)
  }
})
</script>

<template>
  <g class="area-graph"></g>
</template>

<style lang="scss">

</style>
