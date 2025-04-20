import { FC, RefObject } from 'react'

import { Card } from './ui/card'
import { Slider } from '@/components/ui/slider.tsx'
import { Popover } from '@/components/ui/popover.tsx'
import { Button } from '@/components/ui/button.tsx'
import PlayTrackBtn from '@/assets/images/PlayTrackBtn.svg?react'
import PrevTrackBtn from '@/assets/images/PrevTrackBtn.svg?react'
import NextTrackBtn from '@/assets/images/NextTrackBtn.svg?react'
import PauseTrackBtn from '@/assets/images/PauseTrackBtn.svg?react'
import RepeatTrackBtn from '@/assets/images/RepeatTrackBtn.svg?react'
import RepeatPlaylistBtn from '@/assets/images/RepeatPlaylistBtn.svg?react'
import { ThemeSwitcher } from '@/components/ui/theme-switcher.tsx'

import { formatTime } from '@/utils/helpers.ts'

import { IconVolumeDown, IconVolumeFull, IconVolumeUp } from 'justd-icons'
import { useDispatch, useSelector } from 'react-redux'
import {
  currentTrackIndex,
  isLoop,
  isPlaying, playerPlaylist,
  playTrack,
  setCurrentTime,
  setCurrentTrackIndex, setRepeatMode,
  setVolume,
  toggleLoop,
  trackCurrentTime,
  trackDuration,
  trackVolume,
  playerRepeatMode
} from '@/store/playerSlice.ts'
import RepeatMode from '@/models/RepeatMode.ts'


type Props = {
  player: RefObject<HTMLAudioElement>
}

const ControlPanel: FC<Props> = ({ player }) => {
  const play = useSelector(isPlaying)
  const loop = useSelector(isLoop)
  const duration = useSelector(trackDuration)
  const currentTime = useSelector(trackCurrentTime)
  const volume = useSelector(trackVolume)
  const trackIndex = useSelector(currentTrackIndex)
  const playList = useSelector(playerPlaylist)
  const repeatMode = useSelector(playerRepeatMode)

  const dispatch = useDispatch()

  const handlePlayTrack = () => {
    if (!player) return

    if (player.current.paused) {
      player.current.play().then(() => dispatch(playTrack(true)))
    } else {
      player.current.pause()
      dispatch(playTrack(false))
    }
  }

  const handleSelectTrackTime = (time: number) => {
    if (!player) return

    player.current.currentTime = time

    setCurrentTime(time)
  }

  const handleChangeVolume = (value: number) => {
    if (!player) return

    player.current.volume = value

    setVolume(value)
  }

  const handleSwitchLoop = () => {
    if (!player) return

    const newLoopValue = !player.current.loop
    player.current.loop = newLoopValue

    dispatch(toggleLoop(newLoopValue))

    dispatch(setRepeatMode())
  }

  const handleNextTrack = (): void => {
    dispatch(setCurrentTime(0))
    dispatch(setCurrentTrackIndex(trackIndex === playList.length - 1 ? 0 : trackIndex + 1))
  }

  const handlePreviousTrack = (): void => {
    dispatch(setCurrentTime(0))
    dispatch(setCurrentTrackIndex(trackIndex <= 0 ? playList.length - 1 : trackIndex - 1))
  }

  return (
    <Card.Content className="w-full flex flex-col items-center border-t-transparent">
      <Card.Header className='h-[245px] w-[280px]'>
        <img src={playList[trackIndex].cover} alt="Album's image" className='w-full object-contain' />

        <ThemeSwitcher />
      </Card.Header>

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
        <button onClick={handleSwitchLoop} className={`controlButton ${loop ? 'active' : null}`}>
          {repeatMode === RepeatMode.noRepeat || repeatMode === RepeatMode.repeatTrack
            ? <RepeatTrackBtn />
            : <RepeatPlaylistBtn/>
          }

        </button>

        <button className="controlButton" onClick={handlePreviousTrack}>
          <PrevTrackBtn />
        </button>

        <button className="controlButton" onClick={handlePlayTrack}>
          {play
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
  )
}

export default ControlPanel
