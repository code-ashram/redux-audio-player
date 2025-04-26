import { RefObject, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@/components/theme-provider'

import { Card } from '@/components/ui/card'
import PlayList from '@/components/PlayList.tsx'
import ControlPanel from '@/components/ControlPanel.tsx'

import './App.scss'

import {
  currentTrackIndex,
  isLoop,
  isPlaying,
  playerPlaylist,
  playerRepeatMode,
  playTrack,
  setCurrentTime,
  setCurrentTrackIndex,
  setDuration,
  setSelectedTime,
  setVolume,
  toggleLoop,
  trackSelectedTime
} from '@/store/playerSlice.ts'
import RepeatMode from '@/models/RepeatMode.ts'

const App = () => {
  const player = useRef<HTMLAudioElement | null>(null)

  const dispatch = useDispatch()
  const loop = useSelector(isLoop)
  const { theme } = useTheme()
  const selectedTime = useSelector(trackSelectedTime)
  const trackIndex = useSelector(currentTrackIndex)
  const play = useSelector(isPlaying)
  const repeatMode = useSelector(playerRepeatMode)
  const playList = useSelector(playerPlaylist)


  useEffect(() => {
    const audio = player.current

    if (!audio) return

    const handleLoadedMetadata = () => {
      dispatch(setDuration(audio.duration))
    }

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime))
    }

    const handleChangeVolume = () => {
      dispatch(setVolume(audio.volume))
    }

    const switchLoop = () => {
      dispatch(toggleLoop(audio.loop))
    }

    const handleEnded = () => {
      if (!player.current || player.current.loop) return

      if (repeatMode === RepeatMode.repeatPlaylist || repeatMode === RepeatMode.noRepeat) {
        dispatch(setCurrentTrackIndex(trackIndex === playList.length - 1 ? 0 : trackIndex + 1))
      } else {
        dispatch(playTrack(false))
      }

      if (repeatMode === RepeatMode.noRepeat && trackIndex === playList.length - 1) {
        dispatch(setCurrentTrackIndex(0))
        dispatch(setCurrentTime(0))
        dispatch(playTrack(false))
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('volumechange', handleChangeVolume)
    audio.addEventListener('loop', switchLoop)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('volumechange', handleChangeVolume)
      audio.removeEventListener('loop', switchLoop)
    }
  }, [trackIndex, dispatch, loop, repeatMode, playList])

  useEffect(() => {
    const audio = player.current
    if (!audio) return

    const newSrc = playList[trackIndex].source

    if (!audio.src.includes(newSrc)) {
      audio.src = newSrc
      audio.load()

      const onLoaded = () => {
        if (selectedTime !== null) {
          audio.currentTime = selectedTime
          dispatch(setCurrentTime(selectedTime))
          dispatch(setSelectedTime(null))
        }
        if (play) {
          audio.play().catch((err) => console.warn('Autoplay error:', err))
        }
      }

      audio.addEventListener('loadedmetadata', onLoaded)

      return () => {
        audio.removeEventListener('loadedmetadata', onLoaded)
      }
    } else {
      if (play) {
        audio.play().catch((err) => console.warn('Autoplay error:', err))
      }
    }
  }, [trackIndex, play, selectedTime, dispatch, playList])

  useEffect(() => {
    if (player.current) {
      player.current.loop = repeatMode === RepeatMode.repeatTrack
    }
  }, [repeatMode])

  return (
    <Card className={`${theme} items-center relative`}>
      <audio ref={player} />

      <ControlPanel player={player as RefObject<HTMLAudioElement>} />

      <PlayList />
    </Card>
  )
}

export default App
