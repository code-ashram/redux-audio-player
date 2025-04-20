import { FC } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { repeatMode, setRepeatMode } from '@/store/playerSlice.ts'

const RepeatController: FC = () => {
  const dispatch = useDispatch()
  const repeat = useSelector(repeatMode)

  const toggleRepeatMode = () => {
    dispatch(setRepeatMode())

    console.log(repeat)
  }

  return (
    <>
      <button onClick={toggleRepeatMode}>
        Repeat
      </button>
    </>
  )

}

export default RepeatController
