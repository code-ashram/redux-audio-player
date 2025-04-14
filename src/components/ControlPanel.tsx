import { FC } from 'react'

import { Card } from './ui/card'
import { Slider } from '@/components/ui/slider.tsx'
import { Popover } from '@/components/ui/popover.tsx'
import { Button } from '@/components/ui/button.tsx'
import PlayTrackBtn from '@/assets/images/PlayTrackBtn.svg?react'
import PrevTrackBtn from '@/assets/images/PrevTrackBtn.svg?react'
import NextTrackBtn from '@/assets/images/NextTrackBtn.svg?react'
import PauseTrackBtn from '@/assets/images/PauseTrackBtn.svg?react'
import RepeatTrackBtn from '@/assets/images/RepeatTrackBtn.svg?react'

import { formatTime } from '@/utils/helpers.ts'

import { IconVolumeDown, IconVolumeFull, IconVolumeUp } from 'justd-icons'

type Props = {
  currentTime: number,
  duration: number,
  isPlaying: boolean,
  volume: number,
  isLoop: boolean,
  onLoop: () => void,
  onPrev: () => void,
  onPlay: () => void,
  onNext: () => void,
  onVolume: (value: number) => void,
  onTime: (value: number) => void
}

const ControlPanel: FC<Props> = ({
  currentTime,
  duration,
  isPlaying,
  volume,
  isLoop,
  onLoop,
  onPrev,
  onPlay,
  onNext,
  onVolume,
  onTime
}) => {

  return (
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
                onChange={(value) => onVolume(value as number)}
        />
      </div>

      <div className={'mt-7 flex w-full items-center justify-around'}>
        <button onClick={() => onLoop()} className={`controlButton ${isLoop ? 'active' : null}`}>
          <RepeatTrackBtn />
        </button>

        <button className="controlButton" onClick={() => onPrev()}>
          <PrevTrackBtn />
        </button>

        <button className="controlButton" onClick={() => onPlay()}>
          {isPlaying
            ? <PauseTrackBtn />
            : <PlayTrackBtn />
          }
        </button>

        <button className="controlButton" onClick={() => onNext()}>
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
                onChange={(value) => onTime(value as number)}
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
