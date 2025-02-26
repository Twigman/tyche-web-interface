<template>
  <div
    class="p-6 w-56 mx-auto bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-lg shadow-cyan-500/10 transition-transform hover:scale-105"
  >
    <h2
      class="text-xl font-bold text-gray-200 tracking-tight h-12 flex items-center justify-center text-center"
    >
      {{ sensor.name }}
    </h2>

    <hr class="border-white/15 w-full my-3" />

    <p v-if="sensor.state.temperature !== undefined" class="text-glow">
      🌡 <span class="text-highlight">{{ formattedTemperature }}</span>
    </p>

    <p v-if="sensor.state.humidity !== undefined" class="text-glow">
      💧 <span class="text-highlight">{{ formattedHumidity }}</span>
    </p>

    <p class="text-sm text-gray-400 mt-4 text-center">⏱ {{ formattedTime }}</p>
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

<style scoped>
@reference '@/assets/main.css'

/* Glow-Effekt für Werte */
.text-glow {
  @apply text-gray-300 text-lg tracking-wide;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

/* Leuchtende Werte für futuristisches Design */
.text-highlight {
  color: #00e6e6; /* Neon Cyan */
  font-weight: bold;
  text-shadow: 0 0 15px rgba(0, 230, 230, 0.4);
}

/* Sanfter Hover-Animationseffekt */
.hover\:scale-105 {
  transition: transform 0.3s ease-in-out;
}
</style>
