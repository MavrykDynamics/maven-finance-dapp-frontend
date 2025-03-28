// @ts-nocheck
import { ANY_USER, NONE_USER, WHITELIST_USERS } from 'pages/Loans/Loans.const'
import { BLOCKS_PER_MINUTE, SMVN_TOKEN_ADDRESS } from 'utils/constants'

import {
  CollateralType,
  DepositorsFlagType,
  VaultsCtxState,
  VaultsIndexerDataType,
  VaultType,
} from 'providers/VaultsProvider/vaults.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import { calculateVaultMaxLiquidationAmount } from 'providers/VaultsProvider/helpers/vaults.utils'
import { calcMarketAvailableLiquidity } from 'providers/LoansProvider/helpers/loans.utils'

const getVaultsDepositorsData = (
  vault
) => {
  // Convert deep structure of depositors to array of depositrors addresses (strings)
  const depositors = (vault.depositors.map(({ depositor }) => depositor?.address).filter(Boolean) ??
    []) as Array<string>

  // Calc what permission type vaults it is visible to any, whitelist, owner only
  const deporsitorsFlag: DepositorsFlagType =
    vault.allowance === 0 ? ANY_USER : vault.allowance === 1 && depositors.length !== 0 ? WHITELIST_USERS : NONE_USER

  return {
    depositors,
    deporsitorsFlag,
  }
}

const normalizeCollaterals = (
  collateral_json
) => {
  return Object.entries(collateral_json).map(([tokenAddress, collateral])=> {
    if (collateral.token_name === 'smvn') {
      return ({
        tokenAddress: SMVN_TOKEN_ADDRESS,
        amount: collateral.balance,
      })
    } else {
      return ({
        tokenAddress,
        amount: collateral.balance,
      })
    }
  })
}
// andrew_here (replace fields to match the new query)
// the returned object should be the same as it was to reduce code logic changes in other places
export const normalizeVaults = ({
  indexerData,
  userAddress,
}: {
  indexerData: VaultsIndexerDataType
  userAddress: string | null
}) => {
  const {
    lending_controller: {
      max_vault_liquidation_pct,
      decimals,
      liquidation_fee_pct,
      liquidation_ratio,
      interest_rate_decimals,
      admin_liquidation_fee_pct,
      liquidation_delay_in_minutes
    },
    vaults
  } = indexerData

  return vaults.reduce<Omit<VaultsCtxState, 'vaultsDashboardData'>>(
    (acc, item) => {
      const {
        collateral_json,
        loan_outstanding_total: vaultTotalOutstanding,
        loan_principal_total: borrowedAmount,
        loan_interest_total: vaultAccuredInterest,
        borrow_index: vaultBorrowIndex,
        min_repayment_amount,
        loan_token_address: borrowedTokenAddress,
        owner_address: ownerAddress,

        total_remaining,
        token_pool_total,
        reserve_ratio,
        vault_name,
        vault_address,
        creation_timestamp,
        baker_address,
        allowance,
        depositors_json
      } = item

      const tokenBorrowIndex = vaultBorrowIndex //TODO add tokenBorrowIndex from api
      // const {
      //   borrow_index: tokenBorrowIndex, //?????
      // } = loan_token

      const apr =
        convertNumberForClient({
          number: item.loan_token?.current_interest_rate ?? 0,
          grade: interest_rate_decimals,
        }) * 100

      // Calc how much free tokens pool has for certain market
      const { availableLiquidity } = calcMarketAvailableLiquidity({total_remaining, token_pool_total, reserve_ratio})

      const { depositors, deporsitorsFlag } = getVaultsDepositorsData({allowance, depositors: Object.values(depositors_json)}) //TODO depositors format
      const collateralData = normalizeCollaterals(collateral_json)

      // calculating actual accured interest, cuz loan_interest_total is updated when some operation on vault is done, so for afk vaults it's not actual
      const accruedInterest =
        vaultBorrowIndex > 0 && vaultTotalOutstanding > 0
          ? Math.max(0, Math.floor((vaultTotalOutstanding * tokenBorrowIndex) / vaultBorrowIndex) - borrowedAmount)
          : 0

      // calculating actual total outstanding that will use actual accrued interest
      const totalOutstanding = borrowedAmount + accruedInterest

      const normallizedVault: VaultType = {
        borrowedTokenAddress,
        name: vault_name,
        address: vault_address,
        ownerAddress,
        vaultId: item.internal_id,
        apr,
        creationTimestamp: new Date(creation_timestamp).getTime(),

        borrowedAmount,
        totalOutstanding,
        collateralData,
        availableLiquidity,
        minimumRepay: min_repayment_amount,
        accruedInterest,

        // Liquidation
        liquidationMax: calculateVaultMaxLiquidationAmount(totalOutstanding, max_vault_liquidation_pct),
        liquidationRewardCoefficient: convertNumberForClient({
          number: liquidation_fee_pct,
          grade: decimals,
        }),
        adminLiquidateFeeCoefficient: convertNumberForClient({
          number: admin_liquidation_fee_pct,
          grade: decimals,
        }),
        liquidationRatio: liquidation_ratio,
        gracePeriodEndLevel:
          item.marked_for_liquidation_level === 0
            ? null
            : item.marked_for_liquidation_level + Number(liquidation_delay_in_minutes) * BLOCKS_PER_MINUTE,
        liquidationEndLevel: item.liquidation_end_level === 0 ? null : item.liquidation_end_level,

        // Permissions
        // TODO: implement smvn operators
        sMVNDelegatedTo: '',
        xtzDelegatedTo: baker_address ?? null,
        depositors,
        depositorsFlag: deporsitorsFlag,
      }

      acc.vaultsMapper[vault_address] = normallizedVault

      // If user is owner add vault id to my vaults list
      if (userAddress) {
        if (userAddress === normallizedVault.ownerAddress) {
          acc.myVaultsIds.push(vault_address)
        } else if (depositors.includes(userAddress) || deporsitorsFlag === ANY_USER) {
          acc.permissionedVaultsIds.push(vault_address)
        }
      }

      acc.allVaultsIds.push(vault_address)

      return acc
    },
    {
      permissionedVaultsIds: [],
      myVaultsIds: [],
      allVaultsIds: [],
      vaultsMapper: {},
    },
  )
}
