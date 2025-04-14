import { useEffect, useRef, useState } from 'react'

import { useTheme } from '@/components/theme-provider'
import { Card } from '@/components/ui/card'
import PlayList from '@/components/PlayList.tsx'

import trackList from '@/API/trackList.ts'

import './App.scss'
import ControlPanel from '@/components/ControlPanel.tsx'
import PlayerHeader from '@/components/PlayerHeader.tsx'

const App = () => {
  const { theme } = useTheme()
  const player = useRef<HTMLAudioElement | null>(null)

  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState<number>(0.7)
  const [isLoop, setIsLoop] = useState<boolean>(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  useEffect(() => {
    const audio = player.current

    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleBackTimeToStart = () => {
      setCurrentTime(0)
      setIsPlaying(false)
    }

    const handleChangeVolume = () => {
      setVolume(audio.volume)
    }

    const toggleLoop = () => {
      setIsLoop(audio.loop)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleBackTimeToStart)
    audio.addEventListener('volumechange', handleChangeVolume)
    audio.addEventListener('loop', toggleLoop)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleBackTimeToStart)
      audio.removeEventListener('volumechange', handleChangeVolume)
      audio.removeEventListener('loop', toggleLoop)
    }
  }, [])

  const handlePlayTrack = () => {
    if (!player.current) return

    if (player.current.paused) {
      player.current.play().then(() => setIsPlaying(true))
    } else {
      player.current.pause()
      setIsPlaying(false)
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

  const toggleLoop = () => {
    if (!player.current) return

    const newLoopValue = !player.current.loop
    player.current.loop = newLoopValue
    setIsLoop(newLoopValue)

    console.log(isLoop)
  }

  const handleNextTrack = (): void =>
    setCurrentTrackIndex((prevIndex) => prevIndex === trackList.length - 1 ? 0 : prevIndex + 1)

  const handlePreviousTrack = (): void =>
    setCurrentTrackIndex((prevIndex) => prevIndex <= 0 ? trackList.length - 1 : prevIndex - 1)

  const handleChoseTrackFromList = (trackIndex: number) => {
    setCurrentTrackIndex(trackIndex)
  }

  return (
    <Card className={`${theme} items-center relative`}>
      <PlayerHeader/>

      <ControlPanel
        currentTime={currentTime}
        volume={volume}
        duration={duration}
        isPlaying={isPlaying}
        isLoop={isLoop}
        onPrev={handlePreviousTrack}
        onPlay={handlePlayTrack}
        onNext={handleNextTrack}
        onLoop={toggleLoop}
        onTime={handleSelectTrackTime}
        onVolume={handleChangeVolume}
      />

      <PlayList list={trackList} onChose={(trackIndex) => handleChoseTrackFromList(trackIndex)} />

      <audio ref={player} src={trackList[currentTrackIndex].source}></audio>
    </Card>
  )
}

export default App
