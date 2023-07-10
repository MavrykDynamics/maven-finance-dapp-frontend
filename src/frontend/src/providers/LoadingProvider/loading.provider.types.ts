export type LoadingState = {
  isActiveFullScreenLoader: boolean
  isActionActive: boolean
  isWertLoading: boolean
}

export type LoadingContext = {
  toggleActionCompletion: (v: boolean) => void
  toggleWertLoader: (v: boolean) => void
  toggleActionFullScreenLoader: (v: boolean) => void
} & LoadingState
