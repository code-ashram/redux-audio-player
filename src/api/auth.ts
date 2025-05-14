import axios from 'axios'

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

interface StoredToken {
  access_token: string;
  expires_at: number;
}

const TOKEN_KEY = 'spotify_access_token'

function getStoredToken (): StoredToken | null {
  const raw = sessionStorage.getItem(TOKEN_KEY)
  if (!raw) return null

  try {
    const token = JSON.parse(raw)
    if (typeof token.access_token === 'string' && typeof token.expires_at === 'number') {
      return token
    }
  } catch {
    return null
  }

  return null
}

const saveTokenToStorage = async (token: string, expiresIn: number) => {
  const expiresAt = Date.now() + expiresIn * 1000
  const tokenObj: StoredToken = {
    access_token: token,
    expires_at: expiresAt
  }
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokenObj))
}

export async function getSpotifyAccessToken (): Promise<string> {
  const cached = getStoredToken()

  if (cached && Date.now() < cached.expires_at - 60_000) {
    return cached.access_token
  }

  const authHeader = btoa(`${clientId}:${clientSecret}`)

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`
      }
    }
  )

  const token = response.data.access_token
  const expiresIn = response.data.expires_in

  saveTokenToStorage(token, expiresIn)
  return token
}
