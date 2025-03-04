<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarNav from './components/SidebarNav.vue'
</script>

<template>
  <div class="flex h-screen">
    <SidebarNav />

    <div class="flex-1 p-6 bg-neutral-800">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
