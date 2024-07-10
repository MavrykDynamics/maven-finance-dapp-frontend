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

export const useFullVault = (vault: VaultType): { vault: FullLoansVaultType | null; isStatusLoading: boolean } => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { bug } = useToasterContext()

  const {
    borrowedTokenAddress,
    collateralData,
    borrowedAmount,
    fee,
    availableLiquidity,
    address,
    liquidationMax,
    minimumRepay,
    gracePeriodEndLevel,
    liquidationEndLevel,
    ...restVault
  } = vault

  const [isStatusLoading, setIsStatusLoading] = useState(true)
  const [liquidationTimestamp, setLiquidationTimestamp] = useState<null | number>(null)
  const [gracePeriodTimestamp, setGracePeriodTimestamp] = useState<null | number>(null)

  useEffect(() => {
    if (!liquidationEndLevel && !gracePeriodEndLevel) {
      setIsStatusLoading(false)
      return
    }

    const abortLiquidationController = new AbortController()

    ;(async () => {
      try {
        setIsStatusLoading(true)

        const [gracePeriodResult, liquidationResult] = await Promise.allSettled([
          // grace period level to timestamp convert call
          gracePeriodEndLevel
            ? api(
                getTimestampByLevelUrl(gracePeriodEndLevel),
                { signal: abortLiquidationController.signal, headers: getTimestampByLevelHeaders },
                getTimestampByLevelSchema,
              )
            : null,

          // liquidation period level to timestamp convert call
          liquidationEndLevel
            ? api(
                getTimestampByLevelUrl(liquidationEndLevel),
                { signal: abortLiquidationController.signal, headers: getTimestampByLevelHeaders },
                getTimestampByLevelSchema,
              )
            : null,
        ])

        if (gracePeriodResult.status === 'fulfilled' && gracePeriodResult.value) {
          setGracePeriodTimestamp(new Date(gracePeriodResult.value.data).getTime())
        }

        if (liquidationResult.status === 'fulfilled' && liquidationResult.value) {
          setLiquidationTimestamp(new Date(liquidationResult.value.data).getTime())
        }
      } catch (e) {
        if (!isAbortError(e)) {
          console.error('converting vault timestamp by lvl error: ', e)
          bug('Unexpected error happened occured, please reload the page')
        }
      } finally {
        setIsStatusLoading(false)
      }
    })()

    return () => {
      abortLiquidationController.abort()
    }
  }, [gracePeriodEndLevel, liquidationEndLevel, address])

  console.log({ isStatusLoading, name: vault.name })

  const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })

  if (!borrowedToken || !borrowedToken.rate || !checkWhetherTokenIsLoanToken(borrowedToken))
    return {
      vault: null,
      isStatusLoading,
    }

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
  const collateralRatio = getVaultCollateralRatio(collateralBalance, totalOutstanding * borrowedTokenRate)
  const convertedMinRepay = convertNumberForClient({ number: minimumRepay, grade: borrowedTokenDecimals })
  const status = getVaultStatus({
    collateralRatio,
    totalOustanding: totalOutstanding * borrowedTokenRate,
    liquidationTimestamp: liquidationTimestamp,
    gracePeriodTimestamp: gracePeriodTimestamp,
  })

  const fullVault = {
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
    liquidationTimestamp,
    liquidationEndLevel,
    gracePeriodTimestamp,
    gracePeriodEndLevel,
    liquidationPrice: getVaultLiquidationPrice(totalOutstanding * borrowedTokenRate, restVault.liquidationRatio),
    liquidationMax: convertNumberForClient({ number: liquidationMax, grade: borrowedTokenDecimals }),
    minimumRepay: convertedMinRepay,
    ...restVault,
  }

  return {
    vault: fullVault,
    isStatusLoading,
  }
}
