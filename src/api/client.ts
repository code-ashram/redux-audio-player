import axios from 'axios'
import { getSpotifyAccessToken } from './auth'

export const spotifyClient = axios.create({
  baseURL: 'https://api.spotify.com/v1'
})

spotifyClient.interceptors.request.use(async (config) => {
  const token = await getSpotifyAccessToken()

  if (config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  console.log('Adding token to request:', token)

  return config
})
