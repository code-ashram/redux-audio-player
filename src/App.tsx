import { useEffect, useRef, useState } from 'react'

import { useTheme } from '@/components/theme-provider'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Popover } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher.tsx'
import PlayList from '@/components/PlayList.tsx'

import { formatTime } from '@/utils/helpers.ts'

import { IconVolumeDown, IconVolumeFull, IconVolumeUp } from 'justd-icons'
import albumImage from '@/assets/images/svarga-dvar.jpg'
import PlayTrackBtn from '@/assets/images/PlayTrackBtn.svg?react'
import PrevTrackBtn from '@/assets/images/PrevTrackBtn.svg?react'
import NextTrackBtn from '@/assets/images/NextTrackBtn.svg?react'
import PauseTrackBtn from '@/assets/images/PauseTrackBtn.svg?react'
import RepeatTrackBtn from '@/assets/images/RepeatTrackBtn.svg?react'

import trackList from '@/API/trackList.ts'

import './App.scss'

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

  return (
    <main className={theme}>
      <Card className="items-center">
        <Card.Header>
          <img src={albumImage} alt="Album's image" height="200px" />
        </Card.Header>

        <Card.Content className="w-full flex flex-col items-center border-t-transparent">
          <div className="flex w-full flex-col gap-y-1">
            <div className="flex w-full items-center justify-between text-sm">
              <span>{formatTime(currentTime)}</span>

              <span>{formatTime(duration)}</span>
            </div>

            <Slider className="trackSlider"
                    aria-label="volume"
                    output="none"
                    value={currentTime}
                    minValue={0}
                    maxValue={duration}
                    onChange={(value) => handleSelectTrackTime(value as number)}
            />
          </div>

          <div className={'mt-7 flex w-full items-center justify-around'}>
            <button onClick={toggleLoop} className={`controlButton ${isLoop ? 'active' : null}`}>
              <RepeatTrackBtn />
            </button>

            <button className="controlButton" onClick={handlePreviousTrack}>
              <PrevTrackBtn />
            </button>

            <button className="controlButton" onClick={handlePlayTrack}>
              {isPlaying
                ? <PauseTrackBtn />
                : <PlayTrackBtn />
              }
            </button>

            <button className="controlButton" onClick={handleNextTrack}>
              <NextTrackBtn />
            </button>

            <Popover>
              <Button intent="outline" size="square-petite">
                <IconVolumeFull />
              </Button>

              <Popover.Content showArrow={false} placement="right" className="p-4 sm:min-w-10">
                <div className="flex flex-col justify-center items-center w-[30px]">
                  <IconVolumeUp />

                  <Slider
                    className="mt-[2px]"
                    maxValue={1}
                    minValue={0}
                    step={0.05}
                    value={volume}
                    output="none"
                    orientation="vertical"
                    onChange={(value) => handleChangeVolume(value as number)}
                    aria-labelledby="volume-label"
                  />

                  <IconVolumeDown className="mt-2 translate-x-[2px]" />
                </div>
              </Popover.Content>
            </Popover>
          </div>
        </Card.Content>

        <Card.Footer className="w-full border-t-transparent">
          <PlayList />
        </Card.Footer>

        <audio ref={player} src={trackList[currentTrackIndex].source}></audio>

        <ThemeSwitcher />
      </Card>
    </main>
  )
}

export default App
