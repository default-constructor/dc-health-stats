<script lang="ts" setup>
import {ref, watchEffect} from "vue"
import {ChartData} from "../models/chart-data.model"
import {axisBottom, axisLeft, scaleBand, scaleLinear, select} from "d3"

const props = defineProps({
  scale: Object,
  xLabels: Array,
  maxPositiveYValue: Number,
  chartData: Array
})

const scaleRef = ref()
const sizeRef = ref({width: 1280, height: 512})
const marginRef = ref({left: 64, top: 16, right: 64, bottom: 64})
const chart = {
  width: sizeRef.value.width - marginRef.value.left - marginRef.value.right,
  height: sizeRef.value.height - marginRef.value.top - marginRef.value.bottom
}

const createChart = (scale: any, tickValues: string[]) => {
  const chartArea = select("#chart-area")
  const areaScale = chartArea.select(".area__scale")
  areaScale.selectChild().remove()

  const scaleArea = areaScale.append("g").attr("class", "scale__area")

  scaleArea
      .append("g")
      .attr("transform", "translate(0," + chart.height + ")")
      .call(axisBottom(scale.x).tickValues(tickValues))
      .selectAll("text")
      .attr("x", -24)
      .attr("y", 8)
      .attr("dy", ".5em")
      .attr("transform", "rotate(-45)")

  scaleArea.append("g").call(axisLeft(scale.y))

  const areaGrid = chartArea.select(".area__grid")
  areaGrid.selectChild().remove()

  const gridArea = areaGrid.append("g").attr("class", "grid__area")

  gridArea
      .append("g")
      .attr("class", "grid grid--x")
      .attr("transform", "translate(0," + chart.height + ")")
      .call(axisBottom(scale.x).tickSize(-chart.height).tickValues(tickValues).tickFormat(() => ""))

  gridArea
      .append("g")
      .attr("class", "grid grid--y")
      .call(axisLeft(scale.y).tickSize(-chart.width).tickFormat(() => ""))
}

const createGraph = (scale: any, data: ChartData[]) => {
  const graph = select(".bar-graph")
  graph.selectChild().remove()

  const barGraph = graph.append("g").attr("class", "bar-graph__area")

  console.log("bar", data)

  barGraph.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => scale.x(d.x))
      .attr("y", d => scale.y(d.y))
      .attr("height", d => chart.height - scale.y(d.y))
      .attr("width", 40)
      .style("fill", "#00000066")
}

watchEffect(() => {
  if (props.xLabels && props.maxPositiveYValue) {
    scaleRef.value = {
      x: scaleBand().domain(props.xLabels as string[]).rangeRound([0, chart.width]).padding(1),
      y: scaleLinear().domain([0, props.maxPositiveYValue]).range([chart.height, 0])
    }
    createChart(scaleRef.value, props.xLabels as string[])
    createGraph(scaleRef.value, props.chartData as ChartData[])
  }
})
</script>

<template>
  <div class="chart">
    <svg :width="sizeRef.width" :height="sizeRef.height" class="chart__area">
      <g id="chart-area" :transform="'translate(' + marginRef.left + ',' + marginRef.top + ')'" class="area">
        <g class="area__scale"></g>
        <g class="area__grid"></g>
        <g class="area__graph">
          <g class="bar-graph"></g>
        </g>
      </g>
    </svg>
    <div class="chart__legend">
      <slot name="legend"></slot>
    </div>
    <div class="chart__info">
      <slot name="info"></slot>
    </div>
  </div>
</template>

<style lang="scss">

</style>
