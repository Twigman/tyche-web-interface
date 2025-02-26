<template>
  <div class="p-8 bg-neutral-800 min-h-screen flex flex-col space-y-8">
    <SensorGroup
      title="🌡 Temperature (Indoor)"
      sensorType="temperature"
      :sensors="temperatureSensors"
    />
    <SensorGroup title="💧 Humidity (Indoor)" sensorType="humidity" :sensors="humiditySensors" />
  </div>
</template>

<script setup lang="ts">
import SensorGroup from '@/components/SensorGroup.vue'

const temperatureSensors = [
  { id: 1, name: 'Wohnzimmer', temperature: 22.5, timestamp: new Date().toISOString() },
  { id: 2, name: 'Küche', temperature: 24.1, timestamp: new Date().toISOString() },
  { id: 3, name: 'Schlafzimmer', temperature: 19.8, timestamp: new Date().toISOString() },
]

const humiditySensors = [
  { id: 4, name: 'Wohnzimmer', humidity: 55, timestamp: new Date().toISOString() },
  { id: 5, name: 'Küche', humidity: 60, timestamp: new Date().toISOString() },
  { id: 6, name: 'Schlafzimmer', humidity: 50, timestamp: new Date().toISOString() },
]
</script>
