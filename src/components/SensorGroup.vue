<template>
  <div
    class="p-6 bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:shadow-cyan-400/20"
  >
    <h2 class="text-2xl font-bold text-gray-200 tracking-tight text-center mb-4">{{ title }}</h2>

    <!-- loading -->
    <div v-if="loading" class="text-gray-300 text-center text-lg animate-pulse">
      🔄 Loading data...
    </div>

    <div v-else-if="error" class="text-red-400 text-center">⚠️ Error: {{ error }}</div>

    <!-- list sensors horizontally -->
    <div class="sensor-container">
      <div class="sensor-wrapper">
        <SensorCard v-for="sensor in sensors" :key="sensor.uniqueid" :sensor="sensor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SensorCard from './SensorCard.vue'
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { TYCHE_API_ENDPOINTS } from '@/config/api'
import type { Sensor } from '@/types/Sensor'

const props = defineProps<{ title: string; sensorType: string }>()

const sensors = ref<Sensor[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

const fetchSensors = async () => {
  try {
    if (props.sensorType === 'temperature') {
      const response = await axios.get<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_TEMPERATURE)
      sensors.value = response.data
      console.log(response)
    } else if (props.sensorType === 'humidity') {
      const response = await axios.get<Sensor[]>(TYCHE_API_ENDPOINTS.SENSORS_HUMIDITY)
      sensors.value = response.data
      console.log(response)
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      error.value = err.message
    } else {
      error.value = 'Unerwarteter Fehler: ' + String(err)
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.sensorType,
  () => {
    fetchSensors()
  },
  { immediate: true },
)

onMounted(fetchSensors)
</script>

<style scoped>
/* Container für SensorCards */
.sensor-container {
  display: flex;
  justify-content: start;
  overflow-x: visible; /* prevent cut off */
  padding: 10px;
}

/* Wrapper for animation */
.sensor-wrapper {
  display: flex;
  gap: 16px;
  perspective: 1000px;
  transform-style: preserve-3d;
}
</style>
