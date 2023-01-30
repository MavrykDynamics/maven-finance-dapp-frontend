import { State } from 'reducers'
import { fetchRateBySymbols } from 'reducers/actions/dipDupActions.actions'
import { Lending_Controller_Collateral_Token, Mavryk_User } from 'utils/generated/graphqlTypes'
import { LoansGQL, AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import BakersMocked from './bakers.json'
import { isTezosAsset } from './Loans.helpers'

export const getXTZBakers = async () => {
  try {
    // TODO: add dynamic fetching
    // const bakers = await fetch('https://api.tezos-nodes.com/v1/bakers')

    return process.env.REACT_APP_NETWORK === 'ghostnet'
      ? [
          {
            rank: 1,
            logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
            logo_min: 'https://tezos-nodes.com/storage/images/U8vdnpeU0LwtQCLge5KjVMBheLBUhNBi2v7lc4zy.png',
            name: 'MyTezosBaking',
            address: 'tz1bQMn5xYFbX6geRxqvuAiTywsCtNywawxH',
            fee: 0.14,
            lifetime: 500,
            yield: 4.91,
            efficiency: 99.56,
            efficiency_last10cycle: 99.93,
            freespace: 115494,
            total_points: 75,
            deletation_status: true,
            freespace_min: '115.49 k XTZ',
            pro_status: true,
          },
        ]
      : BakersMocked
  } catch (e) {
    console.log('getXTZBakers fething error', e)
    return []
  }
}

export const getUserBalanceForLoanAsset = async (
  assetAddress: string,
  assetName: string,
  userAddress?: string,
): Promise<number> => {
  try {
    if (!userAddress) return 0
    const isXTZ = isTezosAsset(assetName)
    const assetBalance = isXTZ
      ? await (
          await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${userAddress}/balance`)
        ).json()
      : await (
          await fetch(
            `https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/tokens/balances?account.eq=${userAddress}&token.contract.in=${assetAddress}`,
          )
        ).json()

    return (
      (typeof assetBalance === 'number'
        ? assetBalance / 10 ** 6
        : Number(assetBalance?.[0]?.balance ?? 0) / 10 ** Number(assetBalance?.[0]?.token?.metadata?.decimals ?? 0)) ??
      0
    )
  } catch (e) {
    console.log('getUserBalanceForLoanAsset fetching error', e)
    return 0
  }
}

export const getCollateralTokens = async (
  collateralTokens: Array<Lending_Controller_Collateral_Token>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRate: State['tokens']['tokensPrices'],
  accountPkh?: string,
): Promise<Array<AvaliableCollateralType>> => {
  if (!accountPkh) return []

  return await collateralTokens.reduce<Promise<AvaliableCollateralType[]>>(
    async (promiseAcc, { id, token_address, token_contract_standard, token_name, protected: isProtected }) => {
      const acc = await promiseAcc
      const isXTZ = isTezosAsset(token_name)
      const assetMetadata = dipDupTokens?.find(({ contract }) => contract === token_address)?.metadata

      const lendingAssetBalance = isXTZ
        ? await (
            await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${accountPkh}/balance`)
          ).json()
        : await (
            await fetch(
              `https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/tokens/balances?account.eq=${accountPkh}&token.contract.in=${token_address}`,
            )
          ).json()

      const userBalance =
        (typeof lendingAssetBalance === 'number'
          ? lendingAssetBalance / 10 ** 6
          : Number(lendingAssetBalance?.[0]?.balance ?? 0) /
            10 ** Number(lendingAssetBalance?.[0]?.token?.metadata?.decimals ?? 0)) ?? 0

      if (isXTZ) {
        acc.push({
          id,
          assetName: token_name,
          assetSymbol: 'tezos',
          assetRate: tokensRate['tezos']?.usd ?? 0.25,
          userBalance,
          assetIcon: '/images/tezos.png',
          assetDecimals: assetMetadata?.decimals ? Number(assetMetadata.decimals) : 6,
          assetAddress: token_address,
          tokenType: token_contract_standard as 'tez' | 'fa12' | 'fa2',
          isProtected,
        })
      }

      if (assetMetadata) {
        acc.push({
          id,
          assetName: token_name,
          assetSymbol: assetMetadata.symbol,
          assetRate: tokensRate[assetMetadata.symbol]?.usd ?? 0.25,
          userBalance,
          assetIcon: assetMetadata.icon,
          assetDecimals: assetMetadata?.decimals ? Number(assetMetadata.decimals) : 6,
          assetAddress: token_address,
          tokenType: token_contract_standard as 'tez' | 'fa12' | 'fa2',
          isProtected,
        })
      }

      return acc
    },
    Promise.resolve([]),
  )
}

export const getLoansTokensRates = async (
  loan_tokens: LoansGQL['loan_tokens'],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokenRatesFromRedux: State['tokens']['tokensPrices'],
) => {
  try {
    const loanTokenSymbols = Array.from(
      loan_tokens?.reduce((acc, { lp_token_address, loan_token_name, vaults }) => {
        // Getting symbol metadata of loanToken
        const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address)
        let tokenSymbolToFetch = null
        if (loan_token_name === 'tez') {
          tokenSymbolToFetch = 'tezos'
        } else {
          tokenSymbolToFetch = tokenInfo?.metadata.symbol ?? loan_token_name
        }

        if (!tokenRatesFromRedux[tokenSymbolToFetch]) {
          acc.add(tokenSymbolToFetch)
        }

        // mapping through vaults to get symbol of each collateral asset
        vaults.forEach(({ collateral_balances }) => {
          collateral_balances.forEach(({ token }) => {
            const collaretalTokenInfo = dipDupTokens?.find(({ contract }) => contract === token?.token_address)

            if (collaretalTokenInfo && !tokenRatesFromRedux[collaretalTokenInfo.metadata.symbol]) {
              acc.add(collaretalTokenInfo.metadata.symbol)
            }
          })
        })
        return acc
      }, new Set<string>()) ?? new Set(),
    )

    return await fetchRateBySymbols(loanTokenSymbols)
  } catch (e) {
    console.log('getLoansRates error: ', e)
    return {}
  }
}

export const getUserLoansDataTokensRates = async (
  loan_tokens: Mavryk_User['lending_controller_history_data_sender'],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokenRatesFromRedux: State['tokens']['tokensPrices'],
) => {
  try {
    const loanTokenSymbols = Array.from(
      loan_tokens?.reduce((acc, { loan_token }) => {
        // Getting symbol metadata of loanToken

        if (!loan_token) return acc
        const tokenInfo = dipDupTokens?.find(({ contract }) => contract === loan_token.loan_token_address)
        let tokenSymbolToFetch = null
        if (loan_token.loan_token_name === 'tez') {
          tokenSymbolToFetch = 'tezos'
        } else {
          tokenSymbolToFetch = tokenInfo?.metadata.symbol ?? loan_token.loan_token_name
        }

        if (!tokenRatesFromRedux[tokenSymbolToFetch]) {
          acc.add(tokenSymbolToFetch)
        }

        return acc
      }, new Set<string>()) ?? new Set(),
    )

    return await fetchRateBySymbols(loanTokenSymbols)
  } catch (e) {
    console.log('getLoansRates error: ', e)
    return {}
  }
}
