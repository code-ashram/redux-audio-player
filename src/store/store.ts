import { configureStore } from '@reduxjs/toolkit'

import playerReducer from './playerSlice.ts'

const store = configureStore({
  reducer: {
    tasks: playerReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store
