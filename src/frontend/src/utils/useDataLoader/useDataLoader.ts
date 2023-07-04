import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { State } from 'reducers'
import { usePrevious } from 'react-use'

/**
 * @param callback fn that accepts isDepsChanged cuz hook depends on dependencies passed inside and initial data loading status,
 * so to properly update data we need to use ([!flagOfLoadedSection] || isDepsChanged) && dispatch(action())
 * @param deps array of deps to call callback on one of the deps changes
 * @returns flag of callback loading status
 */

// TODO: add arg to callback of all loading statuses of all sections,
// TODO: dynamic calc initial isLoading value
export const useDataLoader = (callback: (isDepsChanged: boolean) => Promise<void>, deps: React.DependencyList) => {
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    callback(false).finally(() => {
      setLoading(false)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps])

  return { isLoading }
}
