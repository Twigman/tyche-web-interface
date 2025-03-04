<template>
  <div
    class="p-6 bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:shadow-cyan-400/20"
  >
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

    <hr
      class="border-white/15 w-full my-3 transition-opacity duration-300"
      :class="{ 'opacity-100': isOpen, 'opacity-50': !isOpen }"
    />

    <!-- SensorCards -->
    <Transition name="smooth-slide">
      <div v-if="isOpen" class="sensor-container">
        <div class="sensor-wrapper">
          <SensorCard v-for="sensor in sensors" :key="sensor.uniqueid" :sensor="sensor" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import SensorCard from './SensorCard.vue'
import { ref, computed } from 'vue'
import type { Sensor } from '@/types/Sensor'
import { Thermometer, Droplet, Lightbulb, ChevronUp } from 'lucide-vue-next'

// State for akkordeon-function
const isOpen = ref(true)

// Vue Props
const props = defineProps<{ title: string; sensorType: string; sensors: Sensor[] }>()

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
