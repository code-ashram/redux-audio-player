import { delay, put, select, takeEvery } from 'redux-saga/effects'
import {
  choseTrack,
  currentTrackIndex,
  initializePlayer,
  loadTrack,
  nextTrackRequest,
  pauseAudio,
  playAudio,
  playerPlaylist,
  prevTrackRequest,
  setCurrentTime,
  setCurrentTrackIndex,
  toggleAudio
} from '@/store/playerSlice.ts'
import { PayloadAction } from '@reduxjs/toolkit'

import { player } from './player'
import Track from '@/models/Track.ts'

function * handleInitializePlayer () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  const index: number = yield select(currentTrackIndex)

  const track = playlist[index]

  if (!track || !player) return

  player.src = track.source
  player.load()

  yield put(setCurrentTime(0))
}

function * handleLoadTrack () {
  if (!player) return

  const index: number = yield select(currentTrackIndex)
  const playlist: Track[] = yield select(playerPlaylist)

  const track = playlist[index]
  if (!track) return

  player.src = track.source
  player.load()

  yield new Promise(resolve => {
    player?.addEventListener('loadedmetadata', () => {
      resolve(true)
    }, { once: true })
  })

  player.currentTime = 0
  yield put(setCurrentTime(0))
  yield player.play()
  yield put(playAudio())
}

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

function * handleNextTrack () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  const index: number = yield select(currentTrackIndex)

  const nextIndex = index === playlist.length - 1 ? 0 : index + 1
  const nextTrack = playlist[nextIndex]

  yield put(setCurrentTrackIndex(nextIndex))

  if (player) {
    player.src = nextTrack.source
    player.load()

    yield delay(100)
    yield put(setCurrentTime(0))

    try {
      yield player.play()
      yield put(playAudio())
    } catch (e) {
      console.warn('Playing error:', e)
    }
  }
}

function * handlePrevTrack () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  const index: number = yield select(currentTrackIndex)

  const prevIndex = index <= 0 ? playlist.length - 1 : index - 1
  const prevTrack = playlist[prevIndex]

  yield put(setCurrentTrackIndex(prevIndex))

  if (player) {
    player.src = prevTrack.source
    player.load()

    yield delay(100)
    yield put(setCurrentTime(0))

    try {
      yield player.play()
      yield put(playAudio())
    } catch (e) {
      console.warn('Autoplay error:', e)
    }
  }
}

export function* handleChooseTrack({ payload: chosenIndex }: PayloadAction<number>) {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)

  // Безопасная проверка
  if (!playlist || !playlist[chosenIndex]) {
    console.warn('Chosen track is invalid or not found')
    return
  }

  const chosenTrack = playlist[chosenIndex]

  // Обновляем индекс
  yield put(setCurrentTrackIndex(chosenIndex))

  // Обновляем плеер
  if (player) {
    try {
      player.src = chosenTrack.source
      player.load()

      yield delay(100) // Дать время на загрузку

      yield put(setCurrentTime(0))

      yield player.play()
      yield put(playAudio())
    } catch (e) {
      console.warn('Error while trying to play chosen track:', e)
      yield put(pauseAudio())
    }
  }
}

export function * audioSaga () {
  yield takeEvery(nextTrackRequest.type, handleNextTrack)
  yield takeEvery(prevTrackRequest.type, handlePrevTrack)
  yield takeEvery(loadTrack.type, handleLoadTrack)
  yield takeEvery(toggleAudio.type, handleToggleAudio)
  yield takeEvery(initializePlayer.type, handleInitializePlayer)
  yield takeEvery(choseTrack.type, handleChooseTrack)
}
