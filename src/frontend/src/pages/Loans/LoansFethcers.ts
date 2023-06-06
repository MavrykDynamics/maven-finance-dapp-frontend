import { getAssetMetadata } from 'pages/Loans/Loans.helpers'
import { State } from 'reducers'
import { Lending_Controller_Collateral_Token } from 'utils/generated/graphqlTypes'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { getSymbolAndNameFromCollaterealGqlname } from 'utils/parse'
import { DataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider.types'
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

export const getCollateralTokens = (
  collateralTokens: Array<Lending_Controller_Collateral_Token>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: DataFeedsContext['feedsMapper'],
): Array<AvaliableCollateralType> => {
  try {
    return collateralTokens.reduce<AvaliableCollateralType[]>(
      (acc, { token: { token_address, token_standard }, token_name, protected: isProtected, oracle }) => {
        const assetMetadata = getAssetMetadata({
          tokenName: token_name,
          tokenAddress: token_address,
          dipDupTokens,
          feeds,
          oracleId: String(oracle?.address),
        })

        if (assetMetadata) {
          const { name, symbol } = getSymbolAndNameFromCollaterealGqlname(assetMetadata.symbol, assetMetadata.gqlName)

          acc.push({
            ...assetMetadata,
            name,
            symbol,
            tokenType: token_standard as TokenType,
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
