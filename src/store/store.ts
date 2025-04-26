import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import playerReducer, { CHANGE_VOLUME, changeVolume } from './playerSlice.ts'
import { takeEvery } from 'redux-saga/effects'

function * sagas () {
  yield takeEvery(CHANGE_VOLUME, changeVolume)
}

const sagaMiddleware = createSagaMiddleware()
const store = configureStore({
  reducer: {
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)
})
sagaMiddleware.run(sagas)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store
