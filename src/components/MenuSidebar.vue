<template>
  <div class="w-64 h-screen bg-neutral-900 text-white flex flex-col p-4">
    <h2 class="text-xl font-bold text-gray-300 h-18 flex items-center justify-center text-center">
      Tyche
    </h2>
    <nav class="space-y-4 text-lg">
      <RouterLink to="/sensors" active-class="active" class="block p-2 rounded hover:bg-gray-700">
        Sensors
      </RouterLink>
      <RouterLink to="/lights" active-class="active" class="block p-2 rounded hover:bg-gray-700">
        Lights
      </RouterLink>
      <RouterLink to="/lights" active-class="active" class="block p-2 rounded hover:bg-gray-700">
        Log
      </RouterLink>
      <RouterLink to="/lights" active-class="active" class="block p-2 rounded hover:bg-gray-700">
        Console
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@reference '@/assets/main.css'

.menu-item {
  @apply px-4 py-2 rounded-lg transition-colors duration-200;
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
</style>
