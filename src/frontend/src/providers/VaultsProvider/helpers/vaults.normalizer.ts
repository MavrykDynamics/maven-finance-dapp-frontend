import { BigNumber } from 'bignumber.js'
import { ANY_USER, WHITELIST_USERS, NONE_USER } from 'pages/Loans/Loans.const'
import { BLOCKS_PER_MINUTE, SMVK_TOKEN_ADDRESS } from 'utils/constants'

import {
  CollateralType,
  DepositorsFlagType,
  VaultType,
  VaultsCtxState,
} from 'providers/VaultsProvider/vaults.provider.types'
import { calculateAccruedInterest } from 'pages/Loans/Loans.helpers'
import { convertNumberForClient, convertNumberForClientBN } from 'utils/calcFunctions'
import { calculateVaultMaxLiquidationAmount } from 'providers/VaultsProvider/helpers/vaults.utils'
import { GetUserVaultsQueryQuery } from 'utils/__generated__/graphql'
import { calcMarketAvaliableLiquidity } from 'providers/LoansProvider/helpers/loans.utils'

const getVaultsDepositorsData = (
  vault: Exclude<GetUserVaultsQueryQuery['lending_controller'][number]['vaults'][number]['vault'], null | undefined>,
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
  collateral_balances: GetUserVaultsQueryQuery['lending_controller'][number]['vaults'][number]['collateral_balances'],
) => {
  return collateral_balances.reduce<Array<CollateralType>>((acc, collateral) => {
    if (!collateral.collateral_token.token) return acc

    // condition to set smvk client address, cuz back-end returns mvk token address, that is not valid for output
    if (collateral.collateral_token.token_name === 'smvk') {
      acc.push({
        tokenAddress: SMVK_TOKEN_ADDRESS,
        amount: new BigNumber(collateral.balance),
      })
    } else {
      acc.push({
        tokenAddress: collateral.collateral_token.token.token_address,
        amount: new BigNumber(collateral.balance),
      })
    }

    return acc
  }, [])
}

export const normalizeVaults = ({
  indexerData,
  userAddress,
}: {
  indexerData: GetUserVaultsQueryQuery
  userAddress: string | null
}) => {
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

  return vaults.reduce<VaultsCtxState>(
    (acc, item) => {
      const {
        vault,
        collateral_balances,
        loan_outstanding_total,
        loan_interest_total: accuredInterest,
        loan_decimals,
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

      // const fee = convertNumberForClientBN({ number: accuredInterest, grade: loan_decimals })

      // console.log({ accuredInterest: fee, accuredInterestIndexer: accuredInterest, loan_decimals })
      // calculateAccruedInterest({
      //   currentLoanOutstandingTotal: loan_outstanding_total,
      //   vaultBorrowIndex,
      //   marketBorrowIndex,
      //   borrowedAmount,
      // })

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

        borrowedAmount: new BigNumber(borrowedAmount),
        availableLiquidity,
        minimumRepay: min_repayment_amount,
        fee: new BigNumber(accuredInterest),
        collateralData,
        vaultBorrowIndex,

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

      acc.vaultsMapper[vault.address] = normallizedVault

      // If user is owner add vault id to my vaults list
      if (userAddress) {
        if (userAddress === normallizedVault.ownerAddress) {
          acc.myVaultsIds.push(vault.address)
        } else if (depositors.includes(userAddress) || deporsitorsFlag === ANY_USER) {
          acc.permissionedVaultsIds.push(vault.address)
        }
      }

      acc.allVaultsIds.push(vault.address)

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
