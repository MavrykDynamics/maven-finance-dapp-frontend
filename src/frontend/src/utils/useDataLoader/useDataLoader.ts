import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { State } from 'reducers'

type DepsType = Array<string | number | boolean | null | undefined>

export function areHookDepsEqual(prevDeps: DepsType | null, nextDeps: DepsType) {
  if (prevDeps === null || prevDeps.length !== nextDeps.length) {
    return false
  }

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {
      return false
    }
  }

  return true
}

export const useDataLoader = (callback: () => void, deps: DepsType) => {
  const state = useRef<{
    deps: DepsType | null
  }>({
    deps: null,
  })

  const { isInitialDataLoading } = useSelector((state: State) => state.loading)

  const nextDeps = deps === undefined ? null : deps
  const prevDeps = state.current.deps

  const isDepsChanged = nextDeps === null || !areHookDepsEqual(prevDeps, nextDeps)

  const [isLoading, setLoading] = useState(isDepsChanged)

  const asyncLoadData = async () => {
    if (!isInitialDataLoading) {
      setLoading(true)
      await callback()
      setLoading(false)
    }
  }

  useEffect(() => {
    asyncLoadData()
  }, [isInitialDataLoading])

  return { isLoading }
}
