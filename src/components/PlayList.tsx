import { FC, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  choseTrack,
  currentTrackIndex,
  playerPlaylist,
} from '@/store/playerSlice.ts'

import { Card } from './ui/card'

const PlayList: FC = () => {
  const listRefs = useRef<(HTMLLIElement | null)[]>([])
  const trackIndex = useSelector(currentTrackIndex)
  const playList = useSelector(playerPlaylist)
  const dispatch = useDispatch()


  const handleChoseTrack = (trackIndex: number) => {
    dispatch(choseTrack(trackIndex))
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

    </Card.Footer>
  )
}

export default PlayList
