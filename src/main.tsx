import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { ThemeProvider } from '@/components/theme-provider'

import store from './store/store.ts'

import App from './App.tsx'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    </Provider>
  </StrictMode>,
)
