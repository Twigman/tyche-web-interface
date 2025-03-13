import { ref, watch } from 'vue'
import { useStompWebSocket } from '@/composables/useStompWebSocket'
import { getAutomationActiveProfile } from '@/services/automationService'
import { defaultStompWrapper, type StompWrapper } from '@/types/Message'
import { TYCHE_MODULE } from '@/config/module'

export function useAutomation() {
  // reactive lists
  const activeProfile = ref<StompWrapper<string>>(defaultStompWrapper(''))

  async function loadAutomation() {
    try {
      activeProfile.value.module = TYCHE_MODULE.API
      activeProfile.value.data = await getAutomationActiveProfile()
    } catch (error) {
      console.log(`[loadPhone] Error loading automation: ${error}`)
    }
  }

  // init automation
  loadAutomation()

  // WebSocket for live-updates
  const { activeProfileUpdate } = useStompWebSocket()

  watch(
    () => activeProfileUpdate.value,
    (newValue) => {
      if (newValue?.module?.trim()) {
        // valid STOMP message
        activeProfile.value.data = activeProfileUpdate.value.data
        activeProfile.value.module = activeProfileUpdate.value.module
      }
    },
  )

  return { activeProfile }
}
