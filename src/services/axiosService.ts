import axios from 'axios'

export async function getData<T>(endpoint: string): Promise<T> {
  try {
    const response = await axios.get<T>(endpoint)

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

export async function postData<T>(endpoint: string): Promise<T> {
  try {
    const response = await axios.post<T>(endpoint)

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
