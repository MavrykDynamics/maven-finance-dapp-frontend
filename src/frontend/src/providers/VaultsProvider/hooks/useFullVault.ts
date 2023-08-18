import { useEffect, useState } from 'react'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

import { FullLoansVaultType, VaultType } from '../vaults.provider.types'

import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  getVaultBorrowCapacity,
  getVaultCollateralBalance,
  getVaultCollateralRatio,
  getVaultLiquidationPrice,
  getVaultStatus,
} from '../helpers/vaults.utils'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { isAbortError } from 'errors/error'
import { api } from 'utils/api/api'

export const useFullVault = (vault: VaultType): FullLoansVaultType | null => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { bug } = useToasterContext()

  const {
    borrowedTokenAddress,
    collateralData,
    borrowedAmount,
    fee,
    availableLiquidity,
    liquidationLvl,
    address,
    liquidationMax,
    minimumRepay,
    ...restVault
  } = vault

  const [liquidationTimestamp, setLiquidationTimestamp] = useState<null | number>(null)

  useEffect(() => {
    if (liquidationLvl) {
      const abortLiquidationController = new AbortController()

      ;(async () => {
        try {
          const { data: liquidationTimestamp } = await api(
            getTimestampByLevelUrl(liquidationLvl),
            { signal: abortLiquidationController.signal, headers: getTimestampByLevelHeaders },
            getTimestampByLevelSchema,
          )

          setLiquidationTimestamp(new Date(liquidationTimestamp).getTime())
        } catch (e) {
          if (!isAbortError(e)) console.error('getting timestamp by lvl error: ', e)

          bug('Unexpected error happened occured, please reload the page')
        }
      })()

      return () => {
        abortLiquidationController.abort()
      }
    }

    return () => {}
  }, [liquidationLvl, address])

  const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })

  if (!borrowedToken || !borrowedToken.rate || !checkWhetherTokenIsLoanToken(borrowedToken)) return null

  const { rate: borrowedTokenRate, decimals: borrowedTokenDecimals } = borrowedToken

  const convertedBorrowedAmount = convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals })
  const convertedFee = convertNumberForClient({ number: fee, grade: borrowedTokenDecimals })
  const convertedAvailableLiquidity = convertNumberForClient({
    number: availableLiquidity,
    grade: borrowedTokenDecimals,
  })
  const totalOutstanding = convertedBorrowedAmount + convertedFee
  const collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)
  const borrowCapacity = getVaultBorrowCapacity(
    convertedAvailableLiquidity * borrowedTokenRate,
    totalOutstanding * borrowedTokenRate,
    collateralBalance,
  )

  // TODO: debug log
  // console.log({
  //   vaultAddress: address,
  //   borrowedTokenRate,
  //   convertedBorrowedAmount,
  //   convertedBorrowedAmountUSD: convertedBorrowedAmount * borrowedTokenRate,
  //   convertedFee,
  //   convertedFeeUSD: convertedFee * borrowedTokenRate,
  //   totalOutstanding,
  //   totalOutstandingUSD: totalOutstanding * borrowedTokenRate,
  //   borrowCapacity: borrowCapacity / borrowedTokenRate,
  //   borrowCapacityUSD: borrowCapacity,
  //   collateralBalance,
  // })

  const collateralRatio = getVaultCollateralRatio(collateralBalance, totalOutstanding * borrowedTokenRate)
  const convertedMinRepay = convertNumberForClient({ number: minimumRepay, grade: borrowedTokenDecimals })
  const status = getVaultStatus({
    collateralRatio,
    borrowedAmount: convertedBorrowedAmount,
    liquidationTimestamp,
  })

  return {
    address,
    status,
    collateralRatio,
    collateralBalance,
    collateralData,
    borrowedAmount: convertedBorrowedAmount,
    availableLiquidity: convertedAvailableLiquidity,
    fee: convertedFee,
    totalOutstanding,
    borrowedTokenAddress,
    borrowedToken: { ...borrowedToken, rate: borrowedTokenRate },
    borrowCapacity,
    liquidationLvl,
    liquidationTimestamp,
    liquidationPrice: getVaultLiquidationPrice(totalOutstanding * borrowedTokenRate, restVault.liquidationRatio),
    liquidationMax: convertNumberForClient({ number: liquidationMax, grade: borrowedTokenDecimals }),
    minimumRepay: convertedMinRepay,
    ...restVault,
  }
}
