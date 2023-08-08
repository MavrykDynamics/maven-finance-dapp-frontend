import { isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'
import { useCallback, useMemo, useState } from 'react'
import { SelectedCollateralTokenData } from '../../CreateNewVault.modal/helpers/createNewVault.types'

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

  console.log(selectedCollateralsAddresses, 'selectedCollateralsAddresses')
  console.log(Boolean(tezCollateralAddress), 'isTezosToken')

  return { maxedXTZData, updateMaxedXTZData, willExceedXTZTheLimit, isTezosToken: Boolean(tezCollateralAddress) }
}
