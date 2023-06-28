// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserBalancesUpdater } from 'providers/UserProvider/hooks/useUserBalancesUpdater'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

export const useInitializer = () => {
  const { isLoading: isDappGeneralLoading } = useDappConfigContext()
  const { isLoading: isTokensLoading } = useTokensContext()
  const { isLoading: isFeedsLoading } = useDataFeedsContext()

  const { accountPkh = null } = useSelector((state: State) => state.wallet)

  const { isLoading: isUserTokensLoading } = useUserBalancesUpdater(accountPkh, isTokensLoading)

  return { isLoading: isDappGeneralLoading || isFeedsLoading || isTokensLoading || isUserTokensLoading }
}
