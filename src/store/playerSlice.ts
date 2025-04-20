import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import Track from '@/models/Track.ts'

import trackList from '@/API/trackList.ts'
import RepeatMode from '@/models/RepeatMode.ts'

interface PlayerState {
  playlist: Track[]
  isPlaying: boolean
  isLoop: boolean
  duration: number
  currentTime: number
  volume: number
  currentTrackIndex: number
  selectedTime: number | null
  repeatMode: RepeatMode
}

const initialState: PlayerState = {
  playlist: trackList,
  isPlaying: false,
  isLoop: false,
  duration: 0,
  currentTime: 0,
  volume: 0.65,
  currentTrackIndex: 0,
  selectedTime: null,
  repeatMode: RepeatMode.noRepeat
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
    },
    setSelectedTime: (state, { payload }: PayloadAction<number | null>) => {
      state.selectedTime = payload
    },
    setRepeatMode: (state) => {
      switch (state.repeatMode) {
        case RepeatMode.noRepeat:
          state.repeatMode = RepeatMode.repeatTrack
          state.isLoop = true // включаем loop
          break
        case RepeatMode.repeatTrack:
          state.repeatMode = RepeatMode.repeatPlaylist
          state.isLoop = false // выключаем loop
          break
        case RepeatMode.repeatPlaylist:
          state.repeatMode = RepeatMode.noRepeat
          state.isLoop = false // выключаем loop
          break
        default:
          state.repeatMode = RepeatMode.noRepeat
          state.isLoop = false
      }

      console.log('New RepeatMode:', state.repeatMode, '| Loop:', state.isLoop)
    }
  },
  selectors: {
    playerPlaylist: state => state.playlist,
    isPlaying: state => state.isPlaying,
    isLoop: state => state.isLoop,
    trackDuration: state => state.duration,
    trackCurrentTime: state => state.currentTime,
    trackVolume: state => state.volume,
    currentTrackIndex: state => state.currentTrackIndex,
    trackSelectedTime: state => state.selectedTime,
    playerRepeatMode: state => state.repeatMode
  }
})

export const {
  playTrack,
  toggleLoop,
  setDuration,
  setCurrentTime,
  setVolume,
  setCurrentTrackIndex,
  setSelectedTime,
  setRepeatMode
} = playerSlice.actions

export const {
  isPlaying, isLoop, trackDuration, trackCurrentTime, trackVolume,
  currentTrackIndex, trackSelectedTime, playerPlaylist, playerRepeatMode
} = playerSlice.selectors

export default playerSlice.reducer
