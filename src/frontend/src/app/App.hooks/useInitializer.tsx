// hooks
import { useDappInit } from 'providers/DAPPConfig/hooks/useDappInit'
import { useDataFeedsInit } from 'providers/DataFeedsProvider/hooks/useDataFeedsInit'
import { useTokensInit } from 'providers/TokensProvider/hooks/useTokensInit'

export const useInitializer = () => {
  useDappInit() // shouls be the first one
  useTokensInit()
  useDataFeedsInit()
}
