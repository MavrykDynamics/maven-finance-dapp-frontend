import { getAssetMetadata } from 'pages/Loans/Loans.helpers'
import { State } from 'reducers'
import { calcWithoutMu } from 'utils/calcFunctions'
import { Lending_Controller_Collateral_Token } from 'utils/generated/graphqlTypes'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import BakersMocked from './bakers.json'
import { getSymbolAndNameFromCollaterealGqlname } from 'utils/parse'
import { TokenType } from 'utils/TypesAndInterfaces/General'

export type BakeryDelegateDataType = {
  balance: number
  delegatedBalance: number
}

export const getBakeryDelegateData = async (bakerAddress: string): Promise<BakeryDelegateDataType> => {
  try {
    const response = await fetch(`https://api.tzkt.io/v1/delegates/${bakerAddress}`)
    const result = await response.json()

    return result
  } catch {
    return {
      balance: -1,
      delegatedBalance: -1,
    }
  }
}

export const getFreeSpace = (data: BakeryDelegateDataType) => {
  if (data.balance === -1) return [-1]

  const balance = data.balance
  const totalAmountOfSpace = balance * 9
  const freeSpace = totalAmountOfSpace - data.delegatedBalance
  const divededByMu = calcWithoutMu(freeSpace).toFixed(2)

  return [Number(divededByMu)]
}

export const getXTZBakers = async () => {
  try {
    // TODO: add dynamic fetching
    // const bakers = await fetch('https://api.tezos-nodes.com/v1/bakers')

    const otherBakers =
      process.env.REACT_APP_NETWORK === 'ghostnet'
        ? [
            {
              logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
              name: 'Puss in Boots',
              address: 'tz1bQMn5xYFbX6geRxqvuAiTywsCtNywawxH',
              fee: 0.14,
              yield: 4.91,
              freespace: 115494,
            },
            {
              logo: 'https://services.tzkt.io/v1/avatars/tz1eQmVDH438N6WN4CQSWJLVDFqpFfkZvt1R',
              name: 'Lil Shrek',
              address: 'tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP',
              fee: 0.14,
              yield: 4.91,
              freespace: 115494,
            },
            {
              logo: 'https://services.tzkt.io/v1/avatars/tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP',
              name: "Shrek's donkey",
              address: 'tz1Qf1pSbJzMN4VtGFfVJRgbXhBksRv36TxW',
              fee: 0.14,
              yield: 4.91,
              freespace: 115494,
            },
          ]
        : BakersMocked

    const values = await Promise.all([
      getBakeryDelegateData('tz1ZY5ug2KcAiaVfxhDKtKLx8U5zEgsxgdjV'),
      getBakeryDelegateData('tz1NKnczKg77PwF5NxrRohjT5j4PmPXw6hhL'),
    ])

    return {
      otherBakers,
      dao: {
        isDisabled: process.env.REACT_APP_NETWORK !== 'mainnet',
        logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
        name: 'The DAO',
        address: 'tz1ZY5ug2KcAiaVfxhDKtKLx8U5zEgsxgdjV',
        fee: 10,
        yield: 5.5,
        freespace: getFreeSpace(values[0] as BakeryDelegateDataType),
        description: `The Mavryk DAO Bakery belongs to the Mavryk Finance network. A small portion of the earnings are used to pay for the Decentralized Oracle’s transaction fees. The DAO Bakery is operated by Mavryk Dynamics on behalf of the Mavryk Finance network.`,
      },
      mavrykDynamics: {
        isDisabled: process.env.REACT_APP_NETWORK !== 'mainnet',
        logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
        name: 'Mavryk Dynamics',
        address: 'tz1NKnczKg77PwF5NxrRohjT5j4PmPXw6hhL',
        fee: 10,
        yield: 5.5,
        freespace: getFreeSpace(values[1] as BakeryDelegateDataType),
        description: `The Mavryk Dynamics Bakery belongs to one of the core teams contributing to Mavryk Finance. Delegating to this Bakery contributes to the further development of Mavryk Finance.`,
      },
    }
  } catch (e) {
    console.log('getXTZBakers fething error', e)
    return []
  }
}

export const getCollateralTokens = (
  collateralTokens: Array<Lending_Controller_Collateral_Token>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['dataFeeds']['feedsLedger'],
): Array<AvaliableCollateralType> => {
  try {
    return collateralTokens.reduce<AvaliableCollateralType[]>(
      (acc, { collateral_token, token_name, protected: isProtected, oracle_id }) => {
        if (!collateral_token) return acc
        const assetMetadata = getAssetMetadata({
          tokenName: token_name,
          tokenAddress: collateral_token.token_address,
          dipDupTokens,
          feeds,
          oracleId: String(oracle_id),
        })

        if (assetMetadata) {
          const { name, symbol } = getSymbolAndNameFromCollaterealGqlname(assetMetadata.symbol, assetMetadata.gqlName)

          acc.push({
            ...assetMetadata,
            name,
            symbol,
            tokenType: collateral_token.token_standard as TokenType,
            isProtected,
          })
        }

        return acc
      },
      [],
    )
  } catch (e) {
    console.log('getCollateralTokens error:', e)
    return []
  }
}
