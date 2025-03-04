<template>
  <div class="w-66 h-screen bg-neutral-900 text-white flex flex-col p-4">
    <h2 class="text-xl font-bold text-gray-300 h-18 flex items-center justify-center text-center">
      Tyche
    </h2>

    <!-- Navigation -->
    <SidebarMenu />

    <!-- Phone and profile -->
    <SidebarStatus />
  </div>
</template>

<script setup lang="ts">
import SidebarMenu from './SidebarMenu.vue'
import SidebarStatus from './SidebarStatus.vue'
</script>

<style scoped></style>
