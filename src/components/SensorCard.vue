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
      <!-- generated dynamic values -->
      <div v-for="(sensorData, index) in sensorProperties" :key="index" class="sensor-item">
        <component :is="sensorData.icon" class="icon" :class="sensorData.color" />
        <span class="text-highlight whitespace-nowrap">{{ sensorData.value }}</span>
      </div>

      <div class="sensor-item">
        <Clock class="icon text-gray-400" />
        <span class="text-sm text-gray-400 whitespace-nowrap">{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Sensor } from '@/types/Sensor'
import { Thermometer, Droplet, Clock } from 'lucide-vue-next'

const props = defineProps<{ sensor: Sensor }>()

// Berechnete Sensor-Werte als Array für v-for
const sensorProperties = computed(() => {
  return [
    {
      key: 'temperature',
      value:
        props.sensor.state.temperature !== undefined
          ? (props.sensor.state.temperature / 100).toFixed(1) + ' °C'
          : null,
      icon: Thermometer,
      color: 'text-red-400',
    },
    {
      key: 'humidity',
      value:
        props.sensor.state.humidity !== undefined
          ? (props.sensor.state.humidity / 100).toFixed(1) + '%'
          : null,
      icon: Droplet,
      color: 'text-blue-400',
    },
  ].filter((sensor) => sensor.value !== null) // remove null values
})

const formattedTime = computed(() => new Date(props.sensor.state.lastupdated).toLocaleTimeString())
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
