import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

import { FullLoansVaultType, VaultType } from '../vaults.provider.types'

import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  getVaultBorrowCapacity,
  getVaultCollateralBalance,
  getVaultCollateralRatio,
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
    accruedInterest,
    totalOutstanding,
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
  const [vaultStatus, setVaultStatus] = useState<FullLoansVaultType['status']>(null)

  /**
   * effect to convert vault block levels to iso time, so we can show it to user
   */
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
  }, [gracePeriodEndLevel, liquidationEndLevel])

  // getting vault token
  const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })
  const borrowedTokenRate = borrowedToken?.rate ?? 0
  const borrowedTokenDecimals = borrowedToken?.decimals ?? 0

  // converting vault values from indexer to client format
  const convertedBorrowedAmount = convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals })
  const convertedAccuredInterest = convertNumberForClient({
    number: accruedInterest,
    grade: borrowedTokenDecimals,
  })
  const convertedTotalOutstanding = convertNumberForClient({
    number: totalOutstanding,
    grade: borrowedTokenDecimals,
  })
  const convertedAvailableLiquidity = convertNumberForClient({
    number: availableLiquidity,
    grade: borrowedTokenDecimals,
  })
  const convertedMinRepay = convertNumberForClient({ number: minimumRepay, grade: borrowedTokenDecimals })
  const convertedLiquidationMax = convertNumberForClient({ number: liquidationMax, grade: borrowedTokenDecimals })

  // converting some values to usd amount for calcs
  const availableLiquidityUsd = convertedAvailableLiquidity * borrowedTokenRate
  const totalOutstandingUsd = convertedTotalOutstanding * borrowedTokenRate

  // some vault calcs
  const collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)
  const borrowCapacity = getVaultBorrowCapacity(availableLiquidityUsd, totalOutstandingUsd, collateralBalance)
  const collateralRatio = getVaultCollateralRatio(collateralBalance, totalOutstandingUsd)

  /**
   * vault status calcs and recalculation effect
   *
   * run status recalc on:
   *  - collateral ratio change
   *  - vault's total oustanding
   *  - timer time change
   *
   * TODO: consider using block level and original values in blocks to recalc status,
   *       but block is updated, when some operation on platform happened
   */
  useEffect(() => {
    const newVaultStatus = getVaultStatus({
      collateralRatio,
      totalOustanding: totalOutstandingUsd,
      liquidationTimestamp: liquidationTimestamp,
      gracePeriodTimestamp: gracePeriodTimestamp,
    })

    setVaultStatus(newVaultStatus)

    // if liquidation timer present get diff from current time, otherwise -1
    const vaultLiquidationTimerRestTime = liquidationTimestamp
      ? dayjs().valueOf() - dayjs(liquidationTimestamp).valueOf()
      : -1

    // if grace period timer present get diff from current time, otherwise -1
    const vaultGracePeriodTimerRestTime = gracePeriodTimestamp
      ? dayjs().valueOf() - dayjs(gracePeriodTimestamp).valueOf()
      : -1

    // setTimeout timer is grace period timer, if not present try liquidation timer, otherwise timer is not needed
    const timerMsDelay =
      vaultGracePeriodTimerRestTime > 0
        ? vaultGracePeriodTimerRestTime
        : vaultLiquidationTimerRestTime > 0
        ? vaultLiquidationTimerRestTime
        : null

    // if we have delay for the timer schedule setTimeout, otherwise timer is null
    const timer = timerMsDelay
      ? setTimeout(() => {
          const newVaultStatus = getVaultStatus({
            collateralRatio,
            totalOustanding: totalOutstandingUsd,
            liquidationTimestamp: liquidationTimestamp,
            gracePeriodTimestamp: gracePeriodTimestamp,
          })

          setVaultStatus(newVaultStatus)
        }, timerMsDelay)
      : null

    // clean up timer on deps change
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [collateralRatio, totalOutstandingUsd, liquidationTimestamp, gracePeriodTimestamp])

  // if vault token is invalid, vault considered as invalid as well
  if (!borrowedToken || !borrowedToken.rate || !checkWhetherTokenIsLoanToken(borrowedToken)) {
    return {
      vault: null,
      isStatusLoading,
    }
  }

  return {
    vault: {
      address,
      status: vaultStatus,
      collateralRatio,
      collateralBalance,
      collateralData,
      borrowedAmount: convertedBorrowedAmount,
      accruedInterest: convertedAccuredInterest,
      totalOutstanding: convertedTotalOutstanding,
      availableLiquidity: convertedAvailableLiquidity,
      borrowedTokenAddress,
      borrowedToken: { ...borrowedToken, rate: borrowedTokenRate },
      borrowCapacity,
      liquidationTimestamp,
      liquidationEndLevel,
      gracePeriodTimestamp,
      gracePeriodEndLevel,
      liquidationMax: convertedLiquidationMax,
      minimumRepay: Math.min(convertedBorrowedAmount, convertedMinRepay),
      ...restVault,
    },
    isStatusLoading,
  }
}
