import axios from 'axios'
import * as jose from 'jose'
import { useKeyStore } from '@/composables/useKeyStore'

async function createDPoPToken(httpMethod: string, url: string): Promise<string> {
  const keyStore = useKeyStore()

  if (!keyStore.privateKey || !keyStore.publicKey) {
    // if not loaded try again
    await keyStore.loadKeys()
  }

  if (!keyStore.privateKey || !keyStore.publicKey) {
    // if they dont exist, generate new keys
    await keyStore.generateKeys()
  }

  // convert keys
  const publicJWK = keyStore.publicKey as JsonWebKey
  //const publicKey = await jose.importJWK(publicJWK, 'ES256')
  const privateKey = keyStore.privateKey as CryptoKey

  return await new jose.SignJWT({
    jti: crypto.randomUUID(), // no replay attack
    htm: httpMethod, // only for this method
    htu: url, // only for this endpoint
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 10, // 10 s valid
  })
    .setProtectedHeader({
      alg: 'ES256',
      jwk: publicJWK, // send public key
    })
    .sign(privateKey) // sign with private key
}

export async function getData<T>(endpoint: string): Promise<T> {
  try {
    const dpopToken = await createDPoPToken('GET', endpoint)
    const response = await axios.get<T>(endpoint, { headers: { DPoP: dpopToken } })

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(`[API] Error calling ${endpoint}: ${err.message}`)
    } else {
      console.log(`[API] Unexpected error: ${String(err)}`)
    }
    throw new Error(`Fetching data from ${endpoint} failed`)
  }
}

export async function postData<T, D>(endpoint: string, data: D): Promise<T> {
  try {
    const dpopToken = await createDPoPToken('POST', endpoint)
    const response = await axios.post<T>(endpoint, data, { headers: { DPoP: dpopToken } })

    return response.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(`[API] Error calling ${endpoint}: ${err.message} (${err.toJSON})`)
    } else {
      console.log(`[API] Unexpected error: ${String(err)}`)
    }
    throw new Error(`Fetching data from ${endpoint} failed`)
  }
}

export async function putData(endpoint: string) {
  try {
    const dpopToken = await createDPoPToken('PUT', endpoint)
    axios.put(endpoint, { headers: { DPoP: dpopToken } })
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(`[API] Error calling ${endpoint}: ${err.message}`)
    } else {
      console.log(`[API] Unexpected error: ${String(err)}`)
    }
    throw new Error(`Fetching data from ${endpoint} failed`)
  }
}
