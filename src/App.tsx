import { useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useDispatch } from 'react-redux'
import { initializePlayer } from '@/store/playerSlice.ts'

import ControlPanel from '@/components/ControlPanel.tsx'
import PlayList from '@/components/PlayList.tsx'
import { Card } from '@/components/ui/card'

import './App.scss'

import express from 'express'
import dotenv from 'dotenv'

const port: number = 5000

dotenv.config()

const clientId: string = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const clientSecret: string = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
const redirectUri: string = import.meta.env.VITE_SPOTIFY_CLIENT_REDIRECT

const app = express()

app.get('/auth/login', (req, res) => {
})

app.get('/auth/callback', (req, res) => {
})

app.listen(port, () => {
  console.log(`Listening at http://127.0.0.1:${port}`)
})

const App = () => {
  const { theme } = useTheme()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializePlayer())
  }, [dispatch])

  return (
    <Card className={`${theme} items-center relative`}>
      <ControlPanel />

      <PlayList />
    </Card>
  )
}

export default App
