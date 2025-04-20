import { FC, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { currentTrackIndex, playerPlaylist, setCurrentTime, setCurrentTrackIndex } from '@/store/playerSlice.ts'

import { Card } from './ui/card'
import RepeatController from '@/components/RepeatController.tsx'

const PlayList: FC = () => {
  const listRefs = useRef<(HTMLLIElement | null)[]>([])
  const trackIndex = useSelector(currentTrackIndex)
  const playList = useSelector(playerPlaylist)
  const dispatch = useDispatch()

  useEffect(() => {
    if (listRefs.current[trackIndex]) {
      listRefs.current[trackIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [trackIndex])

  const handleChoseTrack = (trackIndex: number) => {
    dispatch(setCurrentTime(0))
    dispatch(setCurrentTrackIndex(trackIndex))
    listRefs.current[trackIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <Card.Footer className="w-full border-t-transparent">
    <ul className="playlist border-1">
      {playList.map((track, index) =>
        <li
          key={track.id}
          className={`listItem px-3 py-2 cursor-pointer border-b-1 ${trackIndex === index ? 'active' : null}`}
          ref={(el) => { listRefs.current[index] = el }}
          onClick={() => handleChoseTrack(index)}
        >
          {`${index + 1}. ${track.artist} - ${track.title}`}
        </li>)}
    </ul>

      <RepeatController />
    </Card.Footer>
  )
}

export default PlayList
