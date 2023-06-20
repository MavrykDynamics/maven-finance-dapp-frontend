import { ANY_USER, WHITELIST_USERS, NONE_USER } from 'pages/Loans/Loans.const'
import { BLOCKS_PER_MINUTE, FIXED_POINT_ACCURACY } from 'utils/constants'

import { LendingControllerGQL } from 'utils/TypesAndInterfaces/Loans'

import { CollateralType, DepositorsFlagType, VaultType } from 'providers/LoansProvider/helpers/vaults.types'
import { calculateAccruedInterest } from 'pages/Loans/Loans.helpers'
import { convertNumberForClient } from 'utils/calcFunctions'
import { calculateVaultMaxLiquidationAmount } from './calcFunctionsForVault'

/**
 * @param storage vaults data from indexer
 * @returns nomalizer vaults data, all values are in indexer format
 */
export const normalizeVaultsStorage = async (storage: {
  lendingController: LendingControllerGQL
  accountPkh?: string
}) => {
  try {
    const { lendingController, accountPkh } = storage
    if (!lendingController.vaults.length)
      return {
        permissinedVaultsIds: [],
        myVaultsIds: [],
        allVaultsIds: [],
        vaultsMapper: {},
      }

    const interestRateDecimals = lendingController?.interest_rate_decimals || 0

    return lendingController.vaults.reduce<{
      permissinedVaultsIds: string[]
      myVaultsIds: string[]
      allVaultsIds: string[]
      vaultsMapper: Record<string, VaultType>
    }>(
      (acc, item) => {
        const vault = item.vault
        // Check whether we market & vault exists
        if (!item.loan_token || !vault || !item.loan_token.token.token_address) return acc

        // Borrowed amount of the vault
        const borrowedAmount = item.loan_principal_total

        // Calculating Fee of the vault
        const currentLoanInterest = item.loan_interest_total
        const fee =
          borrowedAmount === 0
            ? currentLoanInterest
            : currentLoanInterest +
              calculateAccruedInterest(item.loan_outstanding_total, item.borrow_index, item.loan_token.borrow_index) /
                FIXED_POINT_ACCURACY

        // Convert deep structure of depositors to array of depositrors addresses (strings)
        const depositors = (vault.depositors.map(({ depositor }) => depositor?.address).filter(Boolean) ??
          []) as Array<string>

        // Calc what permission type vaults it is visible to any, whitelist, owner only
        const deporsitorsFlag: DepositorsFlagType =
          vault.allowance === 0
            ? ANY_USER
            : vault.allowance === 1 && depositors.length !== 0
            ? WHITELIST_USERS
            : NONE_USER

        const normallizedVault: VaultType = {
          // Vault stats&meta data
          borrowedTokenAddress: item.loan_token.token.token_address,
          name: vault.name,
          address: vault?.address,
          ownerId: item.owner?.address || '',
          vaultId: item.internal_id,
          xtzDelegatedTo: vault?.baker?.address ?? null,
          apr:
            convertNumberForClient({
              number: item.loan_token?.current_interest_rate ?? 0,
              grade: interestRateDecimals,
            }) * 100,
          creationTimestamp: new Date(vault.creation_timestamp).getTime(),

          borrowedAmount,
          // Calc how much free tokens pool has for certain market
          availableLiquidity:
            item.loan_token.total_remaining -
            (item.loan_token.token_pool_total * item.loan_token.reserve_ratio) / 10000,
          minimumRepay: item.loan_token.min_repayment_amount,
          fee,

          // Vault collaterals data
          collateralData: item.collateral_balances.reduce<Array<CollateralType>>((acc, collateral) => {
            if (!collateral.collateral_token.token?.token_address) return acc

            acc.push({
              tokenAddress: collateral.collateral_token.token.token_address,
              amount: collateral.balance,
            })

            return acc
          }, []),

          // Liquidation
          liquidationMax: calculateVaultMaxLiquidationAmount(
            item.loan_outstanding_total,
            lendingController.max_vault_liquidation_pct,
          ),
          liquidationReward: convertNumberForClient({
            number: lendingController.liquidation_fee_pct,
            grade: lendingController.decimals,
          }),
          adminLiquidateFee: lendingController.admin_liquidation_fee_pct,
          liquidationRatio: lendingController.liquidation_ratio,
          liquidationLvl:
            item.marked_for_liquidation_level === 0
              ? null
              : item.marked_for_liquidation_level +
                Number(item.lending_controller?.liquidation_delay_in_minutes) * BLOCKS_PER_MINUTE,

          // Permissions
          sMVKDelegatedTo: '',
          depositors,
          deporsitorsFlag,
        }

        // Add vault object to mapper id => vault
        acc.vaultsMapper[vault.address] = normallizedVault
        // Add vault id to all valts list
        acc.allVaultsIds.push(vault.address)

        // If user is owner add vault id to my vaults list
        if (accountPkh === item.owner.address) {
          acc.myVaultsIds.push(vault.address)
        }

        // If user is depositor of the vault, or vault is visible to anyone, add it to permissioned vaults list
        if (
          ((accountPkh && depositors.includes(accountPkh)) || deporsitorsFlag === ANY_USER) &&
          accountPkh !== item.owner.address
        ) {
          acc.permissinedVaultsIds.push(vault.address)
        }

        return acc
      },
      {
        permissinedVaultsIds: [],
        myVaultsIds: [],
        allVaultsIds: [],
        vaultsMapper: {},
      },
    )
  } catch (e) {
    console.error('normalizeVaultsStorage error: ', e)
    return {
      permissinedVaultsIds: [],
      myVaultsIds: [],
      allVaultsIds: [],
      vaultsMapper: {},
    }
  }
}
