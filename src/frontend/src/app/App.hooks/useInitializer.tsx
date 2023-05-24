// hooks
import { useDappInit } from 'providers/DAPPConfig/hooks/useDappInit'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'
import { useTokensInit } from 'providers/TokensProvider/hooks/useTokensInit'

export const useInitializer = () => {
  useDappInit()
  // TODO: implement tokens context
  // useTokensInit()
  useDataFeedsUpdater(true)
}
