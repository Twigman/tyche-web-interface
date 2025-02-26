<template>
  <div class="w-64 h-screen bg-neutral-900 text-white flex flex-col p-4">
    <nav class="space-y-4 text-lg">
      <RouterLink to="/sensors" class="block p-2 rounded hover:bg-gray-700"> Sensors </RouterLink>
      <RouterLink to="/lights" class="block p-2 rounded hover:bg-gray-700"> Lights </RouterLink>
      <RouterLink to="/lights" class="block p-2 rounded hover:bg-gray-700"> Log </RouterLink>
      <RouterLink to="/lights" class="block p-2 rounded hover:bg-gray-700"> Console </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts"></script>
