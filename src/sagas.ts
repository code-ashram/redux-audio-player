import { call, cancel, cancelled, debounce, delay, fork, put, select, takeEvery } from 'redux-saga/effects'
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

let timeUpdateTask: any = null

function * handleToggleAudio () {
  if (!player) return
  // Читаем ТЕКУЩЕЕ состояние ДО каких-либо изменений
  const currentlyPlaying: boolean = yield select(isPlaying)

  if (currentlyPlaying) {
    // Если сейчас играет, то нужно поставить на паузу
    console.log('handleToggleAudio: Currently playing, pausing...')
    try {
      // Сначала вызываем метод плеера
      player.pause()
      // Затем диспатчим действие для обновления состояния и остановки таймера
      yield put(pauseAudio())
    } catch (e) {
      console.error('Error trying to pause audio:', e)
      // В случае ошибки можно ничего не делать или оставить pauseAudio
    }
  } else {
    // Если сейчас на паузе, то нужно начать играть
    console.log('handleToggleAudio: Currently paused, playing...')
    try {
      // Сначала вызываем метод плеера
      yield call([player, player.play])
      // Затем диспатчим действие для обновления состояния и запуска таймера
      yield put(playAudio())
    } catch (e) {
      console.error('Error trying to play audio via toggle:', e)
      // Если play() не удался, убедимся, что состояние остается "пауза"
      yield put(pauseAudio())
    }
  }
}

function * trackTimeUpdateLoop () {
  try {
    console.log('Time update loop started.')
    while (true) {
      if (player && !player.paused) {
        const currentTime = player.currentTime
        const duration = player.duration

        // Обновляем время в сторе
        yield put(setCurrentTime(currentTime))

        // Проверка на конец трека (с небольшим запасом)
        if (duration && currentTime >= duration - 0.1) {
          // Даем плееру немного времени завершить событие 'ended'
          yield delay(150)
          // Проверяем снова, если он все еще 'ended'
          if (player.ended) {
            console.log('Track ended detected in loop, dispatching trackEnded.')
            yield put(trackEnded())
            break // Выходим из цикла, так как трек закончился
          } else {
            // Если не закончился, но время близко к концу, просто ставим конечное время
            yield put(setCurrentTime(duration))
          }
        }
      }
      // Пауза перед следующей итерацией
      yield delay(500) // Обновляем каждые 0.5 секунды
    }
  } finally {
    if (yield cancelled()) {
      console.log('Time update loop cancelled.')
    } else {
      console.log('Time update loop finished normally (track ended).')
    }
  }
}

function * handlePlayAudio () {
  // Отменяем предыдущую задачу, если она была
  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
    console.log('Previous time update task cancelled.')
  }
  // Запускаем новую задачу обновления времени в фоне
  timeUpdateTask = yield fork(trackTimeUpdateLoop)
  console.log('Forked new time update task.')
  // Редьюсер playAudio уже обновил isPlaying = true
}

// --- Сага-обработчик паузы ---
function * handlePauseAudio () {
  // Отменяем задачу обновления времени, если она есть
  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
    timeUpdateTask = null // Сбрасываем ссылку
    console.log('Cancelled time update task due to pause/load.')
  }
  // Редьюсер pauseAudio уже обновил isPlaying = false
}

function * handleTrackEnded () {
  console.log('Saga: Handling track ended.')
  // Убедимся, что цикл обновления точно остановлен
  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
    timeUpdateTask = null
  }

  const repeat: RepeatMode = yield select(playerRepeatMode)
  const index: number = yield select(currentTrackIndex)
  const playlist: Track[] = yield select(playerPlaylist)

  if (repeat === RepeatMode.repeatTrack) {
    console.log('RepeatMode: repeatTrack. Seeking to 0 and playing.')
    // player.currentTime = 0; // Установка напрямую
    yield put(seekTo(0))     // Или через действие (предпочтительно)
    // Небольшая задержка перед попыткой воспроизведения
    yield delay(50)
    // Пытаемся воспроизвести снова
    try {
      if (player) yield call([player, player.play]) // Используем call для вызова метода объекта
      yield put(playAudio()) // Диспатчим playAudio, чтобы запустить цикл обновления
    } catch (e) {
      console.error('Error trying to replay track:', e)
      yield put(pauseAudio()) // Ставим на паузу в случае ошибки
    }
  } else if (repeat === RepeatMode.repeatPlaylist || index < playlist.length - 1) {
    console.log('RepeatMode: repeatPlaylist or tracks remaining. Requesting next track.')
    yield put(nextTrackRequest()) // Запускаем загрузку следующего трека
  } else {
    console.log('RepeatMode: noRepeat and end of playlist. Stopping.')
    // Дополнительно убедимся, что состояние "пауза" и время сброшено
    yield put(pauseAudio())
    yield put(setCurrentTime(0))
  }
}

function * handleInitializePlayer () {
  // Проверяем, есть ли вообще плейлист и плеер
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  if (!player || !playlist || playlist.length === 0) {
    console.warn('Player or initial playlist not available for initialization.')
    return
  }
  console.log('Saga: Initializing player, dispatching loadTrack...')
  // Запускаем основной процесс загрузки через handleLoadTrack
  yield put(loadTrack())
}

// Модифицированная сага загрузки трека с логированием
function * handleLoadTrack () {
  if (timeUpdateTask) {
    yield cancel(timeUpdateTask)
    timeUpdateTask = null
    console.log('Cancelled time update task before loading new track.')
  }

  if (!player) {
    console.error('handleLoadTrack: Player instance is not available.')
    return
  }

  const index: number = yield select(currentTrackIndex)
  const playlist: Track[] = yield select(playerPlaylist)

  const track = playlist[index]
  if (!track) {
    console.error(`handleLoadTrack: Track at index ${index} not found.`)
    return
  }

  console.log(`handleLoadTrack: Setting source to ${track.source} for track index ${index}`)
  player.src = track.source
  console.log('handleLoadTrack: Calling player.load()')
  player.load()

  try {
    console.log('handleLoadTrack: Waiting for "loadedmetadata" event...')
    // Ожидаем событие или ошибку
    yield new Promise((resolve, reject) => {
      const onMetadataLoaded = () => {
        console.log(`handleLoadTrack: "loadedmetadata" event received. Duration: ${player?.duration}`)
        // Убираем слушатель ошибок, так как метаданные успешно загружены
        player?.removeEventListener('error', onError)
        resolve(true)
      }
      const onError = (e: Event) => {
        console.error('handleLoadTrack: Error during media loading:', e)
        // Убираем слушатель метаданных, так как произошла ошибка
        player?.removeEventListener('loadedmetadata', onMetadataLoaded)
        reject(new Error('Media loading failed'))
      }

      player?.addEventListener('loadedmetadata', onMetadataLoaded, { once: true })
      player?.addEventListener('error', onError, { once: true })
    })

    // Событие произошло, устанавливаем длительность
    const duration = player.duration
    yield put(setDuration(duration || 0))

    // Сбрасываем время и начинаем воспроизведение
    player.currentTime = 0
    yield put(setCurrentTime(0))

    try {
      yield call([player, player.play])
      // Если play() успешен, запускаем цикл обновления
      yield put(playAudio()) // Диспатч playAudio обновит стейт и запустит цикл
      console.log('handleLoadTrack: Play successful after load.')
    } catch (playError) {
      console.warn('handleLoadTrack: Autoplay failed after load:', playError)
      // Если автоплей не сработал, просто переводим в состояние паузы
      yield put(pauseAudio())
    }

  } catch (error) {
    console.error('handleLoadTrack: Failed to load or play track:', error)
    yield put(pauseAudio())
    // Не сбрасываем duration здесь
    yield put(setCurrentTime(0))
  }
}

// Сага переключения трека (убедитесь, что она вызывает loadTrack)
function * handleNextTrack () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  const index: number = yield select(currentTrackIndex)
  const nextIndex = index === playlist.length - 1 ? 0 : index + 1
  yield put(setCurrentTrackIndex(nextIndex))
  yield put(loadTrack()) // <-- Важно!
}

// Сага переключения трека (убедитесь, что она вызывает loadTrack)
function * handlePrevTrack () {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  const index: number = yield select(currentTrackIndex)
  const prevIndex = index <= 0 ? playlist.length - 1 : index - 1
  yield put(setCurrentTrackIndex(prevIndex))
  yield put(loadTrack()) // <-- Важно!
}

// Сага выбора трека (убедитесь, что она вызывает loadTrack)
export function* handleChooseTrack({ payload: chosenIndex }: PayloadAction<number>) {
  const playlist: ReturnType<typeof playerPlaylist> = yield select(playerPlaylist)
  if (!playlist || !playlist[chosenIndex]) {
    console.warn('Chosen track is invalid or not found')
    return
  }
  yield put(setCurrentTrackIndex(chosenIndex))
  yield put(loadTrack()) // <-- Важно!
}

function * handleSeekTo ({ payload }: PayloadAction<number>) {
  const time = payload
  console.log(`Saga: Seeking to ${time}`)
  const duration: number = yield select(trackDuration) // Используем селектор

  if (player && !isNaN(time) && time >= 0 && time <= duration) {
    player.currentTime = time
    yield put(setCurrentTime(time)) // Обновляем стор после установки времени
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

  console.log(`New repeatMode: ${nextMode}, isLoop: ${shouldLoop}`)
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
}
