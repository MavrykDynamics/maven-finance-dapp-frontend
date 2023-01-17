import { coinGeckoClient } from 'app/App.controller'
import { State } from 'reducers'
import { Lending_Controller_Collateral_Token } from 'utils/generated/graphqlTypes'
import { LoansGQL, AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import BakersMocked from './bakers.json'

export const getXTZBakers = async () => {
  try {
    // TODO: add dynamic fetching
    // const bakers = await fetch('https://api.tezos-nodes.com/v1/bakers')

    return BakersMocked
  } catch (e) {
    console.log('getXTZBakers fething error', e)
    return []
  }
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

export const getLoansTokensRates = async (
  loan_tokens: LoansGQL['loan_tokens'],
  dipDupTokens: State['tokens']['dipDupTokens'],
) => {
  try {
    const loanTokenSymbols = Array.from(
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

    return await (
      await Promise.all(loanTokenSymbols.map((symbol) => coinGeckoClient.coins.fetch(symbol, {})))
    ).reduce<Record<string, number>>((acc, promiseResult) => {
      if (promiseResult?.success && promiseResult?.code === 200) {
        // TODO: extract this, and consider use id instead of symbol
        const symbol = promiseResult.data.symbol === 'xtz' ? 'tezos' : promiseResult.data.symbol
        const rate = promiseResult.data.market_data.current_price.usd
        acc[symbol] = rate
      }

      return acc
    }, {})
  } catch (e) {
    console.log('getLoansRates error: ', e)
    return {}
  }
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
