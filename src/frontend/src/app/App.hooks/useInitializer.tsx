// hooks
import { useDappInit } from 'providers/DAPPConfig/hooks/useDappInit'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'
import { useTokensUpdater } from 'providers/TokensProvider/hooks/useTokensUpdater'

export const useInitializer = () => {
  useDappInit()
  useDataFeedsUpdater()
  useTokensUpdater()
}
