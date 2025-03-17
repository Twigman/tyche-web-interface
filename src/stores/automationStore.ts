import { defineStore } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useStompStore } from '@/stores/stompStore'
import { getAutomationActiveProfile } from '@/services/automationService'
import { defaultStompWrapper, type StompWrapper } from '@/types/Message'
import { TYCHE_MODULE } from '@/config/module'

export const useAutomationStore = defineStore('automation', () => {
  const activeProfile = ref<StompWrapper<string>>(defaultStompWrapper(''))

  async function loadAutomation() {
    try {
      activeProfile.value.module = TYCHE_MODULE.API
      activeProfile.value.data = await getAutomationActiveProfile()
    } catch (error) {
      console.log(`[loadPhone] Error loading automation: ${error}`)
    }
  }

  // WebSocket for live-updates
  const stompStore = useStompStore()

  watch(
    () => stompStore.activeProfileUpdate,
    (newValue) => {
      if (newValue?.module?.trim()) {
        // valid STOMP message
        activeProfile.value.data = newValue.data
        activeProfile.value.module = newValue.module
      }
    },
    { immediate: true },
  )

  onMounted(loadAutomation)

  return { activeProfile, loadAutomation }
})
