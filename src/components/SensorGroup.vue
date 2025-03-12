<template>
  <div
    class="p-6 bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:shadow-cyan-400/20"
  >
    <!-- Header with icon and title -->
    <div class="flex items-center justify-between cursor-pointer select-none" @click="toggleOpen">
      <div class="flex items-center gap-3">
        <component :is="groupIcon" class="icon text-cyan-400" />
        <h2 class="text-2xl font-bold text-gray-200 tracking-tight">{{ title }}</h2>
      </div>
      <component
        :is="ChevronUp"
        class="icon transition-transform duration-300 chevron"
        :class="{ 'chevron-rotated': isOpen }"
      />
    </div>

    <!-- Horizontal line-->
    <hr
      class="border-white/15 w-full my-3 transition-opacity duration-300"
      :class="{ 'opacity-100': isOpen, 'opacity-50': !isOpen }"
    />

    <!-- Body -->
    <Transition name="smooth-slide">
      <div v-if="isOpen" class="flex flex-col gap-6">
        <!-- SensorCards -->
        <div class="flex flex-wrap gap-4">
          <SensorCard v-for="sensor in sensors" :key="sensor.uniqueid" :sensor="sensor" />
        </div>

        <!-- Diagram -->
        <div v-if="!isLoadingDiagramData" class="flex justify-center items-center min-h-[200px]">
          <TemperatureLineChart :stateDataSets="states" />
        </div>
        <div v-else class="loading-spinner">Loading diagram...</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import SensorCard from './SensorCard.vue'
import TemperatureLineChart from './charts/TemperatureLineChart.vue'
import { ref, computed, watch } from 'vue'
import { Thermometer, Droplet, Lightbulb, ChevronUp } from 'lucide-vue-next'
import { getTemperatureSensorStatesLast24h } from '@/services/sensorService'
import type { Sensor, SensorState } from '@/types/Sensor'

// State for akkordeon-function
const isOpen = ref(true)
//const states: Record<string, SensorState[]> = {}
const states = ref<Record<string, { name: string; data: SensorState[] }>>({})
const isLoadingDiagramData = ref(true)

// Vue Props
const props = defineProps<{
  title: string
  sensorType: string
  sensors: Sensor[]
}>()

const initDiagramStates = async () => {
  if (props.sensorType === 'temperature') {
    console.log('start requests...')
    isLoadingDiagramData.value = true

    try {
      // parallel requests
      const promises = props.sensors.map(async (sensor) => {
        const tempStates = await getTemperatureSensorStatesLast24h(sensor.uniqueid)

        return { sensorId: sensor.uniqueid, sensorName: sensor.name, tempStates }
      })

      // wait for all Requests
      const results = await Promise.all(promises)

      // save results
      results.forEach(({ sensorId, sensorName, tempStates }) => {
        states.value[sensorId] = { name: sensorName, data: tempStates }
      })
    } catch (error) {
      console.error('Error loading sensor data: ', error)
    } finally {
      isLoadingDiagramData.value = false
    }
  }
}

const updateDiagramStates = (newStates: Sensor[]) => {
  const currentTime = Date.now()
  // calc timestamp - 24h in ms
  const timeLimit = currentTime - 24 * 60 * 60 * 1000

  newStates.forEach((sensor) => {
    // add new data
    states.value[sensor.uniqueid].data.push(sensor.state)
    //delete data older than 24h
    while (
      states.value[sensor.uniqueid].data.length > 0 &&
      new Date(states.value[sensor.uniqueid].data[0].lastupdated).getTime() < timeLimit
    ) {
      // remove first element (oldest value)
      states.value[sensor.uniqueid].data.shift()
    }
  })
}

// Icons für different groups
// all sensors should have the same type
// choose icon depending on the first sensor type
const groupIcon = computed(() => {
  switch (props.sensorType) {
    case 'temperature':
      return Thermometer
    case 'humidity':
      return Droplet
    default:
      return Lightbulb
  }
})

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

// wait for sensors
watch(
  () => props.sensors,
  async (newSensors) => {
    if (!newSensors || newSensors.length === 0) {
      console.warn('Waiting for sensor data...')
    } else {
      if (isLoadingDiagramData.value) {
        initDiagramStates()
      } else {
        updateDiagramStates(newSensors)
      }
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
@reference '@/assets/main.css';

/* Container for SensorCards */
.sensor-container {
  display: flex;
  justify-content: start;
  overflow-x: visible;
  padding: 10px;
}

/* Wrapper for animation */
.sensor-wrapper {
  display: flex;
  gap: 16px;
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* akkordeon-animation */
.smooth-slide-enter-active,
.smooth-slide-leave-active {
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out;
  transform-origin: top;
}

.smooth-slide-enter-from,
.smooth-slide-leave-to {
  transform: scaleY(0);
  opacity: 0;
}

/* Icon-Styling */
.icon {
  @apply w-6 h-6 transition-transform duration-300;
}

/* Arrow rotates 180° */
.chevron {
  transform: rotate(0deg);
}

.chevron-rotated {
  transform: rotate(180deg);
}
</style>
