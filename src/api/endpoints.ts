import { spotifyClient } from './client'

export const getArtist = async (id: string) => {
  const res = await spotifyClient.get(`/artists/${id}`)
  return res.data
}

export const getArtistAlbums = async (id: string) => {
  const res = await spotifyClient.get(`/artists/${id}/albums`)
  return res.data
}

export const getAlbums = async (id: string) => {
  const res = await spotifyClient.get(`/albums/${id}`)
  return res.data
}

export const getTracks = async (id: string) => {
  const res = await spotifyClient.get(`/tracks/${id}`)
  return res.data
}
