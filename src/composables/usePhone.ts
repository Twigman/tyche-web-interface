import { ref, watchEffect } from 'vue'
import { useStompWebSocket } from '@/composables/useStompWebSocket'
import { getPhoneInfo } from '@/services/phoneService'
import type { PhoneInfo } from '@/types/PhoneInfo'

export function usePhone() {
  // reactive lists
  const phoneInfo = ref<PhoneInfo | null>(null)

  async function loadPhone() {
    try {
      phoneInfo.value = await getPhoneInfo()
    } catch (error) {
      console.log(`[loadPhone] Error loading phone: ${error}`)
    }
  }

  // init phone
  loadPhone()

  // WebSocket for live-updates
  const { phoneInfoUpdate } = useStompWebSocket()

  watchEffect(() => {
    if (phoneInfoUpdate.value) {
      // not null
      phoneInfo.value = phoneInfoUpdate.value
    }
  })

  return { phoneInfo }
}
