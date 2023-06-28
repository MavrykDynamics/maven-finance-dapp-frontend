// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserBalancesUpdater } from 'providers/UserProvider/hooks/useUserBalancesUpdater'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

export const useInitializer = () => {
  const { isLoading: isDappGeneralLoading } = useDappConfigContext()
  const { isLoading: isTokensLoading } = useTokensContext()

  const { accountPkh = null } = useSelector((state: State) => state.wallet)

  const { isLoading: isFeedsLoading } = useDataFeedsUpdater()
  const { isLoading: isUserTokensLoading } = useUserBalancesUpdater(accountPkh, isTokensLoading)

  return { isLoading: isDappGeneralLoading || isFeedsLoading || isTokensLoading || isUserTokensLoading }
}
