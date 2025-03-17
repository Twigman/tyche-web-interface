<template>
  <div class="p-8 bg-neutral-800 h-auto flex flex-col space-y-8">
    <SensorGroup
      title="Temperature (Indoor)"
      sensorType="temperature"
      :sensors="sensorStore.sensorsTemperature"
    />
    <SensorGroup
      title="Humidity (Indoor)"
      sensorType="humidity"
      :sensors="sensorStore.sensorsHumidity"
    />
  </div>
</template>

<script setup lang="ts">
import SensorGroup from '@/components/SensorGroup.vue'
import { useSensorStore } from '@/stores/sensorStore'

const sensorStore = useSensorStore()
</script>
