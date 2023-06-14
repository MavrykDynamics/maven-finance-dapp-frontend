import dayjs from 'dayjs'

import { ANY_USER, WHITELIST_USERS, NONE_USER } from 'pages/Loans/Loans.const'
import { FIXED_POINT_ACCURACY, BLOCKS_PER_MINUTE } from 'utils/constants'

import {
  LendingControllerGQL,
  LoansVaultType,
  CollateralType,
  DepositorsFlagType,
} from 'utils/TypesAndInterfaces/Loans'

import { calculateAccruedInterest } from 'pages/Loans/Loans.helpers'
import { convertNumberForClient } from 'utils/calcFunctions'
import { calculateVaultMaxLiquidationAmount } from './calcFunctionsForVault'

type VaultsStorageProps = {
  lendingController: LendingControllerGQL
  accountPkh?: string
}

export const normalizeVaultsStorage = async (storage: VaultsStorageProps) => {
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

    const currentBlock = await (
      await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/blocks/${dayjs().toISOString()}`)
    ).json()

    const data = await lendingController.vaults.reduce<
      Promise<{
        permissinedVaultsIds: string[]
        myVaultsIds: string[]
        allVaultsIds: string[]
        vaultsMapper: Record<string, LoansVaultType>
      }>
    >(
      async (promiseAcc, item) => {
        const acc = await promiseAcc

        // Check whether we have market & vault
        if (!item.loan_token || !item.vault?.address || !item.loan_token.token.token_address) return acc

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
        const depositors = (item.vault?.depositors.map(({ depositor }) => depositor?.address).filter(Boolean) ??
          []) as Array<string>
        // Calc what permission type vaults it is visible to any, whitelist, owner only
        const deporsitorsFlag: DepositorsFlagType =
          item.vault.allowance === 0
            ? ANY_USER
            : item.vault.allowance === 1 && depositors.length !== 0
            ? WHITELIST_USERS
            : NONE_USER

        // Need one source to get levelOfEarly and levelOfLate like vaults or loans.
        // Because at the moment the data is different for the same items

        // let levelOfEarly = 0
        // let levelOfLate = 0

        // if (status === vaultsStatuses.GRACE_PERIOD && currentBlock?.level) {
        //   levelOfEarly = currentBlock?.level ?? 0
        //   levelOfLate =
        //     item.marked_for_liquidation_level + lendingController.liquidation_delay_in_minutes * BLOCKS_PER_MINUTE
        // } else if (status === vaultsStatuses.LIQUIDATABLE && currentBlock?.level && item.liquidation_end_level) {
        //   levelOfEarly = currentBlock?.level ?? 0
        //   levelOfLate = item.liquidation_end_level
        // }

        // Calc how much free tokens pool has fro certain market

        const normallizedVault: LoansVaultType = {
          // Vault stats&meta data
          borrowedTokenAddress: item.loan_token.token.token_address,
          name: item.vault.name,
          address: item.vault?.address,
          ownerId: item.owner?.address || '',
          vaultId: item.internal_id,
          creationTimestamp: item.vault.creation_timestamp ?? undefined,
          xtzDelegatedTo: item.vault?.baker?.address ?? null,
          apr:
            convertNumberForClient({
              number: item.loan_token?.current_interest_rate ?? 0,
              grade: interestRateDecimals,
            }) * 100,

          borrowedAmount,
          // Calc how much free tokens pool has fro certain market
          availableLiquidity:
            item.loan_token.total_remaining -
            (item.loan_token.token_pool_total * item.loan_token.reserve_ratio) / 10000,
          minimumRepay: item.loan_token.min_repayment_amount,
          fee,

          // Vault collaterals data
          collateralData: normalizeCollateralAssets({
            collateralAssets: item.collateral_balances,
          }),

          // Liquidation
          liquidationMax: calculateVaultMaxLiquidationAmount(
            item.loan_outstanding_total,
            lendingController.max_vault_liquidation_pct,
          ),
          liquidationReward: lendingController.liquidation_fee_pct / 10 ** lendingController.decimals,
          adminLiquidateFee: lendingController.admin_liquidation_fee_pct,
          liquidationRatio: lendingController.liquidation_ratio,
          levelOfEarly: currentBlock?.level ?? 0,
          levelOfLate:
            item.marked_for_liquidation_level +
            Number(item.lending_controller?.liquidation_delay_in_minutes) * BLOCKS_PER_MINUTE,

          // Permissions
          sMVKDelegatedTo: '',
          depositors,
          deporsitorsFlag,
        }

        // Add vault object to mapper id => vault
        acc.vaultsMapper[item.vault.address] = normallizedVault
        // Add vault id to all valts list
        acc.allVaultsIds.push(item.vault.address)

        // If user is owner add vault id to my vaults list
        if (accountPkh === item.owner.address) {
          acc.myVaultsIds.push(item.vault.address)
        }

        // If user is depositor of the vault, or vault is visible to anyone, add it to permissioned vaults list
        if (
          ((accountPkh && depositors.includes(accountPkh)) || deporsitorsFlag === ANY_USER) &&
          accountPkh !== item.owner.address
        ) {
          acc.permissinedVaultsIds.push(item.vault.address)
        }

        return acc
      },
      Promise.resolve({
        permissinedVaultsIds: [],
        myVaultsIds: [],
        allVaultsIds: [],
        vaultsMapper: {},
      }),
    )
    return data
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

// Normalize collaterals of the vault
const normalizeCollateralAssets = ({
  collateralAssets,
}: {
  collateralAssets: LendingControllerGQL['vaults'][number]['collateral_balances']
}): Array<CollateralType> =>
  collateralAssets?.reduce<Array<CollateralType>>((acc, collateral) => {
    if (!collateral.collateral_token.token?.token_address) return acc

    acc.push({
      tokenAddress: collateral.collateral_token.token.token_address,
      amount: collateral.balance,
    })

    return acc
  }, [])
