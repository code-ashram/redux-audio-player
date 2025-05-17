import { useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useDispatch } from 'react-redux'
import { initializePlayer } from '@/store/playerSlice.ts'

import ControlPanel from '@/components/ControlPanel.tsx'
import PlayList from '@/components/PlayList.tsx'
import { Card } from '@/components/ui/card'

import './App.scss'
import { getArtist } from '@/api/endpoints.ts'

const App = () => {
  const { theme } = useTheme()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializePlayer())

    getArtist('43w158jyKQJBTK2M8DPy9T').then(r => console.log(r))
  }, [dispatch])

  return (
    <Card className={`${theme} items-center relative`}>
      <ControlPanel />

      <PlayList />
    </Card>
  )
}

export default App
