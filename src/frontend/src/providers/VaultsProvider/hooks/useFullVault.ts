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
    const abortLiquidationController = new AbortController()
    let timerId: null | NodeJS.Timeout = null

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

        const gracePeriodIsoTime =
          gracePeriodResult.status === 'fulfilled' && gracePeriodResult.value
            ? dayjs(gracePeriodResult.value.data).valueOf()
            : null
        const liquidationIsoTime =
          liquidationResult.status === 'fulfilled' && liquidationResult.value
            ? dayjs(liquidationResult.value.data).valueOf()
            : null

        setGracePeriodTimestamp(gracePeriodIsoTime)
        setLiquidationTimestamp(liquidationIsoTime)

        // calculating status of the vault, cuz we've got timers loaded
        setVaultStatus(
          getVaultStatus({
            collateralRatio,
            totalOustanding: totalOutstandingUsd,
            gracePeriodTimestamp: gracePeriodIsoTime,
            liquidationTimestamp: liquidationIsoTime,
          }),
        )

        // if grace period timer present get diff from current time, otherwise -1
        const vaultGracePeriodTimerRestTime = gracePeriodIsoTime
          ? dayjs(gracePeriodIsoTime).valueOf() - dayjs().valueOf()
          : -1

        // if liquidation timer present get diff from current time, otherwise -1
        const vaultLiquidationTimerRestTime = liquidationIsoTime
          ? dayjs(liquidationIsoTime).valueOf() - dayjs().valueOf()
          : -1

        // setTimeout timer is grace period timer, if not present try liquidation timer, otherwise timer is not needed
        const timerMsDelay = Math.min(vaultGracePeriodTimerRestTime, vaultLiquidationTimerRestTime)

        // if we have delay for the timer schedule setTimeout, otherwise timer is null
        if (timerMsDelay > 0) {
          timerId = setTimeout(() => {
            console.log('status recalc in timer')

            setVaultStatus(
              getVaultStatus({
                collateralRatio,
                totalOustanding: totalOutstandingUsd,
                liquidationTimestamp: liquidationIsoTime,
                gracePeriodTimestamp: gracePeriodIsoTime,
              }),
            )
          }, timerMsDelay)
        }

        console.log({
          vaultLiquidationTimerRestTime,
          vaultGracePeriodTimerRestTime,
          timerMsDelay,
          timerId,
          vaultName: vault.name,
        })
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

      console.log('clearing timer end level changed', { timerId })
      if (timerId) clearTimeout(timerId)
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
