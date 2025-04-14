import { FC } from 'react'

import { Card } from '@/components/ui/card.tsx'
import { ThemeSwitcher } from '@/components/ui/theme-switcher.tsx'

import albumImage from '@/assets/images/svarga-dvar.jpg'

const PlayerHeader: FC = () => (

  <Card.Header>
    <img src={albumImage} alt="Album's image" height="200px" />

    <ThemeSwitcher />
  </Card.Header>
)

export default PlayerHeader
