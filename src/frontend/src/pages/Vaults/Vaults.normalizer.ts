import dayjs from 'dayjs'

import { ANY_USER, WHITELIST_USERS, NONE_USER, getStatusByCollateralRatio } from 'pages/Loans/Loans.const'
import { FIXED_POINT_ACCURACY, BLOCKS_PER_MINUTE } from 'utils/constants'

import { State } from 'reducers'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import {
  LendingControllerGQL,
  LoansVaultType,
  CollateralType,
  DepositorsFlagType,
} from 'utils/TypesAndInterfaces/Loans'

import { getAssetMetadata, calculateAccruedInterest, calcCollateralRatio } from 'pages/Loans/Loans.helpers'
import { convertNumberForClient } from 'utils/calcFunctions'
import { calculateVaultMaxLiquidationAmount, calculateLiquidationPrice } from './calcFunctionsForVault'
import { DataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider.types'
import { vaultsStatuses } from './Vaults.consts'

type VaultsStorageProps = {
  lendingController: LendingControllerGQL
  accountPkh?: string
  feeds: DataFeedsContext['feedsMapper']
  dipDupTokens: State['tokens']['dipDupTokens']
}

export const normalizeVaultsStorage = async (storage: VaultsStorageProps) => {
  try {
    const { lendingController, feeds, accountPkh, dipDupTokens } = storage
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

        // Get market asset metadata
        const loanTokenMetadata = getAssetMetadata({
          tokenName: item.loan_token.loan_token_name,
          tokenAddress: item.loan_token.token.token_address,
          dipDupTokens,
          feeds,
          oracleId: String(item.loan_token.oracle?.address),
        })

        // Check whether we have market asset metadata
        if (!loanTokenMetadata) return acc

        // Normalize collaterals and check whether vault has xtz collateral
        const vaultCollateral = normalizeCollateralAssets({
          dipDupTokens,
          feeds,
          collateralAssets: item.collateral_balances,
        })

        // Borrowed amount of the vault
        const borrowedAmount = convertNumberForClient({
          number: item.loan_principal_total,
          grade: loanTokenMetadata.decimals,
        })

        // Calc collateral ratio how overcollateralized the vault is
        const collateralRatio = calcCollateralRatio(
          vaultCollateral.totalRow.amount,
          borrowedAmount,
          loanTokenMetadata.rate,
        )

        // Calculating Fee of the vault
        const fee = Math.abs(
          convertNumberForClient({
            number: calculateAccruedInterest(
              item.loan_outstanding_total,
              item.borrow_index,
              item.loan_token.borrow_index,
            ),
            grade: loanTokenMetadata.decimals,
          }) - borrowedAmount,
        )

        const liquidationMax =
          (calculateVaultMaxLiquidationAmount(
            item.loan_outstanding_total,
            lendingController.max_vault_liquidation_pct,
          ) /
            10 ** loanTokenMetadata.decimals) *
          loanTokenMetadata.rate
        const liquidationReward = lendingController.liquidation_fee_pct / 10 ** lendingController.decimals
        const adminLiquidateFee = lendingController.admin_liquidation_fee_pct
        const liquidationPrice = item.loan_token?.oracle?.address
          ? calculateLiquidationPrice(
              item.loan_outstanding_total / 10 ** item.loan_decimals,
              lendingController.liquidation_ratio,
              loanTokenMetadata.rate,
            )
          : 0

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

        // TODO: check data below
        // Need one source to get status like vaults or loans.
        // Because at the moment the data is different for the same items

        const status = borrowedAmount === 0 ? vaultsStatuses.ACTIVE : getStatusByCollateralRatio(collateralRatio)

        // gotStatusByCollateralRatio !== 'no status'
        //   ? gotStatusByCollateralRatio
        //   : item.loan_token?.oracle_id
        //   ? vaultStatusChecker({
        //       currentBlockLevel: currentBlock?.level ?? 0,
        //       liquidationEndLevel: item.liquidation_end_level,
        //       markedForLiquidationLevel: item.marked_for_liquidation_level,
        //       liquidationDelayInMinutes: lendingController.liquidation_delay_in_minutes,
        //       loanOutstandingTotal: item.loan_outstanding_total / 10 ** item.loan_decimals,
        //       loanTokenOracleAddress: item.loan_token.oracle_id,
        //       liquidationRatio: lendingController.liquidation_ratio,
        //       vaultCollateralTokens: normalizeCollateralTokens,
        //       collateralRatio: lendingController.collateral_ratio,
        //       oracleLatestPrices,
        //     })
        //   : 'no status'

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

        // Calc how much free tokens pool has
        const availableLiquidity = convertNumberForClient({
          number:
            item.loan_token.total_remaining -
            (item.loan_token.token_pool_total * item.loan_token.reserve_ratio) / 10000,
          grade: loanTokenMetadata.decimals,
        })

        const normallizedVault = {
          // Vault stats&meta data
          borrowedAsset: {
            ...loanTokenMetadata,
            // TODO: token issue
            tokenType: item.loan_token.token.token_standard as TokenType,
          },
          name: item.vault.name,
          address: item.vault?.address,
          ownerId: item.owner?.address || '',
          vaultId: item.internal_id,
          creationTimestamp: item.vault.creation_timestamp ?? undefined,
          xtzDelegatedTo: item.vault?.baker?.address ?? null,
          status,
          apr:
            convertNumberForClient({
              number: item.loan_token?.current_interest_rate ?? 0,
              grade: interestRateDecimals,
            }) * 100,

          // Vault borrow capability
          borrowedAmount,
          borrowCapacity: Math.min(
            vaultCollateral.totalRow.amount / 2 - borrowedAmount * loanTokenMetadata.rate,
            Math.max(availableLiquidity, 0),
          ),
          availableLiquidity,
          minimumRepay: convertNumberForClient({
            number: item.loan_token.min_repayment_amount,
            grade: loanTokenMetadata.decimals,
          }),
          fee,

          // Vault collaterals data
          collateralBalance: vaultCollateral.totalRow.amount,
          collateralRatio,

          collateralData: vaultCollateral.normalizedCollaterals.length
            ? [...vaultCollateral.normalizedCollaterals, vaultCollateral.totalRow]
            : [],

          // Liquidation
          liquidationMax,
          liquidationReward,
          adminLiquidateFee,
          liquidationPrice,
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
  feeds,
  dipDupTokens,
  collateralAssets,
}: {
  feeds: DataFeedsContext['feedsMapper']
  dipDupTokens: State['tokens']['dipDupTokens']
  collateralAssets: LendingControllerGQL['vaults'][number]['collateral_balances']
}): {
  normalizedCollaterals: Array<CollateralType>
  totalRow: CollateralType
} => {
  const normalizedCollaterals = collateralAssets?.reduce<{
    normalizedCollaterals: Array<CollateralType>
    totalRow: CollateralType
  }>(
    (acc, collateral) => {
      if (!collateral.collateral_token.token?.token_address) return acc

      const collateralAsset = getAssetMetadata({
        tokenName: collateral.collateral_token.token_name,
        tokenAddress: collateral.collateral_token.token.token_address,
        dipDupTokens,
        feeds,
        oracleId: String(collateral.collateral_token.oracle?.address),
      })

      if (!collateralAsset) return acc

      const collateralBalance = collateral.balance / 10 ** collateralAsset.decimals

      acc.normalizedCollaterals.push({
        ...collateralAsset,
        amount: collateralBalance,
      })

      acc.totalRow.amount += collateralBalance * collateralAsset.rate
      return acc
    },
    {
      normalizedCollaterals: [],
      totalRow: {
        symbol: 'total',
        amount: 0,
        rate: 0,
        name: '',
        gqlName: '',
        address: '',
        icon: '',
        id: 0,
        decimals: 0,
      },
    },
  )

  return normalizedCollaterals
}
