import { SPOTIFY_API_ENDPOINTS } from '@/config/spotifyApi'
import { putData } from './axiosService'

export function putVolume(percent: number): void {
  putData(SPOTIFY_API_ENDPOINTS.VOLUME(percent))
}

export function putPlay(): void {
  putData(SPOTIFY_API_ENDPOINTS.PLAY)
}

export function putPause(): void {
  putData(SPOTIFY_API_ENDPOINTS.PAUSE)
}

export function putNext(): void {
  putData(SPOTIFY_API_ENDPOINTS.NEXT)
}

export function putPrevious(): void {
  putData(SPOTIFY_API_ENDPOINTS.PREVIOUS)
}
