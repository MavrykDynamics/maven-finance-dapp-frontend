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

    const otherBakers =
      process.env.REACT_APP_NETWORK === 'ghostnet'
        ? [
            {
              logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
              name: 'Puss in Buts',
              address: 'tz1bQMn5xYFbX6geRxqvuAiTywsCtNywawxH',
              fee: 0.14,
              yield: 4.91,
              efficiency: 99.56,
              freespace: 115494,
            },
            {
              logo: 'https://services.tzkt.io/v1/avatars/tz1eQmVDH438N6WN4CQSWJLVDFqpFfkZvt1R',
              name: 'Lil Shrek',
              address: 'tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP',
              fee: 0.14,
              yield: 4.91,
              efficiency: 99.56,
              freespace: 115494,
            },
            {
              logo: 'https://services.tzkt.io/v1/avatars/tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP',
              name: "Shrek's donkey",
              address: 'tz1Qf1pSbJzMN4VtGFfVJRgbXhBksRv36TxW',
              fee: 0.14,
              yield: 4.91,
              efficiency: 99.56,
              freespace: 115494,
            },
          ]
        : BakersMocked

    return {
      otherBakers,
      dao: {
        logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
        name: 'The DAO',
        address: 'tz1ZY5ug2KcAiaVfxhDKtKLx8U5zEgsxgdjV',
        fee: 0.14,
        yield: 4.91,
        efficiency: 99.56,
        freespace: 115494,
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod tincidunt felis, ac vehicula tellus
        auctor id. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et ligula
        fringilla, tempus sapien eget, pellentesque orci. Donec finibus quam rhoncus, fringilla ex ut, feugiat
        nulla. Curabitur tristique augue non ante hendrerit ultrices`,
      },
      mavrykDynamics: {
        logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
        name: 'Mavryk Dynamics',
        address: 'tz1NKnczKg77PwF5NxrRohjT5j4PmPXw6hhL',
        fee: 0.14,
        yield: 4.91,
        efficiency: 99.56,
        freespace: 115494,
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod tincidunt felis, ac vehicula tellus
        auctor id. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et ligula
        fringilla, tempus sapien eget, pellentesque orci. Donec finibus quam rhoncus, fringilla ex ut, feugiat
        nulla. Curabitur tristique augue non ante hendrerit ultrices`,
      },
    }
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
    console.log('getUserBalanceForLoanAsset error:', e)
    return 0
  }
}

export const getCollateralTokens = async (
  collateralTokens: Array<Lending_Controller_Collateral_Token>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['oracles']['oraclesStorage']['feeds'],
  accountPkh?: string,
): Promise<Array<AvaliableCollateralType>> => {
  if (!accountPkh) return []

  try {
    return await collateralTokens.reduce<Promise<AvaliableCollateralType[]>>(
      async (
        promiseAcc,
        { id, token_address, token_contract_standard, token_name, protected: isProtected, oracle_id },
      ) => {
        const acc = await promiseAcc
        const isXTZ = isTezosAsset(token_name)
        const assetMetadata = dipDupTokens?.find(({ contract }) => contract === token_address)?.metadata

        const dataFromFeed = feeds.find(({ address }) => address === oracle_id)

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

        const rate = Number(dataFromFeed?.last_completed_data) / 10 ** Number(dataFromFeed?.decimals)

        if (isXTZ) {
          acc.push({
            id,
            name: 'Tezos',
            gqlName: token_name,
            symbol: 'XTZ',
            rate: rate ?? 0.25,
            userBalance,
            icon: '/images/tezos.png',
            decimals: assetMetadata?.decimals ? Number(assetMetadata.decimals) : 6,
            address: token_address,
            tokenType: token_contract_standard as 'tez' | 'fa12' | 'fa2',
            isProtected,
          })
        }

        if (assetMetadata) {
          acc.push({
            id,
            name: assetMetadata.name,
            gqlName: token_name,
            symbol: assetMetadata.symbol,
            rate: rate ?? 0.25,
            userBalance,
            icon: token_name === 'eurl' ? '/images/eurl.png' : assetMetadata.icon ?? dataFromFeed?.icon,
            decimals: assetMetadata?.decimals ? Number(assetMetadata.decimals) : 6,
            address: token_address,
            tokenType: token_contract_standard as 'tez' | 'fa12' | 'fa2',
            isProtected,
          })
        }

        return acc
      },
      Promise.resolve([]),
    )
  } catch (e) {
    console.log('getCollateralTokens error:', e)

    return []
  }
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
    console.log('getLoansTokensRates error: ', e)
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
    console.log('getUserLoansDataTokensRates error: ', e)
    return {}
  }
}
