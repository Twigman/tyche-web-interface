<template>
  <nav class="space-y-4 text-lg">
    <RouterLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      active-class="active"
      class="menu-item"
    >
      <component :is="item.icon" class="icon" />
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { Home, Thermometer, Lightbulb, FileText, Terminal } from 'lucide-vue-next'

const menuItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/sensors', label: 'Sensors', icon: Thermometer },
  { to: '/lights', label: 'Lights', icon: Lightbulb },
  { to: '/log', label: 'Log', icon: FileText },
  { to: '/console', label: 'Console', icon: Terminal },
]
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

.icon {
  @apply w-6 h-6 text-gray-400 transition-colors duration-200;
}

.menu-item:hover .icon {
  @apply text-white;
}
</style>
