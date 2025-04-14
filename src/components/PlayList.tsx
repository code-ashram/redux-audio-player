import { FC, useRef, useState } from 'react'

import { Card } from './ui/card'

import Track from '@/models/Track.ts'

type Props = {
  list: Track[]
  onChose: (trackIndex: number) => void
}

const PlayList: FC<Props> = ({ list, onChose }) => {
  const listRefs = useRef<(HTMLLIElement | null)[]>([])
  const [isActive, setIsActive] = useState<number | null>(null)

  const handleChoseTrack = (trackIndex: number) => {
    onChose(trackIndex)
    setIsActive(trackIndex)
    listRefs.current[trackIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <Card.Footer className="w-full border-t-transparent">
    <ul className="playlist border-1">
      {list.map((track, index) =>
        <li
          key={track.id}
          className={`listItem px-3 py-2 cursor-pointer border-b-1 ${isActive === index ? 'active' : null}`}
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
