<template>
    <svg
      class
      viewBox="0 0 160 90"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <g>
        <circle
          v-for="(d, i) in chartPoints"
          :cx="d.x"
          :cy="d.y"
          :key="d.y + ',' + i"
          r="2"
          style="stroke-width: 0;"
          class="stroke-current fill-current"
        ></circle>
      </g>
      <line
        x1="0"
        :y1="interpolateY(target)"
        x2="200"
        :y2="interpolateY(target)"
        class="text-green-500 stroke-current"
        style="stroke-width:1"
        stroke-dasharray="10 5"
      ></line>
      <rect
        v-for="i in maxY"
        x="0"
        :key="i"
        :y="(90 / maxY) * (i - 1)"
        width="160"
        :height="90 / maxY"
        class="fill-current text-blue-200 opacity-25"
        :class="{ hidden: i % 2 === 0 }"
      ></rect>
      <polyline
        :points="chartLine"
        style="stroke-width:0.5;fill:none"
        class="stroke-current"
        stroke-linejoin="round"
        stroke-linecap="round"
      ></polyline>
    </svg>
</template>
<script>
import { scaleLinear } from "d3-scale";

export default {
  props: ["data", "target"],
  methods: {
    interpolateY(v) {
      return scaleLinear()
        .domain([0, this.maxY])
        .range([90, 0])(v);
    },
    interpolateX(v) {
      return scaleLinear()
        .domain([0, 24])
        .range([0, 160])(v);
    },
  },
  computed: {
    maxY() {
      const maxDataPoint = this.data.reduce(
        (max, { y }) => Math.max(max, y),
        this.target
      );
      return Number.isInteger(maxDataPoint)
        ? maxDataPoint + 1
        : Math.ceil(maxDataPoint);
    },
    chartData() {
      return this.data.map(({ x, y }) => ({
        x: this.interpolateX(x),
        y: this.interpolateY(y),
      }));
    },
    chartPoints() {
      const cd = [...this.chartData];
      cd.pop();
      cd.shift();
      return cd;
    },
    chartLine() {
      return this.chartData.map(({ x, y }) => `${x},${y}`);
    },
  },
};
</script>
