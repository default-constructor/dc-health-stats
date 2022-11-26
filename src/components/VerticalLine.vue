<script lang="ts" setup>
import {watchEffect} from "vue"
import {ChartData} from "../models/chart-data.model"
import {select} from "d3"

const props = defineProps({
  scale: Object,
  data: Array,
})

const createGraph = (scale: any, data: ChartData[]) => {
  const line = select(".vertical-line")
  line.selectChild().remove()

  const lineArea = line.append("g").attr("class", "vertical-line__area")

  data.forEach((datum: ChartData) => {
    lineArea.append("line")
        .style("stroke", "#000000")
        .style("stroke-width", "1")
        .attr("x1", scale.x(datum.x))
        .attr("x2", scale.x(datum.x))
        .attr("y1", scale.y(0))
        .attr("y2", scale.y(datum.y))
  })
}

watchEffect(() => {
  if (props.scale && props.data) {
    createGraph(props.scale as any, props.data as ChartData[])
  }
})
</script>

<template>
  <g class="vertical-line"></g>
</template>

<style lang="scss">

</style>
