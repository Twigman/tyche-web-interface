<template>
  <div class="mt-auto">
    <div class="flex justify-between items-center pl-2 pr-4 py-3 bg-neutral-800 rounded-lg">
      <!-- Handy-Status (jetzt klickbar mit Ladeanimation) -->
      <button
        @click="onPhoneStatusClick"
        :disabled="isChecking"
        class="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div
          v-if="!isChecking"
          :class="phoneInfo.inHomeWlan ? 'bg-green-500' : 'bg-gray-500'"
          class="w-3 h-3 rounded-full"
        ></div>
        <div v-else class="loading-spinner"></div>

        <span class="text-sm text-gray-300">
          {{ isChecking ? 'Checking...' : phoneInfo.name }}
        </span>
      </button>

      <!-- Profil-Dropdown -->
      <div class="relative">
        <button
          @click="toggleProfileMenu"
          class="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white"
        >
          <User class="w-5 h-5 text-gray-400" />
          {{ formattedActiveProfile }}
        </button>

        <div
          v-if="profileMenuOpen"
          class="absolute right-0 bottom-full translate-y-[-8px] w-40 bg-neutral-800 border border-white/10 rounded-lg shadow-lg"
        >
          <ul>
            <li
              v-for="profile in formattedProfiles"
              :key="profile"
              @click="selectProfile(profile)"
              class="px-4 py-2 hover:bg-white/10 cursor-pointer"
            >
              {{ profile }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { User } from 'lucide-vue-next'
import { usePhone } from '@/composables/usePhone'
import { useAutomation } from '@/composables/useAutomation'
import { getUpdateInfo } from '@/services/phoneService'
import { getAutomationProfiles, postAutomationActiveProfile } from '@/services/automationService'
import type { PhoneInfo } from '@/types/PhoneInfo'

const phoneInfo = ref<PhoneInfo>({ name: 'Phone', inHomeWlan: false })
let profiles: string[] = []
const profileMenuOpen = ref(false)
// loading phone status
const isChecking = ref(false)

// live-data
const phoneInfoUpdate = usePhone()
const activeProfileUpdate = useAutomation()

const onPhoneStatusClick = async () => {
  if (isChecking.value) return // ignore second click

  isChecking.value = true
  try {
    phoneInfo.value = await getUpdateInfo()
  } catch (error) {
    console.error('Error calling postCheckPhoneConnection:', error)
  } finally {
    isChecking.value = false
  }
}

// Profil-Dropdown
const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}

const selectProfile = async (profile: string) => {
  activeProfileUpdate.activeProfile.value.data = profile
  profileMenuOpen.value = false
  // call api
  const response = await postAutomationActiveProfile(profile.toUpperCase())
  console.log(response)
}

// first letter uppercase, other lowercase
const formatProfileEntry = (entry: string) => {
  const lower = entry.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

// used value for options
const formattedProfiles = computed(() => {
  return profiles.map((profile) => {
    return formatProfileEntry(profile)
  })
})

// used value for profile
const formattedActiveProfile = computed(() => {
  if (activeProfileUpdate.activeProfile.value.data) {
    return formatProfileEntry(activeProfileUpdate.activeProfile.value.data)
  } else {
    return 'Error'
  }
})

watch(
  () => phoneInfoUpdate.phoneInfo.value,
  (newPhoneInfo) => {
    if (newPhoneInfo) {
      phoneInfo.value.name = newPhoneInfo.name
      phoneInfo.value.inHomeWlan = newPhoneInfo.inHomeWlan
    } else {
      console.log(`phoneInfo is null`)
    }
  },
)

onMounted(async () => (profiles = await getAutomationProfiles()))
</script>

<style scoped>
/* Spinner */
.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
