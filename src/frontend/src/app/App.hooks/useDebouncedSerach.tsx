import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'

export const useDebouncedSearch = (delay = 400) => {
  const [inputValue, setInputValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')

  const debouncedSetValue = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedValue(value)
      }, delay),
    [delay],
  )

  const handleChange = (value: string) => {
    setInputValue(value)
    debouncedSetValue(value)
  }

  useEffect(() => {
    return () => {
      debouncedSetValue.cancel()
    }
  }, [debouncedSetValue])

  return { debouncedValue, handleChange, inputValue }
}
