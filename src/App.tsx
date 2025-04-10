import { useTheme } from '@/components/theme-provider'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import PlayList from '@/components/PlayList.tsx'

import albumImage from '@/assets/images/svarga-dvar.jpg'
import PlayTrackBtn from '@/assets/images/PlayTrackBtn.svg?react'
import PrevTrackBtn from '@/assets/images/PrevTrackBtn.svg?react'
import NextTrackBtn from '@/assets/images/NextTrackBtn.svg?react'

import './App.scss'
import { ThemeSwitcher } from '@/components/ui/theme-switcher.tsx'

const App = () => {
  const { theme } = useTheme()

  return (
    <main className={theme}>
      <Card className="items-center">
        <Card.Header>
          <img src={albumImage} alt="Album's image" height="200px" />
        </Card.Header>

        <Card.Content className="w-full flex flex-col items-center border-t-transparent">
          <div className="flex w-full flex-col gap-y-1">
            <div className="flex w-full items-center justify-between text-sm">
              <span>1:08</span>
              <span>16:00</span>
            </div>

            <Slider className="trackSlider" aria-label="volume" defaultValue={12} />
          </div>

          <div className={'mt-7 flex w-[70%] items-center justify-between'}>
            <button className="controlButton">
              <PrevTrackBtn />
            </button>

            <button className="controlButton">
              <PlayTrackBtn />
            </button>

            <button className="controlButton">
              <NextTrackBtn />
            </button>
          </div>
        </Card.Content>

        <Card.Footer className="w-full border-t-transparent">
          <PlayList />
        </Card.Footer>
        <ThemeSwitcher />
      </Card>

    </main>
  )
}

export default App
