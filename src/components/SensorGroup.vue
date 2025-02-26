<template>
  <div
    class="p-6 bg-neutral-700 rounded-lg inline-block max-w-max border border-white/10 shadow-xl shadow-black/20"
  >
    <h2 class="text-2xl font-bold text-white mb-4">{{ title }}</h2>

    <!-- Lade-Status -->
    <div v-if="loading" class="text-white">🔄 Lade Sensor-Daten...</div>
    <div v-else-if="error" class="text-red-400">⚠️ Fehler: {{ error }}</div>

    <!-- Sensoren horizontal aufreihen -->
    <div class="flex gap-4 overflow-x-auto justify-start flex-wrap">
      <SensorCard v-for="sensor in sensors" :key="sensor.uniqueid" :sensor="sensor" />
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
