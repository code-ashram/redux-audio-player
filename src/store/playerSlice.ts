import { createSlice } from '@reduxjs/toolkit'

import Track from '@/models/Track.ts'

import trackList from '@/API/trackList.ts'

interface PlayerState {
  playlist: Track[]
  isPlaying: boolean
  isLoop: boolean
  duration: number
  currentTime: number
  volume: number
  currentTrackIndex: number
}

const initialState: PlayerState = {
  playlist: trackList,
  isPlaying: false,
  isLoop: false,
  duration: 0,
  currentTime: 0,
  volume: 0.65,
  currentTrackIndex: 0,
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {

  }
})

export default playerSlice.reducer
