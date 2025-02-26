<template>
  <div
    class="p-5 w-48 mx-auto bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-lg shadow-cyan-500/10 transition-transform hover:scale-105 will-change-transform"
  >
    <h2
      class="text-xl font-bold text-gray-200 tracking-tight h-12 flex items-center justify-center text-center"
    >
      {{ sensor.name }}
    </h2>

    <hr class="border-white/15 w-full my-3" />

    <div class="sensor-values">
      <div v-if="sensor.state.temperature !== undefined" class="sensor-item">
        <ThermometerIcon class="icon text-red-400" />
        <span class="text-highlight whitespace-nowrap">{{ formattedTemperature }}</span>
      </div>

      <div v-if="sensor.state.humidity !== undefined" class="sensor-item">
        <DropletIcon class="icon text-blue-400" />
        <span class="text-highlight whitespace-nowrap">{{ formattedHumidity }}</span>
      </div>

      <div class="sensor-item">
        <ClockIcon class="icon text-gray-400" />
        <span class="text-sm text-gray-400 whitespace-nowrap">{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Sensor } from '@/types/Sensor'
import { Thermometer, Droplet, Clock } from 'lucide-vue-next'

const ThermometerIcon = Thermometer
const DropletIcon = Droplet
const ClockIcon = Clock

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

<style scoped>
@reference '@/assets/main.css';
/* no linebreak after icon */
.sensor-values {
  @apply flex flex-col gap-2;
}

.sensor-item {
  @apply flex items-center gap-2 flex-nowrap;
}

/* Icon-Styling */
.icon {
  @apply w-5 h-5 transition-colors duration-200;
}

/* Glow for values */
.text-highlight {
  color: #00e6e6;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(0, 230, 230, 0.4);
}

/* fix for disappearing SensorCards */
.will-change-transform {
  will-change: transform;
  z-index: 10;
  overflow: visible;
}
</style>
