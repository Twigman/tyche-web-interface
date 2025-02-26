<template>
  <div class="w-64 h-screen bg-neutral-900 text-white flex flex-col p-4">
    <h2 class="text-xl font-bold text-gray-300 h-18 flex items-center justify-center text-center">
      Tyche
    </h2>

    <nav class="space-y-4 text-lg">
      <RouterLink to="/" active-class="active" class="menu-item">
        <HomeIcon class="icon" />
        Dashboard
      </RouterLink>

      <RouterLink to="/sensors" active-class="active" class="menu-item">
        <ThermometerIcon class="icon" />
        Sensors
      </RouterLink>

      <RouterLink to="/lights" active-class="active" class="menu-item">
        <LightbulbIcon class="icon" />
        Lights
      </RouterLink>

      <RouterLink to="/log" active-class="active" class="menu-item">
        <FileTextIcon class="icon" />
        Log
      </RouterLink>

      <RouterLink to="/console" active-class="active" class="menu-item">
        <TerminalIcon class="icon" />
        Console
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { Home, Thermometer, Lightbulb, FileText, Terminal } from 'lucide-vue-next'

const HomeIcon = Home
const ThermometerIcon = Thermometer
const LightbulbIcon = Lightbulb
const FileTextIcon = FileText
const TerminalIcon = Terminal
</script>

<style scoped>
@reference '@/assets/main.css';

.menu-item {
  @apply flex items-center px-4 py-2 rounded-lg transition-colors duration-200 gap-3;
}

.menu-item:hover {
  @apply bg-white/10;
}

.active {
  @apply bg-white/20 font-bold;
}

.active:hover {
  @apply bg-white/30;
}

/* Icon-Styling */
.icon {
  @apply w-6 h-6 text-gray-400 transition-colors duration-200;
}

.menu-item:hover .icon {
  @apply text-white;
}
</style>
