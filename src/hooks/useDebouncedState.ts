import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

export function useDebouncedState<T>(initialValue: T, delay = 300) {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedValue(value)
    }, delay)

    handler()

    return () => {
      handler.cancel()
    }
  }, [value, delay])

  return [value, setValue, debouncedValue] as const
}
