// hooks
import { useDappInit } from 'providers/DAPPConfig/hooks/useDappInit'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'
import { useTokensUpdater } from 'providers/TokensProvider/hooks/useTokensUpdater'

export const useInitializer = () => {
  const { isLoading: isDappGeneralLoading } = useDappInit()
  const { isLoading: isFeedsLoading } = useDataFeedsUpdater()
  const { isLoading: isTokensLoading } = useTokensUpdater()

  return { isLoading: isDappGeneralLoading || isFeedsLoading || isTokensLoading }
}
