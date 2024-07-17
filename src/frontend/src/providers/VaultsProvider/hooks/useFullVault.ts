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
    vaultAccuredInterest,
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

  const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })

  const borrowedTokenRate = borrowedToken?.rate ?? 0
  const borrowedTokenDecimals = borrowedToken?.decimals ?? 0

  const convertedBorrowedAmount = convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals })
  const convertedAccuredInterest = convertNumberForClient({
    number: vaultAccuredInterest,
    grade: borrowedTokenDecimals,
  })
  const convertedAvailableLiquidity = convertNumberForClient({
    number: availableLiquidity,
    grade: borrowedTokenDecimals,
  })

  const totalOutstanding = convertedBorrowedAmount + convertedAccuredInterest
  const totalOutstandingUsd = totalOutstanding * borrowedTokenRate

  const collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)
  const borrowCapacity = getVaultBorrowCapacity(
    convertedAvailableLiquidity * borrowedTokenRate,
    totalOutstanding * borrowedTokenRate,
    collateralBalance,
  )
  const collateralRatio = getVaultCollateralRatio(collateralBalance, totalOutstanding * borrowedTokenRate)
  const convertedMinRepay = convertNumberForClient({ number: minimumRepay, grade: borrowedTokenDecimals })

  /**
   * vault status calcs and recalculation effect
   *
   * run status recalc on:
   *  - collateral ratio change
   *  - vault's total oustanding
   *  - timer time change
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

  if (!borrowedToken || !borrowedToken.rate || !checkWhetherTokenIsLoanToken(borrowedToken))
    return {
      vault: null,
      isStatusLoading,
    }

  const fullVault = {
    address,
    status: vaultStatus,
    collateralRatio,
    collateralBalance,
    collateralData,
    borrowedAmount: convertedBorrowedAmount,
    availableLiquidity: convertedAvailableLiquidity,
    vaultAccuredInterest: convertedAccuredInterest,
    totalOutstanding,
    borrowedTokenAddress,
    borrowedToken: { ...borrowedToken, rate: borrowedTokenRate },
    borrowCapacity,
    liquidationTimestamp,
    liquidationEndLevel,
    gracePeriodTimestamp,
    gracePeriodEndLevel,
    liquidationMax: convertNumberForClient({ number: liquidationMax, grade: borrowedTokenDecimals }),
    minimumRepay: Math.min(convertedBorrowedAmount, convertedMinRepay),
    ...restVault,
  }

  return {
    vault: fullVault,
    isStatusLoading,
  }
}
