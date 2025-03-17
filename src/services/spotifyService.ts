import { SPOTIFY_API_ENDPOINTS } from '@/config/spotifyApi'
import { putData } from './axiosService'

export function putVolume(percent: number): void {
  putData(SPOTIFY_API_ENDPOINTS.VOLUME(percent))
}
