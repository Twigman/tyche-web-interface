<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarNav from './components/SidebarNav.vue'
/*
import { useKeyStore } from './composables/useKeyStore'
import { onMounted } from 'vue'

const keyStore = useKeyStore()

onMounted(async () => {
  await keyStore.loadKeys()

  if (!keyStore.publicKey) {
    console.log('No publickey exists. Generating new keys')
    await keyStore.generateKeys()
  } else {
    console.log('keys loaded')
  }
})*/
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden">
    <SidebarNav class="w-66 h-screen flex flex-col p-4 fixed top-0 left-0" />

    <div class="flex-1 ml-66 p-6 bg-neutral-800 overflow-y-auto">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
