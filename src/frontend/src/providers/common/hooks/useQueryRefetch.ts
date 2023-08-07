import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useEffect } from 'react'
import { usePrevious } from 'react-use'

type BlocksDiffOptions = {
  blocksDiff: number
  lastIndexerBlock: number
  updateLastUpdatedLvl: (updateLvl: number) => void
}

type HookProps = {
  refetchers: Array<{
    refetch: () => void
    options?: {} & Partial<BlocksDiffOptions>
  }>
}

export const useQueryRefetch = ({ refetchers }: HookProps) => {
  const { currentIndexedLevel } = useDappConfigContext()

  const lastIndexerLevel = usePrevious(currentIndexedLevel)

  useEffect(() => {
    refetchers.reduce<null>((acc, { refetch, options }) => {
      const { blocksDiff, lastIndexerBlock, updateLastUpdatedLvl } = options ?? {}

      // blocks diff case, call refetch only when block difference is more equal than specified in blocksDiff
      if (typeof blocksDiff === 'number' && typeof lastIndexerBlock === 'number' && updateLastUpdatedLvl) {
        if (currentIndexedLevel - lastIndexerBlock >= blocksDiff) {
          refetch()
          updateLastUpdatedLvl(currentIndexedLevel)
        }

        return acc
      }

      // if current indexed block more than last indexed, refetch query
      if (currentIndexedLevel >= Number(lastIndexerLevel)) refetch()

      return acc
    }, null)
  }, [currentIndexedLevel])
}
