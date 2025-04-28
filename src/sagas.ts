import { takeEvery, put } from 'redux-saga/effects'
import { playAudio, pauseAudio, toggleAudio } from '@/store/playerSlice.ts'

import { player } from './player'

function * handleToggleAudio () {
  if (!player) return

  if (player.paused) {
    yield player.play()
    yield put(playAudio())
  } else {
    player.pause()
    yield put(pauseAudio())
  }
}

export function * audioSaga () {
  yield takeEvery(toggleAudio.type, handleToggleAudio)
}
