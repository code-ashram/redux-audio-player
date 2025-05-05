import {
  call,
  type CallEffect,
  cancel,
  cancelled,
  type ChannelTakeEffect,
  debounce,
  delay,
  Effect,
  fork,
  put,
  type PutEffect,
  select,
  take,
  takeEvery
} from 'redux-saga/effects'
import {
  choseTrack,
  currentTrackIndex,
  initializePlayer,
  isPlaying,
  loadTrack,
  nextTrackRequest,
  pauseAudio,
  playAudio,
  playerPlaylist,
  playerRepeatMode,
  prevTrackRequest,
  seekTo,
  setCurrentTime,
  setCurrentTrackIndex,
  setDuration,
  setRepeatMode,
  toggleAudio,
  toggleLoop,
  toggleRepeatMode,
  trackDuration,
  trackEnded
} from '@/store/playerSlice.ts'
import { PayloadAction } from '@reduxjs/toolkit'

import { player } from './player'
import Track from '@/models/Track.ts'
import RepeatMode from '@/models/RepeatMode.ts'
import { EventChannel, eventChannel, Task } from 'redux-saga'

let timeUpdateTask: Task | null = null

function * handleToggleAudio () {
  if (!player) return

  const isPlayingNow: boolean = yield select(isPlaying)

  try {
    if (isPlayingNow) {
      player.pause()
      yield put(pauseAudio())
    } else {
      yield call([player, player.play])
      yield put(playAudio())
    }
  } catch (e) {
    console.error('handleToggleAudio: Error during toggle:', e)
    yield put(pauseAudio()) // fallback на паузу при ошибке
  }
}

function * trackTimeUpdateLoop (): Generator<Effect, void, boolean> {
  try {
    while (true) {
      if (!player || player.paused) {
        yield delay(500)
        continue
      }

      const currentTime = player.currentTime
      const duration = player.duration

      yield put(setCurrentTime(currentTime))

      const isAlmostFinished = duration && currentTime >= duration - 0.1
      if (isAlmostFinished) {
        yield delay(150)

        if (player.ended) {
          yield put(trackEnded())
          break
        }

        yield put(setCurrentTime(duration))
      }

      yield delay(500)
    }
  } finally {
    const wasCancelled: boolean = yield cancelled()
    console.log(
      wasCancelled
        ? 'Time update loop cancelled.'
        : 'Time update loop finished normally (track ended).'
    )
  }
}

function * handlePlayAudio () {
  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
  }
  timeUpdateTask = yield fork(trackTimeUpdateLoop)
}

function * handlePauseAudio () {
  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
    timeUpdateTask = null
  }
}

function * handleTrackEnded () {
  const repeatMode: RepeatMode = yield select(playerRepeatMode)
  const trackIndex: number = yield select(currentTrackIndex)
  const playlist: Track[] = yield select(playerPlaylist)

  if (!player) return

  if (repeatMode === RepeatMode.repeatTrack) {
    return
  }

  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
    timeUpdateTask = null
  }

  const isLastTrack = trackIndex >= playlist.length - 1

  if (repeatMode === RepeatMode.repeatPlaylist) {
    if (isLastTrack) {
      yield put(setCurrentTrackIndex(0))
    } else {
      yield put(setCurrentTrackIndex(trackIndex + 1))
    }
    yield put(loadTrack())
  }

  if (repeatMode === RepeatMode.noRepeat) {
    if (!isLastTrack) {
      yield put(setCurrentTrackIndex(trackIndex + 1))
      yield put(loadTrack())
    } else {
      yield put(pauseAudio())
      yield put(setCurrentTime(0))
      yield put(setCurrentTrackIndex(0))
    }
  }
}

function * handleInitializePlayer () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)

  if (!player || !playlist || playlist.length === 0) return
  yield put(loadTrack())
}

function * handleLoadTrack () {
  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
    timeUpdateTask = null
  }

  if (!player) return

  const index: number = yield select(currentTrackIndex)
  const playlist: Track[] = yield select(playerPlaylist)

  const track = playlist[index]
  if (!track) return

  player.src = track.source

  player.load()

  try {
    yield new Promise((resolve, reject) => {
      const onMetadataLoaded = () => {
        player?.removeEventListener('error', onError)
        resolve(true)
      }
      const onError = (e: Event) => {
        console.error('handleLoadTrack: Error during media loading:', e)
        player?.removeEventListener('loadedmetadata', onMetadataLoaded)
        reject(new Error('Media loading failed'))
      }

      player?.addEventListener('loadedmetadata', onMetadataLoaded, { once: true })
      player?.addEventListener('error', onError, { once: true })
    })

    const duration = player.duration
    yield put(setDuration(duration || 0))

    player.currentTime = 0
    yield put(setCurrentTime(0))

    try {
      yield call([player, player.play])

      yield put(playAudio())

    } catch (playError) {
      console.warn('handleLoadTrack: Autoplay failed after load:', playError)
      yield put(pauseAudio())
    }

  } catch (error) {
    console.error('handleLoadTrack: Failed to load or play track:', error)
    yield put(pauseAudio())
    yield put(setCurrentTime(0))
  }
}

function * handleNextTrack () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  const index: number = yield select(currentTrackIndex)
  const nextIndex = index === playlist.length - 1 ? 0 : index + 1
  yield put(setCurrentTrackIndex(nextIndex))
  yield put(loadTrack())
}

function * handlePrevTrack () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  const index: number = yield select(currentTrackIndex)
  const prevIndex = index <= 0 ? playlist.length - 1 : index - 1
  yield put(setCurrentTrackIndex(prevIndex))
  yield put(loadTrack())
}

export function * handleChooseTrack ({ payload: chosenIndex }: PayloadAction<number>) {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  if (!playlist || !playlist[chosenIndex]) {
    console.warn('Chosen track is invalid or not found')
    return
  }
  yield put(setCurrentTrackIndex(chosenIndex))
  yield put(loadTrack())
}

function * handleSeekTo ({ payload }: PayloadAction<number>) {
  const time = payload
  const duration: number = yield select(trackDuration)

  if (player && !isNaN(time) && time >= 0 && time <= duration) {
    player.currentTime = time
    yield put(setCurrentTime(time))
  } else {
    console.warn(`Saga: Invalid seek time: ${time}, duration: ${duration}`)
  }
}

function * handleRepeatMode () {
  if (!player) return

  const currentMode: RepeatMode = yield select(playerRepeatMode)

  let nextMode: RepeatMode
  let shouldLoop: boolean

  switch (currentMode) {
    case RepeatMode.noRepeat:
      nextMode = RepeatMode.repeatTrack
      shouldLoop = true
      break
    case RepeatMode.repeatTrack:
      nextMode = RepeatMode.repeatPlaylist
      shouldLoop = false
      break
    case RepeatMode.repeatPlaylist:
    default:
      nextMode = RepeatMode.noRepeat
      shouldLoop = false
      break
  }

  yield put(setRepeatMode(nextMode))
  yield put(toggleLoop(shouldLoop))

  player.loop = shouldLoop
}

export function createEndedChannel (player: HTMLAudioElement): EventChannel<boolean> {
  return eventChannel<boolean>(emitter => {
    const handler = () => emitter(true)
    player.addEventListener('ended', handler)
    return () => {
      player.removeEventListener('ended', handler)
    }
  })
}

export function * watchTrackEnd (): Generator<
  CallEffect<EventChannel<boolean>> | ChannelTakeEffect<boolean> | PutEffect<ReturnType<typeof trackEnded>>,
  void,
  EventChannel<boolean>
> {
  if (!player) return

  const channel = yield call(createEndedChannel, player)

  while (true) {
    yield take(channel)
    yield put(trackEnded())
  }
}

export function * audioSaga () {
  yield takeEvery(playAudio.type, handlePlayAudio)
  yield takeEvery(pauseAudio.type, handlePauseAudio)
  yield takeEvery(loadTrack.type, handleLoadTrack)
  yield takeEvery(trackEnded.type, handleTrackEnded)
  yield takeEvery(toggleAudio.type, handleToggleAudio)
  yield takeEvery(toggleRepeatMode.type, handleRepeatMode)
  yield takeEvery(nextTrackRequest.type, handleNextTrack)
  yield takeEvery(prevTrackRequest.type, handlePrevTrack)
  yield takeEvery(loadTrack.type, handleLoadTrack)
  yield takeEvery(toggleAudio.type, handleToggleAudio)
  yield takeEvery(initializePlayer.type, handleInitializePlayer)
  yield takeEvery(choseTrack.type, handleChooseTrack)
  yield debounce(300, seekTo.type, handleSeekTo);
  yield fork(watchTrackEnd)
}
