import React, { useContext, useMemo, useState } from 'react'
// consts
import { defaultLoadingState } from './helpers/loading.const'
// types
import { LoadingContext, LoadingState } from './loading.provider.types'

export const loadingContext = React.createContext<LoadingContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const LoadingProvider = ({ children }: Props) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(defaultLoadingState)

  const toggleActionFullScreenLoader = (v: boolean) => {
    setLoadingState((prev) => ({ ...prev, isActiveFullScreenLoader: v }))
  }

  const toggleActionCompletion = (v: boolean) => {
    setLoadingState((prev) => ({ ...prev, isActionActive: v }))
  }

  const toggleWertLoader = (v: boolean) => {
    setLoadingState((prev) => ({ ...prev, isWertLoading: v }))
  }

  const contextProviderValue: LoadingContext = useMemo(() => {
    return {
      ...loadingState,
      toggleActionFullScreenLoader,
      toggleActionCompletion,
      toggleWertLoader,
    }
  }, [loadingState])

  return <loadingContext.Provider value={contextProviderValue}>{children}</loadingContext.Provider>
}

export const useLoadingContext = () => {
  const context = useContext(loadingContext)

  if (!context) {
    throw new Error('useLoadingContext should be used withing LoadingProvider')
  }

  return context
}

export default LoadingProvider
