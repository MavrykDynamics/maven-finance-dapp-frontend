import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { State } from 'reducers'

// TODO: add docs for this hook
export const useDataLoader = (callback: (isDepsChanged?: boolean) => Promise<void>, deps: React.DependencyList) => {
  const { isInitialDataLoading } = useSelector((state: State) => state.loading)
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    if (isInitialDataLoading === false) {
      setLoading(true)
      callback(true).finally(() => {
        setLoading(false)
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, isInitialDataLoading])

  return { isLoading }
}
