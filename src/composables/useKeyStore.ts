import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as jose from 'jose'

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dpop-db', 2) // Erhöhe die Version, um `onupgradeneeded` sicher auszuführen!

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request.onupgradeneeded = (event) => {
      const db = request.result
      console.log('[IndexedDB] Upgrade läuft...')
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'id' })
        console.log("[IndexedDB] Object Store 'keys' wurde erstellt.")
      }
    }

    request.onsuccess = () => {
      const db = request.result
      console.log('[IndexedDB] Datenbank erfolgreich geöffnet.')

      // **🚀 WICHTIG:** Überprüfen, ob das Object Store existiert, bevor wir fortfahren!
      if (!db.objectStoreNames.contains('keys')) {
        console.error("[IndexedDB] Fehler: 'keys' existiert nicht, obwohl es erstellt sein sollte!")
        reject(new Error("Object Store 'keys' nicht gefunden"))
      } else {
        resolve(db)
      }
    }

    request.onerror = () => {
      console.error('[IndexedDB] Fehler beim Öffnen der Datenbank:', request.error)
      reject(request.error)
    }
  })
}

async function savePrivateKeyToIndexedDB(privateKey: CryptoKey) {
  const db = await openDatabase() // ✅ Stellt sicher, dass `keys` existiert

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('keys', 'readwrite')
    const store = tx.objectStore('keys')
    const request = store.put({ id: 'privateKey', privateKey })

    request.onsuccess = () => {
      console.log('[IndexedDB] Private Key gespeichert.')
      tx.oncomplete = () => resolve()
    }

    request.onerror = () => {
      console.error('[IndexedDB] Fehler beim Speichern des Private Keys:', request.error)
      reject(request.error)
    }
  })
}

async function loadPrivateKeyFromIndexedDB(): Promise<CryptoKey | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readonly')
    const store = tx.objectStore('keys')
    const request = store.get('privateKey')

    request.onsuccess = () => {
      console.log('[IndexedDB] Private Key geladen:', request.result)
      resolve(request.result?.privateKey || null)
    }

    request.onerror = () => {
      console.error('[IndexedDB] Fehler beim Laden des Private Keys:', request.error)
      reject(request.error)
    }
  })
}

export type KeyStoreState = {
  privateKey: CryptoKey | null
  publicKey: JsonWebKey | null
}

export const useKeyStore = defineStore('keyStore', () => {
  const privateKey = ref<KeyStoreState['privateKey']>(null)
  const publicKey = ref<KeyStoreState['publicKey']>(null)

  // Lade Keys aus IndexedDB
  async function loadKeys() {
    privateKey.value = await loadPrivateKeyFromIndexedDB()
    publicKey.value = JSON.parse(localStorage.getItem('publicKey') || 'null')
  }

  // Generiere ein neues Schlüsselpaar
  async function generateKeys() {
    const keyPair = await jose.generateKeyPair('ES256')
    privateKey.value = keyPair.privateKey
    publicKey.value = await jose.exportJWK(keyPair.publicKey)

    // Speichern
    await savePrivateKeyToIndexedDB(privateKey.value)
    localStorage.setItem('publicKey', JSON.stringify(publicKey.value))
  }

  return {
    privateKey: computed(() => privateKey.value),
    publicKey: computed(() => publicKey.value),
    loadKeys,
    generateKeys,
  }
})
