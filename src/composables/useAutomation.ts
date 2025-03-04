import { ref, watchEffect } from 'vue'
import { useStompWebSocket } from '@/composables/useStompWebSocket'
import { getAutomationActiveProfile } from '@/services/automationService'

export function useAutomation() {
  // reactive lists
  const activeProfile = ref<string>()

  async function loadAutomation() {
    try {
      activeProfile.value = await getAutomationActiveProfile()
    } catch (error) {
      console.log(`[loadPhone] Error loading automation: ${error}`)
    }
  }

  // init automation
  loadAutomation()

  // WebSocket for live-updates
  const { activeProfileUpdate } = useStompWebSocket()

  watchEffect(() => {
    if (activeProfileUpdate.value) {
      // not null
      activeProfile.value = activeProfileUpdate.value
    }
  })

  return { activeProfile }
}
