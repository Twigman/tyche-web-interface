<template>
  <div class="w-full mt-4">
    <LineChart v-if="chartData.datasets.length" v-bind="lineChartProps" class="max-h-80" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LineChart, useLineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
import type { SensorState } from '@/types/Sensor'

const props = defineProps<{
  stateDataSets: Record<string, { name: string; data: SensorState[] }>
}>()

// color list
const colors = ['#22d3ee', '#60a5fa', '#facc15', '#ef4444', '#10b981', '#8b5cf6']

Chart.register(...registerables)

const chartData = computed(() => ({
  labels:
    Object.values(props.stateDataSets)[0].data?.map((state) =>
      new Date(state.lastupdated).toLocaleTimeString(),
    ) || [],
  datasets: Object.keys(props.stateDataSets).map((sensorId, index) => ({
    label: `${props.stateDataSets[sensorId].name}`,
    data: props.stateDataSets[sensorId].data.map((state) => (state.temperature ?? 0) / 100), // convert temperature
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length] + '40',
    tension: 0.4,
    fill: false,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
  },
  scales: {
    x: { title: { display: true, text: 'Time' } },
    y: { title: { display: true, text: 'Temperature (°C)' }, beginAtZero: false },
  },
}))

// use hook
const { lineChartProps } = useLineChart({
  chartData,
  options: chartOptions,
})
</script>

<style scoped></style>
