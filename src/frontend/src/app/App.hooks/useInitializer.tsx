// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'
import { useTokensUpdater } from 'providers/TokensProvider/hooks/useTokensUpdater'
import { useUserBalancesUpdater } from 'providers/UserProvider/hooks/useUserBalancesUpdater'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

export const useInitializer = () => {
  const { isLoading: isDappGeneralLoading } = useDappConfigContext()

  const { accountPkh = null } = useSelector((state: State) => state.wallet)

  const { isLoading: isTokensLoading } = useTokensUpdater()
  const { isLoading: isFeedsLoading } = useDataFeedsUpdater()
  const { isLoading: isUserTokensLoading } = useUserBalancesUpdater(accountPkh, isTokensLoading)

  return { isLoading: isDappGeneralLoading || isFeedsLoading || isTokensLoading || isUserTokensLoading }
}
