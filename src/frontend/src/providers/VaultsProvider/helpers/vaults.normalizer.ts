import { ANY_USER, WHITELIST_USERS, NONE_USER } from 'pages/Loans/Loans.const'
import { BLOCKS_PER_MINUTE } from 'utils/constants'

import { CollateralType, DepositorsFlagType, VaultType } from 'providers/VaultsProvider/vaults.provider.types'
import { calculateAccruedInterest } from 'pages/Loans/Loans.helpers'
import { convertNumberForClient } from 'utils/calcFunctions'
import { calculateVaultMaxLiquidationAmount } from 'providers/VaultsProvider/helpers/vaults.utils'
import { GetVaultsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { calcMarketAvaliableLiquidity } from 'providers/LoansProvider/helpers/loans.utils'

type ReducedVaultsType = {
  permissinedVaultsIds: string[]
  myVaultsIds: string[]
  allVaultsIds: string[]
  vaultsMapper: Record<string, VaultType>
}

const getVaultsDepositorsData = (
  vault: Exclude<
    GetVaultsSubscriptionSubscription['lending_controller'][number]['vaults'][number]['vault'],
    null | undefined
  >,
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
  collateral_balances: GetVaultsSubscriptionSubscription['lending_controller'][number]['vaults'][number]['collateral_balances'],
) => {
  return collateral_balances.reduce<Array<CollateralType>>((acc, collateral) => {
    if (!collateral.collateral_token.token?.token_address) return acc

    acc.push({
      tokenAddress: collateral.collateral_token.token.token_address,
      amount: collateral.balance,
    })

    return acc
  }, [])
}

export const normalizeVaults = ({ indexerData }: { indexerData: GetVaultsSubscriptionSubscription }) => {
  const {
    lending_controller: [controller],
  } = indexerData

  const {
    vaults,
    max_vault_liquidation_pct,
    decimals,
    liquidation_fee_pct,
    liquidation_ratio,
    interest_rate_decimals,
    admin_liquidation_fee_pct,
    liquidation_delay_in_minutes,
  } = controller

  return vaults.reduce<ReducedVaultsType>(
    (acc, item) => {
      const {
        vault,
        collateral_balances,
        loan_outstanding_total,
        loan_principal_total: borrowedAmount,
        borrow_index: vaultBorrowIndex,
        loan_token,
        owner: { address: ownerAddress },
      } = item

      const {
        borrow_index: marketBorrowIndex,
        min_repayment_amount,
        token: { token_address: borrowedTokenAddress },
      } = loan_token

      // Check whether vault exists
      if (!vault) return acc

      const fee = Math.abs(
        calculateAccruedInterest(loan_outstanding_total, vaultBorrowIndex, marketBorrowIndex) - borrowedAmount,
      )

      const apr =
        convertNumberForClient({
          number: item.loan_token?.current_interest_rate ?? 0,
          grade: interest_rate_decimals,
        }) * 100

      // Calc how much free tokens pool has for certain market
      const { availableLiquidity } = calcMarketAvaliableLiquidity(loan_token)

      const { depositors, deporsitorsFlag } = getVaultsDepositorsData(vault)
      const collateralData = normalizeCollaterals(collateral_balances)

      const normallizedVault: VaultType = {
        borrowedTokenAddress,
        name: vault.name,
        address: vault.address,
        ownerAddress,
        vaultId: item.internal_id,
        apr,
        creationTimestamp: new Date(vault.creation_timestamp).getTime(),

        borrowedAmount,
        availableLiquidity,
        minimumRepay: min_repayment_amount,
        fee,
        collateralData,

        // Liquidation
        liquidationMax: calculateVaultMaxLiquidationAmount(item.loan_outstanding_total, max_vault_liquidation_pct),
        liquidationReward: convertNumberForClient({
          number: liquidation_fee_pct,
          grade: decimals,
        }),
        adminLiquidateFee: admin_liquidation_fee_pct,
        liquidationRatio: liquidation_ratio,
        liquidationLvl:
          item.marked_for_liquidation_level === 0
            ? null
            : item.marked_for_liquidation_level + Number(liquidation_delay_in_minutes) * BLOCKS_PER_MINUTE,

        // Permissions
        // TODO: implement smvk operators
        sMVKDelegatedTo: '',
        xtzDelegatedTo: vault?.baker?.address ?? null,
        depositors,
        deporsitorsFlag,
      }

      // Add vault object to mapper id => vault
      acc.vaultsMapper[vault.address] = normallizedVault
      // Add vault id to all valts list
      // acc.allVaultsIds.push(vault.address)

      // If user is owner add vault id to my vaults list
      // if (accountPkh === item.owner.address) {
      //   acc.myVaultsIds.push(vault.address)
      // }

      // If user is depositor of the vault, or vault is visible to anyone, add it to permissioned vaults list
      // if (
      //   ((accountPkh && depositors.includes(accountPkh)) || deporsitorsFlag === ANY_USER) &&
      //   accountPkh !== item.owner.address
      // ) {
      //   acc.permissinedVaultsIds.push(vault.address)
      // }

      return acc
    },
    {
      permissinedVaultsIds: [],
      myVaultsIds: [],
      allVaultsIds: [],
      vaultsMapper: {},
    },
  )
}
