import { isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'
import { useCallback, useMemo, useState } from 'react'
import { SelectedCollateralTokenData } from '../helpers/createNewVault.types'
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'

export const useXTZMaxAmountValidator = (
  selectedCollateralsAddresses: string[],
  selectedCollaterals: Record<string, Omit<SelectedCollateralTokenData, 'tokenAddress'>> | null,
) => {
  const [maxedXTZData, setMaxedXTZData] = useState({
    amount: 0,
  })

  const updateMaxedXTZData = useCallback((amount: string | number) => {
    setMaxedXTZData({ amount: Number(amount) })
  }, [])

  const tezCollateralAddress = useMemo(
    () => selectedCollateralsAddresses.find((address) => isTezosAsset(address ?? '')),
    [selectedCollateralsAddresses],
  )

  const willExceedXTZTheLimit =
    tezCollateralAddress &&
    selectedCollaterals &&
    maxedXTZData.amount !== 0 &&
    Number(selectedCollaterals[tezCollateralAddress]?.amount) > maxedXTZData.amount &&
    selectedCollaterals[tezCollateralAddress]?.validation !== INPUT_STATUS_ERROR

  return { maxedXTZData, updateMaxedXTZData, willExceedXTZTheLimit, isTezosToken: Boolean(tezCollateralAddress) }
}
