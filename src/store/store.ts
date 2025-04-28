import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import playerReducer from './playerSlice.ts'
import { audioSaga } from '@/sagas.ts'

const sagaMiddleware = createSagaMiddleware()
const store = configureStore({
  reducer: {
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)
})
sagaMiddleware.run(audioSaga)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store
