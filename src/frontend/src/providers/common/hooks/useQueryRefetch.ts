import { OperationVariables } from '@apollo/client'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useEffect } from 'react'
import { usePrevious } from 'react-use'

type BlocksDiffOptions = {
  blocksDiff: number
  lastUpdatedBlock: number
  updateLastUpdatedLvl: (updateLvl: number) => void
}

type HookProps = {
  refetchers: Array<{
    refetch: (variables?: OperationVariables) => void
    options?: { refetchQueryVariables?: OperationVariables } & Partial<BlocksDiffOptions>
  }>
}

/**
 *
 * @param refetchers - array of function to refetch + options for every refetcher
 *
 * refetcher options:
 * 		1. refetchQueryVariables - new variables for a query
 * 		2. BlocksDiffOptions – object to refetch only on certain block difference, to make delay bigger
 */
export const useQueryRefetch = ({ refetchers }: HookProps) => {
  const { currentIndexedLevel } = useDappConfigContext()

  const lastIndexerLevel = usePrevious(currentIndexedLevel)

  useEffect(() => {
    refetchers.reduce<null>((acc, { refetch, options }) => {
      const { blocksDiff, lastUpdatedBlock, updateLastUpdatedLvl, refetchQueryVariables } = options ?? {}

      // blocks diff case, call refetch only when block difference is more equal than specified in blocksDiff
      if (typeof blocksDiff === 'number' && typeof lastUpdatedBlock === 'number' && updateLastUpdatedLvl) {
        if (currentIndexedLevel - lastUpdatedBlock >= blocksDiff) {
          refetch(refetchQueryVariables)
          updateLastUpdatedLvl(currentIndexedLevel)
        }

        return acc
      }

      // if current indexed block more than last indexed, refetch query
      if (currentIndexedLevel >= Number(lastIndexerLevel)) refetch(refetchQueryVariables)

      return acc
    }, null)
  }, [currentIndexedLevel])
}
