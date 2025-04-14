import { FC, useState } from 'react'

import Track from '@/models/Track.ts'

type Props = {
  list: Track[]
}

const PlayList: FC<Props> = ({ list }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <ul className="playlist border-1">
      {list.map((track, index) =>
        <li
          key={track.id}
          className={`listItem px-3 py-2 cursor-pointer border-b-1 ${activeIndex === index ? 'active' : ''}`}
          onClick={() => setActiveIndex(index)}
        >
          {`${index + 1}. ${track.artist} - ${track.title}`}
        </li>)}
    </ul>
  )
}

export default PlayList
