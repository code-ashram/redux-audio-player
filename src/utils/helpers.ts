export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

export const setTableColumnColor = (theme: string) =>
  theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'
