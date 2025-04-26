import { put } from 'redux-saga/effects'
import { setVolume } from '@/store/playerSlice.ts'

export function * changeVolumeSaga () {
  console.log('changeVolumeSaga')
  const payload = 0
  yield put(setVolume(payload))
}

export function * watchChangeVolumeSaga () {

}
