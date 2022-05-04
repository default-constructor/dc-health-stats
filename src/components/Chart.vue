<script lang="ts">
import {defineComponent, ref, watchEffect} from "vue"
import {axisBottom, axisLeft, scaleLinear, scalePoint, select} from "d3"

export default defineComponent({
  name: "Chart",
  props: {
    xLabels: {
      type: Array,
      required: true
    },
    maxYValue: {
      type: Number,
      required: true
    }
  },

  setup(props) {
    const sizeRef = ref({width: 1280, height: 512})
    const marginRef = ref({left: 64, top: 16, right: 64, bottom: 64})
    const chart = {
      width: sizeRef.value.width - marginRef.value.left - marginRef.value.right,
      height: sizeRef.value.height - marginRef.value.top - marginRef.value.bottom
    }

    const createChart = (xLabels: string[]) => {
      const xScale = scalePoint().domain(xLabels).align(0).range([0, chart.width])
      const maxYValue = props.maxYValue
      const yScale = scaleLinear().domain([0, maxYValue + (maxYValue * 5 / 100)]).range([chart.height, 0])

      const chartArea = select("#chart-area")

      const areaScale = chartArea.select(".area__scale")
      areaScale.selectChild().remove()

      const scaleArea = areaScale.append("g").attr("class", "scale__area")

      scaleArea
          .append("g")
          .attr("transform", "translate(0," + chart.height + ")")
          .call(axisBottom(xScale).tickValues(getXTickValues(xLabels)))
          .selectAll("text")
          .attr("x", -24)
          .attr("y", 8)
          .attr("dy", ".5em")
          .attr("transform", "rotate(-45)")

      scaleArea.append("g").call(axisLeft(yScale))

      const areaGrid = chartArea.select(".area__grid")
      areaGrid.selectChild().remove()

      const gridArea = areaGrid.append("g").attr("class", "grid__area")

      gridArea
          .append("g")
          .attr("class", "grid grid--x")
          .attr("transform", "translate(0," + chart.height + ")")
          .call(axisBottom(xScale).tickSize(-chart.height).tickFormat(() => ""))

      gridArea
          .append("g")
          .attr("class", "grid grid--y")
          .call(axisLeft(yScale).tickSize(-chart.width).tickFormat(() => ""))
    }

    const getXTickValues = (xLabels: string[]) => {
      if (xLabels.length <= 53) {
        return xLabels
      }

      const offset = Math.trunc(xLabels.length / 53)
      return xLabels.filter((label: string) =>
          parseInt(label.substring(0, label.indexOf("/"))) % offset == 0
      )
    }

    watchEffect(() => {
      createChart(props.xLabels as string[])
    })

    return {
      sizeRef,
      marginRef
    }
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
          <slot name="graph"></slot>
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
.chart {
  &__area {
    .area {
      &__grid {
        .grid {
          line {
            stroke: lightgrey;
            stroke-opacity: 0.7;
            shape-rendering: crispEdges;
          }

          path {
            stroke-width: 0
          }
        }
      }
    }
  }
}
</style>
