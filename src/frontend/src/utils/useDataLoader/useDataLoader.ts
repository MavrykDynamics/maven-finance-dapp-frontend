import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { State } from 'reducers'

// TODO: add docs for this hook
export const useDataLoader = (callback: () => Promise<void>, deps: React.DependencyList) => {
  const isComponentMounted = useRef(true)
  const { isInitialDataLoading } = useSelector((state: State) => state.loading)
  const [isLoading, setLoading] = useState(true)
  // TODO:  test with layoutEffect
  useEffect(() => {
    if (isInitialDataLoading === false) {
      setLoading(true)
      callback().finally(() => {
        // if (isComponentMounted.current) {
        setLoading(false)
        // }
      })
    }

    return () => {
      isComponentMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, isInitialDataLoading])

  return { isLoading }
}
