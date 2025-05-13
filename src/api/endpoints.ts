import { spotifyClient } from "./client";

export async function getArtist(id: string) {
  const res = await spotifyClient.get(`/artists/${id}`);
  return res.data;
}

export async function getMyTracks() {
  const res = await spotifyClient.get(`/me/tracks`);
  return res.data;
}
