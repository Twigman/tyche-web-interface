<script setup lang="ts">
//import { RouterLink, RouterView } from 'vue-router'
import { RouterView } from 'vue-router'
import MenuSidebar from './components/MenuSidebar.vue'
</script>

<template>
  <div class="flex h-screen">
    <MenuSidebar />

    <div class="flex-1 p-6 bg-neutral-800">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
