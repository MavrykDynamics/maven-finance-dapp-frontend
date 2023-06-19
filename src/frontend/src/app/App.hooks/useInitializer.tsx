// hooks
import { useDappInit } from 'providers/DAPPConfig/hooks/useDappInit'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'
import { useTokensUpdater } from 'providers/TokensProvider/hooks/useTokensUpdater'
import { useUserUpdater } from 'providers/UserProvider/hooks/useUserUpdater'

export const useInitializer = () => {
  const { isLoading: isDappGeneralLoading } = useDappInit()
  const { isLoading: isFeedsLoading } = useDataFeedsUpdater()
  const { isLoading: isTokensLoading } = useTokensUpdater()
  const { isLoading: isUserLoading } = useUserUpdater()

  return { isLoading: isDappGeneralLoading || isFeedsLoading || isTokensLoading || isUserLoading }
}
