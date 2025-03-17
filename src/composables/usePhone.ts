import { ref, watchEffect } from 'vue'
import { useStompStore } from '@/stores/stompStore'
import { getPhoneInfo } from '@/services/phoneService'
import type { PhoneInfo } from '@/types/PhoneInfo'

export function usePhone() {
  // reactive lists
  const phoneInfo = ref<PhoneInfo | null>(null)
  const stompStore = useStompStore()

  async function loadPhone() {
    try {
      phoneInfo.value = await getPhoneInfo()
    } catch (error) {
      console.log(`[loadPhone] Error loading phone: ${error}`)
    }
  }

  // init phone
  loadPhone()

  watchEffect(() => {
    if (stompStore.phoneInfoUpdate) {
      // not null
      phoneInfo.value = stompStore.phoneInfoUpdate
    }
  })

  return { phoneInfo }
}
