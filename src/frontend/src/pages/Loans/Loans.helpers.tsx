import { UTCTimestamp } from 'lightweight-charts'
import { State } from 'reducers'
import { UserState } from 'reducers/wallet'
import {
  Lending_Controller_Collateral_Token,
  Lending_Controller_History_Data,
  Lending_Controller_Loan_Token,
  Lending_Controller_Vault,
} from 'utils/generated/graphqlTypes'
import { parseDate } from 'utils/time'
import {
  AvaliableCollateralType,
  BorrowingData,
  LendingItemType,
  LoansChartsDataType,
  LoansGQL,
  LoanTokenType,
} from 'utils/TypesAndInterfaces/Loans'
import { calcWithoutDecimals, calcWithoutMu } from '../../utils/calcFunctions'

const getCollateralTotal = (
  vaults: Lending_Controller_Vault[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
) =>
  vaults.reduce(
    //TOOD: what should i do if i don't have rate for token
    (acc, { collateral_balances = [], history_data = [] }) => {
      const vaultCorratealBalance = collateral_balances.reduce((vaultAcc, { balance, token }) => {
        const assetSymbol = dipDupTokens.find(({ contract }) => contract === token?.token_address)?.metadata.symbol
        const rate = assetSymbol ? tokensRates[assetSymbol] ?? 0.25 : 0.25
        vaultAcc += balance * rate
        return vaultAcc
      }, 0)

      const borrowedAmount = history_data.reduce((vaultAcc, { type, amount, loan_token }) => {
        if (type === 3 || type === 2) {
          const assetSymbol = dipDupTokens.find(({ contract }) => contract === loan_token?.loan_token_address)?.metadata
            .symbol
          const rate = assetSymbol ? tokensRates[assetSymbol] ?? 0.25 : 0.25
          vaultAcc += amount * rate
        }
        return vaultAcc
      }, 0)

      acc.corratealAmount += Number(vaultCorratealBalance)
      acc.borrowedAmount += Number(borrowedAmount)
      return acc
    },
    { corratealAmount: 0, borrowedAmount: 0 },
  )

const getTransactionHistory = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
) =>
  history_data.reduce<{
    transactionHistory: LoanTokenType['transactionHistory']
    totalBorrowed: number
    totalLended: number
  }>(
    (acc, { type, amount, timestamp, sender_id, operation_hash, loan_token }) => {
      const tokenSymbol = dipDupTokens?.find(({ contract }) => contract === loan_token?.loan_token_address)?.metadata
        .symbol

      const descrByType = getDescrByType(type)
      if (descrByType) {
        acc.transactionHistory.push({
          amount,
          date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
          userAddress: sender_id,
          operationHash: operation_hash,
          descr: getDescrByType(type),
          tokenSymbol,
        })
      }

      if (type === 1 || type === 0) {
        acc.totalLended += amount
      }

      if (type === 3 || type === 2) {
        acc.totalBorrowed += amount
      }

      return acc
    },
    { transactionHistory: [], totalBorrowed: 0, totalLended: 0 },
  )

const getChartData = (history_data: Lending_Controller_History_Data[]) =>
  history_data?.reduce<LoansChartsDataType>(
    (acc, { type, amount, timestamp }) => {
      switch (type) {
        case 0:
        case 1:
          acc.totalLended += amount
          acc.lendingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: amount })
          break

        case 2:
        case 3:
          acc.totalBorrowed += amount
          acc.borrowingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: amount })
          break
      }
      return acc
    },
    {
      totalBorrowed: 0,
      borrowingChartData: [],
      totalLended: 0,
      lendingChartData: [],
    },
  )

const calcLendingAPY = (currentInterestRate: number, treasuryShare: number): number => {
  // ((1 + (currentInterestRate - treasuryShare)/secondsPerYear)^secondsPerYear - 1) * 100
  const secondsPerYear = 60 * 60 * 24 * 365

  const top = currentInterestRate - treasuryShare
  const firstTerm = 1 + top / secondsPerYear
  const power = firstTerm ** secondsPerYear
  return (power - 1) * 100
}
const getLendingItem = (
  loanToken: Lending_Controller_Loan_Token,
  userMTokens: UserState['mTokens'],
  userAssetBalances: Record<string, number>,
  interestTreasuryShare: number,
  interestRateDecimals: number,
): LendingItemType => {
  if (userMTokens && loanToken) {
    const mTokenAsset = userMTokens?.find(({ m_token_id }) => m_token_id === loanToken.lp_token_address)

    const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)
    const borrowAPR = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)

    if (mTokenAsset) {
      return {
        lendValue: mTokenAsset.balance,
        interestEarned: mTokenAsset.rewards_earned,
        mBalance: Number(mTokenAsset.balance) + Number(mTokenAsset.rewards_earned),
        // TODO: implement these values later
        loanAssetWalletBalance: userAssetBalances[loanToken.lp_token_address],
        lendAPY: calcLendingAPY(tokenCurrentInterestRate, interestTreasuryShare),
        borrowAPR: calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals) * 100,
      }
    }
  }
  return null
}

const getBorrowings = (
  loanTokenVaults: Array<Lending_Controller_Vault>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
  userAddress?: string,
): { myBorrowingList: Array<BorrowingData>; permissinedBorrowingList: Array<BorrowingData> } => {
  return loanTokenVaults.reduce<{
    myBorrowingList: Array<BorrowingData>
    permissinedBorrowingList: Array<BorrowingData>
  }>(
    (acc, vault) => {
      const asset = dipDupTokens.find(({ contract }) => contract === vault.loan_token?.loan_token_address)

      const vaultCollateral = vault.collateral_balances.reduce<{
        normalizedCollaterals: BorrowingData['collateralData']
        totalRow: BorrowingData['collateralData'][number]
      }>(
        (acc, collateral) => {
          // const isXTZ = collateral.token?.token_address.includes('tz')
          const asset = dipDupTokens.find(({ contract }) => contract === collateral.token?.token_address) ?? {
            metadata: {
              symbol: 'tezos',
              icon: '/images/tezos.png',
            },
          }

          acc.normalizedCollaterals.push({
            assetSymbol: asset?.metadata.symbol,
            assetIcon: asset?.metadata.icon,
            balance: collateral.balance,
            ...(asset?.metadata.symbol ? { assetRate: tokensRates[asset.metadata.symbol] } : { assetRate: 0.25 }),
            maxWithdraw: 0,
          })

          acc.totalRow.balance += collateral.balance
          acc.totalRow.maxWithdraw += 0

          return acc
        },
        {
          normalizedCollaterals: [],
          totalRow: {
            assetSymbol: 'total',
            balance: 0,
            assetRate: null,
            maxWithdraw: 0,
          },
        },
      )

      const normallizedVault = {
        borrowedAsset: {
          assetSymbol: asset?.metadata.symbol ?? vault.loan_token?.loan_token_name,
          ...(asset?.metadata.name ? { assetName: asset?.metadata.name } : {}),
          assetIcon: asset?.metadata.icon,
          amtBorrowed: 0,
          ...(asset?.metadata.symbol
            ? {
                assetRate: tokensRates[vault.loan_token?.loan_token_name === 'tezos' ? 'tezos' : asset.metadata.symbol],
              }
            : { assetRate: 0.25 }),
          collateralBalance: vaultCollateral.totalRow?.balance ?? 0,
          collateralUtilization: 0,
          apy: 0,
          fee: 0,
        },
        collateralData: vaultCollateral.normalizedCollaterals.concat(
          vaultCollateral.normalizedCollaterals.length > 1 ? [vaultCollateral.totalRow] : [],
        ),
        borrowedAmount: vault.loan_outstanding_total,
        xtzDelegatedTo: '',
        operators: [],
        sMVKDelegatedTo: '',
        depositors: vault.vault?.depositors.map(({ depositor_id }) => depositor_id) as Array<string> | undefined,
      }

      if (vault.owner_id === userAddress) {
        acc.myBorrowingList.push(normallizedVault)
      }

      if (vault.vault?.depositors.find(({ depositor_id }) => depositor_id === userAddress)) {
        acc.permissinedBorrowingList.push(normallizedVault)
      }

      return acc
    },
    { myBorrowingList: [], permissinedBorrowingList: [] },
  )
}

export const getCollateralTokens = async (
  collateralTokens: Array<Lending_Controller_Collateral_Token>,
  loanTokens: LoansGQL['loan_tokens'],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRate: Record<string, number>,
  accountPkh?: string,
): Promise<Array<AvaliableCollateralType>> => {
  if (!accountPkh) return []

  const userBalancesCallbacks = collateralTokens.map(({ token_address }) => {
    const isXTZ = token_address.includes('tz')

    return isXTZ
      ? () => fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${accountPkh}/balance`)
      : () =>
          fetch(
            `https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/tokens/balances?account.eq=${accountPkh}&token.contract.in=${token_address}`,
          )
  })

  const mappedLoanTokens = loanTokens.reduce<Record<number, string>>((acc, { id, loan_token_name }) => {
    acc[id] = loan_token_name
    return acc
  }, {})

  const userBalances = (await Promise.all(
    (await Promise.all(userBalancesCallbacks.map((fn) => fn()))).map((item) => item.json()),
  )) as Array<undefined | number | [{ balance: string; token: { metadata: { decimals: string } } }]>

  return collateralTokens.reduce<Array<AvaliableCollateralType>>((acc, { id, token_address }, idx) => {
    const isXTZ = token_address.includes('tz')
    const assetMetadata = dipDupTokens?.find(({ contract }) => contract === token_address)?.metadata

    const userAssetData = userBalances?.[idx]

    if (isXTZ) {
      acc.push({
        id,
        assetName: mappedLoanTokens[id] ?? 'XTZ',
        assetSymbol: 'tezos',
        assetRate: tokensRate['tezos'] ?? 0.25,
        userBalance: userAssetData && typeof userAssetData === 'number' ? userAssetData : 0,
        assetIcon: '/images/tezos.png',
        assetDecimals: assetMetadata?.decimals ? Number(assetMetadata.decimals) : 6,
        assetAddress: token_address,
      })
    }

    if (assetMetadata) {
      acc.push({
        id,
        assetName: mappedLoanTokens[id] ?? assetMetadata.name,
        assetSymbol: assetMetadata.symbol,
        assetRate: tokensRate[assetMetadata.symbol] ?? 0.25,
        userBalance:
          userAssetData && typeof userAssetData === 'object'
            ? Number(userAssetData?.[0]?.balance ?? 0) / Number(userAssetData?.[0]?.token?.metadata?.decimals ?? 1)
            : 0,
        assetIcon: assetMetadata.icon,
        assetDecimals: assetMetadata?.decimals ? Number(assetMetadata.decimals) : 6,
        assetAddress: token_address,
      })
    }

    return acc
  }, [])
}

export const getLoanTokensSymbols = ({
  loan_tokens,
  dipDupTokens,
}: {
  loan_tokens: LoansGQL['loan_tokens']
  dipDupTokens: State['tokens']['dipDupTokens']
}) => {
  return Array.from(
    loan_tokens?.reduce((acc, { lp_token_address, loan_token_name, vaults }) => {
      // Getting symbol metadata of loanToken
      const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address)
      if (loan_token_name === 'tez') {
        acc.add('tezos')
      } else {
        acc.add(tokenInfo?.metadata.symbol ?? loan_token_name)
      }

      // mapping through vaults to get symbol of each collateral asset
      vaults.forEach(({ collateral_balances }) => {
        collateral_balances.forEach(({ token }) => {
          const collaretalTokenInfo = dipDupTokens?.find(({ contract }) => contract === token?.token_address)

          if (collaretalTokenInfo) {
            acc.add(collaretalTokenInfo.metadata.symbol)
          }
        })
      })
      return acc
    }, new Set<string>()) ?? new Set(),
  )
}

export const getUserBalances = async ({ storage, accountPkh }: { storage: LoansGQL; accountPkh?: string }) => {
  const addresses = storage?.loan_tokens?.reduce<Array<string>>((acc, loan_token) => {
    acc.push(loan_token.lp_token_address)

    return acc
  }, [])

  const userBalancesCallbacks = addresses.map((tokenAddress) => {
    const isXTZ = tokenAddress.includes('tz')

    return isXTZ
      ? () => fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${accountPkh}/balance`)
      : () =>
          fetch(
            `https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/tokens/balances?account.eq=${accountPkh}&token.contract.in=${tokenAddress}`,
          )
  })

  const userBalances = (await Promise.all(
    (await Promise.all(userBalancesCallbacks.map((fn) => fn()))).map((item) => item.json()),
  )) as Array<undefined | number | [{ balance: string; token: { metadata: { decimals: string } } }]>

  return userBalances.reduce<Record<string, number>>((acc, balance, idx) => {
    const tokenAddressToBalance = addresses[idx]
    const userBalance =
      typeof balance === 'number'
        ? balance
        : Number(balance?.[0]?.balance ?? 0) / Number(balance?.[0]?.token?.metadata?.decimals ?? 1)

    acc[tokenAddressToBalance] = userBalance
    return acc
  }, {})
}

export const normalizeLoans = ({
  storage,
  dipDupTokens,
  mTokens,
  userMTokens,
  userAddres,
  tokensRate,
  userAssetBalances,
}: {
  storage: LoansGQL
  dipDupTokens: State['tokens']['dipDupTokens']
  mTokens: State['tokens']['mTokens']
  userMTokens: UserState['mTokens']
  userAddres?: string
  tokensRate: Record<string, number>
  userAssetBalances: Record<string, number>
}) => {
  const interestTreasuryShare = calcWithoutDecimals(storage?.interest_treasury_share, storage.decimals)
  const loanTokens = storage?.loan_tokens?.reduce<Array<LoanTokenType>>((acc, loanToken) => {
    const {
      lp_token_address,
      loan_token_name,
      utilisation_rate,
      total_remaining,
      history_data,
      vaults,
      reserve_ratio,
      token_pool_total,
    } = loanToken
    const isXTZ = loan_token_name === 'tezos'
    const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address && !isXTZ)
    // TODO: add valid rate instead of 0.25
    const assetRate = tokensRate[isXTZ ? 'tezos' : tokenInfo?.metadata.symbol ?? loan_token_name] ?? 0.25

    const loanTokenMetadata = {
      name: isXTZ ? 'XTZ' : loan_token_name,
      symbol: isXTZ ? 'tezos' : tokenInfo?.metadata.symbol,
      decimals: isXTZ ? 6 : Number(tokenInfo?.metadata.decimals ?? 1),
      icon: isXTZ ? '/images/tezos.png' : tokenInfo?.metadata.icon,
      rate: assetRate,
    }

    const { transactionHistory, totalBorrowed, totalLended } = getTransactionHistory(history_data, dipDupTokens)
    const { corratealAmount, borrowedAmount } = getCollateralTotal(vaults, dipDupTokens, tokensRate)
    const { myBorrowingList, permissinedBorrowingList } = getBorrowings(vaults, dipDupTokens, tokensRate, userAddres)

    const lendingItem = getLendingItem(
      loanToken,
      userMTokens,
      userAssetBalances,
      interestTreasuryShare,
      storage.interest_rate_decimals,
    )
    const totalLending = isXTZ
      ? calcWithoutMu(totalLended)
      : calcWithoutDecimals(totalLended, Number(tokenInfo?.metadata.decimals ?? 1))
    const availableLiquidity = isXTZ
      ? calcWithoutMu(total_remaining)
      : calcWithoutDecimals(total_remaining, Number(tokenInfo?.metadata.decimals ?? 1))

    acc.push({
      loanTokenData: loanTokenMetadata,
      myBorrowingList,
      permissionedBorrowingList: permissinedBorrowingList,
      lendingItem,
      transactionHistory,
      utilisationRate: utilisation_rate,
      totalBorrowed,
      borrowers: vaults.length,
      suppliers: mTokens.filter(({ loan_token_name: m_token_name }) => loan_token_name === m_token_name).length,
      collateral: corratealAmount,
      vaultsBorrowedAmount: borrowedAmount,
      totalLending,
      availableLiquidity,
      totalFeesEarned: userMTokens?.reduce((acc, { rewards_earned }) => acc + rewards_earned, 0) ?? 0,
      collateralFactor: storage.collateral_ratio / 10,
      reserveFactor: reserve_ratio / 100,
      reserveAmount: (token_pool_total * reserve_ratio) / 100,
      borrowAPR: lendingItem?.borrowAPR ?? 0,
      lendingAPY: lendingItem?.lendAPY ?? 0,
    })

    return acc
  }, [])

  return {
    loansControllerAddress: storage?.address,
    loanTokens,
    chartsData: getChartData(storage?.history_data),
  }
}

/** ADD_LIQUIDITY: 0
 * REMOVE_LIQUIDITY: 1
 * BORROW: 2
 * REPAY: 3
 * DEPOSIT: 4
 * WITHDRAW: 5
 * DEPOSIT_SMVK: 6
 * WITHDRAW_SMVK: 7
 * VAULT_CREATION: 8
 * MARK_FOR_LIQUIDATION: 9
 * LIQUIDATE_VAULT: 10
 * CLOSE_VAULT: 11
 * */

const getDescrByType = (type: number) => {
  switch (type) {
    case 0:
      return 'Liquidity Added'
    case 1:
      return 'Liquidity Removed'
    case 2:
      return 'Borrowed'
    case 3:
      return 'Repaid'
    case 4:
      return 'Deposited'
    case 5:
      return 'WITHDRAW DEF'
    case 6:
      return 'DEPOSIT_SMVK DEF'
    case 7:
      return 'WITHDRAW_SMVK DEF'
    case 8:
      return 'Vault Created'
    case 9:
      return 'Vault Marked for Liq.'
    case 10:
      return 'Vault Liquidated'
    case 11:
      return 'Vault Closed'
    default:
      return null
  }
}
