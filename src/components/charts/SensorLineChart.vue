<template>
  <div class="w-full mt-4">
    <LineChart v-if="chartData.datasets.length" v-bind="lineChartProps" class="max-h-80" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LineChart, useLineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
import type { GeneralSensorState } from '@/types/Sensor'

const props = defineProps<{
  stateDataSets: Record<string, { name: string; data: GeneralSensorState[] }>
  yLabel: string
  colors: string[]
  unit: string
}>()

Chart.register(...registerables)

const chartData = computed(() => ({
  datasets: Object.keys(props.stateDataSets).map((sensorId, index) => ({
    label: `${props.stateDataSets[sensorId].name}`,
    data: props.stateDataSets[sensorId].data.map((state) => ({
      x: new Date(state.lastupdated).getTime(), // time in ms
      y: state.value,
    })),
    borderColor: props.colors[index % props.colors.length],
    backgroundColor: props.colors[index % props.colors.length] + '40',
    tension: 0.4,
    fill: false,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  animation: {
    duration: 1000,
    easing: 'easeInOutQuad',
  },
  transitions: {
    active: {
      animation: { duration: 0 },
    },
  },
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (tooltipItems: any) => {
          if (!tooltipItems.length) return ''
          const timestamp = tooltipItems[0].raw?.x as number
          return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: (tooltipItem: any) => {
          return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y.toFixed(1)} ${props.unit}`
        },
      },
    },
  },
  scales: {
    x: {
      type: 'linear',
      ticks: {
        callback: (value: number) => {
          return new Date(value).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        },
      },
      title: { display: true, text: 'Time' },
    },
    y: {
      title: { display: true, text: `${props.yLabel} (${props.unit})` },
      beginAtZero: false,
    },
  },
}))

// use hook
const { lineChartProps } = useLineChart({
  chartData,
  options: chartOptions,
})
</script>

<style scoped></style>
