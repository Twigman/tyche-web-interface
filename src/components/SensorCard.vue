<template>
  <div
    class="p-6 w-56 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white"
  >
    <h2 class="text-xl font-bold text-gray-300 h-12 flex items-center justify-center text-center">
      {{ sensor.name }}
    </h2>
    <hr class="border-white/20 w-full my-2" />

    <p v-if="sensor.state.temperature !== undefined" class="text-gray-100">
      🌡 Temperature: {{ formattedTemperature }}
    </p>
    <p v-if="sensor.state.humidity !== undefined" class="text-gray-100">
      💧 Humidity: {{ formattedHumidity }}
    </p>
    <p class="text-sm text-gray-300 mt-4 text-center">⏱ {{ formattedTime }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Sensor } from '@/types/Sensor'

const props = defineProps<{ sensor: Sensor }>()

const formattedTime = computed(() => new Date(props.sensor.state.lastupdated).toLocaleTimeString())
const formattedHumidity = computed(() =>
  props.sensor.state.humidity !== undefined
    ? (props.sensor.state.humidity / 100).toFixed(1) + '%'
    : 'N/A',
)
const formattedTemperature = computed(() =>
  props.sensor.state.temperature !== undefined
    ? (props.sensor.state.temperature / 100).toFixed(1) + ' °C'
    : 'N/A',
)
</script>
