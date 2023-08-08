import { isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'
import { useCallback, useMemo, useState } from 'react'
import { SelectedCollateralTokenData } from '../../CreateNewVault.modal/helpers/createNewVault.types'

/**
 * takes collateral address and Record of them with input data
 * checks for XTZ token max value including fee and gas for the operation
 * for now its (amount - 1)
 */

export const useXTZMaxAmountValidator = (
  selectedCollateralsAddresses: string[],
  selectedCollaterals: Record<string, Omit<SelectedCollateralTokenData, 'tokenAddress'>> | null,
) => {
  const [maxedXTZData, setMaxedXTZData] = useState({
    amount: 0,
  })

  const updateMaxedXTZData = useCallback((amount: string | number) => {
    setMaxedXTZData({ amount: Number(amount) - 1 })
  }, [])

  const tezCollateralAddress = useMemo(
    () => selectedCollateralsAddresses.find((address) => isTezosAsset(address ?? '')),
    [selectedCollateralsAddresses],
  )

  const willExceedXTZTheLimit = Boolean(
    tezCollateralAddress &&
      selectedCollaterals &&
      maxedXTZData.amount !== 0 &&
      Number(selectedCollaterals[tezCollateralAddress]?.amount) >= maxedXTZData.amount + 1,
  )

  return { maxedXTZData, updateMaxedXTZData, willExceedXTZTheLimit, isTezosToken: Boolean(tezCollateralAddress) }
}
