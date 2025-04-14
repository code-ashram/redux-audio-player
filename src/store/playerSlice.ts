import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
    playTrack: (state, { payload }: PayloadAction<boolean>) => {
      state.isPlaying = payload
    },
    toggleLoop: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoop = payload
    },
    setDuration: (state, { payload }: PayloadAction<number>) => {
      state.duration = payload
    },
    setCurrentTime: (state, { payload }: PayloadAction<number>) => {
      state.currentTime = payload
    },
    setVolume: (state, { payload }: PayloadAction<number>) => {
      state.volume = payload
    },
    setCurrentTrackIndex: (state, { payload }: PayloadAction<number>) => {
      state.currentTrackIndex = payload
    }
  },
  selectors: {
    isPlaying: state => state.isPlaying,
    isLoop: state => state.isLoop,
    trackDuration: state => state.duration,
    trackCurrentTime: state => state.currentTime,
    trackVolume: state => state.volume,
    currentTrackIndex: state => state.currentTrackIndex
  }
})

export const {
  playTrack,
  toggleLoop,
  setDuration,
  setCurrentTime,
  setVolume,
  setCurrentTrackIndex
} = playerSlice.actions

export const {
  isPlaying, isLoop, trackDuration, trackCurrentTime, trackVolume,
  currentTrackIndex
} = playerSlice.selectors

export default playerSlice.reducer
