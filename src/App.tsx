import { RefObject, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@/components/theme-provider'

import { Card } from '@/components/ui/card'
import PlayList from '@/components/PlayList.tsx'
import ControlPanel from '@/components/ControlPanel.tsx'
import PlayerHeader from '@/components/PlayerHeader.tsx'

import trackList from '@/API/trackList.ts'

import './App.scss'

import {
  currentTrackIndex,
  isLoop,
  isPlaying,
  playTrack,
  setCurrentTime,
  setCurrentTrackIndex,
  setDuration,
  setSelectedTime,
  setVolume,
  toggleLoop,
  trackSelectedTime
} from '@/store/playerSlice.ts'

const App = () => {
  const player = useRef<HTMLAudioElement | null>(null)

  const loop = useSelector(isLoop)
  const dispatch = useDispatch()
  const { theme } = useTheme()

  const selectedTime = useSelector(trackSelectedTime)
  const trackIndex = useSelector(currentTrackIndex)
  const play = useSelector(isPlaying)

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
      if (loop && player.current) {
        dispatch(setCurrentTime(0))
        dispatch(playTrack(true))
      } else {
        dispatch(setCurrentTrackIndex(trackIndex === trackList.length - 1 ? 0 : trackIndex + 1))
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
  }, [trackIndex, dispatch, loop])

  useEffect(() => {
    const audio = player.current
    if (!audio) return

    const newSrc = trackList[trackIndex].source

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
  }, [trackIndex, play, selectedTime, dispatch])

  return (
    <Card className={`${theme} items-center relative`}>
      <audio ref={player} />

      <PlayerHeader/>

      <ControlPanel player={player as RefObject<HTMLAudioElement>} />

      <PlayList />

    </Card>
  )
}

export default App
