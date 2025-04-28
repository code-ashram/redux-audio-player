import { useTheme } from '@/components/theme-provider'

import { Card } from '@/components/ui/card'
import PlayList from '@/components/PlayList.tsx'
import ControlPanel from '@/components/ControlPanel.tsx'

import './App.scss'

const App = () => {
  const { theme } = useTheme()

  return (
    <Card className={`${theme} items-center relative`}>
      <ControlPanel />

      <PlayList />
    </Card>
  )
}

export default App
