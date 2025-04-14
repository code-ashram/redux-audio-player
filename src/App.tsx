import { useEffect, useRef } from 'react'
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
  setVolume,
  toggleLoop,
  trackCurrentTime,
  trackDuration,
  trackVolume
} from '@/store/playerSlice.ts'

const App = () => {
  const player = useRef<HTMLAudioElement | null>(null)
  const dispatch = useDispatch()
  const { theme } = useTheme()

  const play = useSelector(isPlaying)
  const loop = useSelector(isLoop)
  const duration = useSelector(trackDuration)
  const currentTime = useSelector(trackCurrentTime)
  const volume = useSelector(trackVolume)
  const currentTrack = useSelector(currentTrackIndex)

  useEffect(() => {
    const audio = player.current

    if (!audio) return

    const handleLoadedMetadata = () => {
      dispatch(setDuration(audio.duration))
    }

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime))
    }

    const handleBackTimeToStart = () => {
      dispatch(setCurrentTime(0))
      dispatch(playTrack(false))
    }

    const handleChangeVolume = () => {
      dispatch(setVolume(audio.volume))
    }

    const switchLoop = () => {
      dispatch(toggleLoop(audio.loop))
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleBackTimeToStart)
    audio.addEventListener('volumechange', handleChangeVolume)
    audio.addEventListener('loop', switchLoop)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleBackTimeToStart)
      audio.removeEventListener('volumechange', handleChangeVolume)
      audio.removeEventListener('loop', switchLoop)
    }
  }, [dispatch])

  const handlePlayTrack = () => {
    if (!player.current) return

    if (player.current.paused) {
      player.current.play().then(() => dispatch(playTrack(true)))
    } else {
      player.current.pause()
      dispatch(playTrack(false))
    }
  }

  const handleSelectTrackTime = (time: number) => {
    if (!player.current) return

    player.current.currentTime = time

    setCurrentTime(time)
  }

  const handleChangeVolume = (value: number) => {
    if (!player.current) return

    player.current.volume = value

    setVolume(value)
  }

  const handleSwitchLoop = () => {
    if (!player.current) return

    const newLoopValue = !player.current.loop
    player.current.loop = newLoopValue

    dispatch(toggleLoop(newLoopValue))
  }

  const handleNextTrack = (): void => {
    dispatch(setCurrentTrackIndex(currentTrack === trackList.length - 1 ? 0 : currentTrack + 1))
  }

  const handlePreviousTrack = (): void => {
    dispatch(setCurrentTrackIndex(currentTrack <= 0 ? trackList.length - 1 : currentTrack - 1))
  }

  const handleChoseTrackFromList = (trackIndex: number) => {
    dispatch(setCurrentTrackIndex(trackIndex))
  }

  return (
    <Card className={`${theme} items-center relative`}>
      <audio ref={player} src={trackList[currentTrack].source}></audio>

      <PlayerHeader/>

      <ControlPanel
        currentTime={currentTime}
        volume={volume}
        duration={duration}
        isPlaying={play}
        isLoop={loop}
        onPrev={handlePreviousTrack}
        onPlay={handlePlayTrack}
        onNext={handleNextTrack}
        onLoop={handleSwitchLoop}
        onTime={(time) => handleSelectTrackTime(time)}
        onVolume={handleChangeVolume}
      />

      <PlayList list={trackList} onChose={(trackIndex) => handleChoseTrackFromList(trackIndex)} />

    </Card>
  )
}

export default App
