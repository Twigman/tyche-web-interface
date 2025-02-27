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
        <component
          :is="sensorData.icon"
          class="icon"
          :class="[sensorData.color, { 'glow-icon': glowEffects[sensorData.key] }]"
        />
        <span
          class="text-highlight whitespace-nowrap"
          :class="{ 'glow-effect': glowEffects[sensorData.key] }"
        >
          {{ sensorData.measurement }}
        </span>
      </div>

      <div class="sensor-item">
        <Clock class="icon text-gray-400" />
        <span class="text-sm text-gray-400 whitespace-nowrap">{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Sensor } from '@/types/Sensor'
import { Thermometer, Droplet, Clock } from 'lucide-vue-next'

const props = defineProps<{ sensor: Sensor }>()

// Berechnete Sensor-Werte als Array für v-for
const sensorProperties = computed(() => {
  return [
    {
      key: 'temperature',
      measurement:
        props.sensor.state.temperature !== undefined
          ? (props.sensor.state.temperature / 100).toFixed(1) + ' °C'
          : null,
      icon: Thermometer,
      color: 'text-red-400',
    },
    {
      key: 'humidity',
      measurement:
        props.sensor.state.humidity !== undefined
          ? (props.sensor.state.humidity / 100).toFixed(1) + '%'
          : null,
      icon: Droplet,
      color: 'text-blue-400',
    },
  ].filter((sensor) => sensor.measurement !== null) // remove null values
})

const formattedTime = computed(() => new Date(props.sensor.state.lastupdated).toLocaleTimeString())

// glow effect for updating measurement
const glowEffects = ref<{ [key: string]: boolean }>({})

watch(
  sensorProperties,
  (newProperties, oldProperties) => {
    newProperties.forEach((newSensor) => {
      const oldSensor = oldProperties.find((old) => old.key === newSensor.key)

      if (oldSensor && oldSensor.measurement !== newSensor.measurement) {
        glowEffects.value[newSensor.key] = false // reset
        setTimeout(() => {
          glowEffects.value[newSensor.key] = true
        }, 10) // delay

        setTimeout(() => {
          glowEffects.value[newSensor.key] = false
        }, 1400) // end effect after 1.4s
      }
    })
  },
  { deep: true },
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

/* fix for disappearing SensorCards */
.will-change-transform {
  will-change: transform;
  z-index: 10;
  overflow: visible;
}

/* smooth glow-effect */
.glow-effect {
  animation: glowAnimation 1.4s ease-in-out forwards;
}

/* glow effect for icon */
.glow-icon {
  animation: glowIconAnimation 1.4s ease-in-out forwards;
}

@keyframes glowIconAnimation {
  0% {
    filter: brightness(1.2);
    transform: scale(1);
  }
  25% {
    filter: brightness(1.45);
    transform: scale(1.08);
  }
  30% {
    filter: brightness(1.5);
    transform: scale(1.1);
  }
  40% {
    filter: brightness(1.45);
    transform: scale(1.08);
  }
  100% {
    filter: brightness(1);
    transform: scale(1);
  }
}

/* glow effect for text */
.text-highlight {
  color: #00e6e6;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(0, 230, 230, 0.4);
  transition:
    text-shadow 0.3s ease-out,
    filter 0.3s ease-out,
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
}

@keyframes glowAnimation {
  0% {
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    filter: brightness(1.2);
    transform: scale(1);
    opacity: 0.8;
  }
  25% {
    text-shadow: 0 0 15px rgba(0, 255, 255, 1);
    filter: brightness(1.45);
    transform: scale(1.08);
    opacity: 1;
  }
  30% {
    text-shadow: 0 0 15px rgba(0, 255, 255, 1);
    filter: brightness(1.5);
    transform: scale(1.1);
    opacity: 1;
  }
  40% {
    text-shadow: 0 0 15px rgba(0, 255, 255, 1);
    filter: brightness(1.45);
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
    filter: brightness(1);
    transform: scale(1);
    opacity: 1;
  }
}
</style>
