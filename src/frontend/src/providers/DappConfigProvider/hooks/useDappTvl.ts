import { useEffect, useState } from 'react'

// hooks
import { useDappConfigContext } from '../dappConfig.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// types
import { TokensContext } from './../../TokensProvider/tokens.provider.types'
import { DashboardTvlQuery } from 'utils/__generated__/graphql'

// consts
import { GET_DAPP_TVL } from '../queries/dappTvl.query'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'

export const useDappTvl = () => {
  const { handleQueryError } = useQueryProvider()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    setDappTotalValueLocked,
    dappTotalValueLocked,
    contractAddresses: { doormanAddress },
  } = useDappConfigContext()

  const [indexerData, setIndexerData] = useState<null | DashboardTvlQuery>(null)

  useGraphQLQuery(
    GET_DAPP_TVL,
    {
      skip: !doormanAddress,
      variables: {
        doormanContractAddress: doormanAddress ?? '',
      },
      onCompleted: (data) => setIndexerData(data),
      onError: (error) => handleQueryError(error, 'GET_DAPP_TVL'),
    },
  )

  useEffect(() => {
    if (!indexerData) return

    const { tvlValue } = reduceTvlValue({
      indexerData,
      tokensMetadata,
      tokensPrices,
    })

    setDappTotalValueLocked(tvlValue)
  }, [indexerData, tokensMetadata, tokensPrices])

  return {
    isLoading: dappTotalValueLocked === null,
    DAPP_TVL: dappTotalValueLocked ?? 0,
  }
}

const reduceTvlValue = ({
  indexerData,
  tokensMetadata,
  tokensPrices,
}: {
  indexerData: DashboardTvlQuery
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices: TokensContext['tokensPrices']
}) => {
  const {
    doormanTVL: [doormanAccount],
    lending_controller: [lendingControllerData],
    treasuryTvl: indexerTreasuryTvl,
  } = indexerData

  // calculating doorman tvl
  const smvnToken = getTokenDataByAddress({ tokenAddress: SMVN_TOKEN_ADDRESS, tokensMetadata, tokensPrices })
  const doormanTVL =
    doormanAccount && smvnToken && smvnToken.rate
      ? convertNumberForClient({ number: doormanAccount.mvn_balance, grade: smvnToken.decimals }) * smvnToken.rate
      : 0

  // calculating vaults tvl
  const vaultTvl = lendingControllerData.vaultsLvl.reduce(
    (acc, { balances_aggregate, token: { token_address } }, collateralIdx) => {
      const collateralToken = getTokenDataByAddress({
        tokenAddress: token_address,
        tokensMetadata,
        tokensPrices,
      })

      if (collateralToken && collateralToken.rate) {
        acc +=
          convertNumberForClient({
            number: Number(balances_aggregate.aggregate?.sum?.balance),
            grade: collateralToken.decimals,
          }) * collateralToken.rate
      }

      return acc
    },
    0,
  )

  // calculating markets tvl
  const marketsTvl = lendingControllerData?.marketsTvl.reduce(
    (acc, { total_borrowed, total_remaining, token: { token_address } }) => {
      const marketToken = getTokenDataByAddress({
        tokenAddress: token_address,
        tokensMetadata,
        tokensPrices,
      })

      if (marketToken && marketToken.rate) {
        acc +=
          convertNumberForClient({
            number: Number(total_borrowed) + Number(total_remaining),
            grade: marketToken.decimals,
          }) * marketToken.rate
      }

      return acc
    },
    0,
  )

  // calculating treasury tvl
  const treasuryTvl = indexerTreasuryTvl
    ? indexerTreasuryTvl.reduce((acc, { balance, token: { token_address } }) => {
        const treasuryToken = getTokenDataByAddress({
          tokenAddress: token_address,
          tokensMetadata,
          tokensPrices,
        })

        if (treasuryToken && treasuryToken.rate) {
          acc +=
            convertNumberForClient({
              number: Number(balance),
              grade: treasuryToken.decimals,
            }) * treasuryToken.rate
        }

        return acc
      }, 0)
    : 0

  // TODO: implement, when farms are up
  const farmsTVL = 0
  // farms.reduce((acc, farm) => {
  //   return (acc += farm.lpBalance)
  // }, 0)

  return {
    tvlValue: doormanTVL + vaultTvl + marketsTvl + treasuryTvl + farmsTVL,
  }
}
