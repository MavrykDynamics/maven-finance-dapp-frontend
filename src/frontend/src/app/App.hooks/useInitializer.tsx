// hooks
import { useDappInit } from 'providers/DAPPConfig/hooks/useDappInit'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'

export const useInitializer = () => {
  useDappInit()
  // TODO: implement tokens context
  // useTokensInit()
  useDataFeedsUpdater()
}
