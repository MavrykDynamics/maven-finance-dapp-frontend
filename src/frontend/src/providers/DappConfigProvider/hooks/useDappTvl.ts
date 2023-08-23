import { TokensContext } from './../../TokensProvider/tokens.provider.types'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useDappConfigContext } from '../dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { GET_DAPP_TVL } from '../queries/dappTvl.query'
import { useEffect, useState } from 'react'
import { DashboardTvlQuery } from 'utils/__generated__/graphql'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'

export const useDappTvl = () => {
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    setDappTotalValueLocked,
    dappTotalValueLocked,
    contractAddresses: { doormanAddress },
  } = useDappConfigContext()

  const [indexerData, setIndexerData] = useState<null | DashboardTvlQuery>(null)

  useQueryWithRefetch(
    GET_DAPP_TVL,
    {
      skip: !doormanAddress,
      variables: {
        doormanContractAddress: doormanAddress ?? '',
      },
      onCompleted: (data) => {
        setIndexerData(data)
      },
      onError: (e) => {
        console.error(`DappConfigProvider query error: `, e)
        bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
      },
    },
    {
      blocksDiff: 2000,
    },
  )

  useEffect(() => {
    if (!indexerData) return
    setDappTotalValueLocked(reduceTvlValue({ indexerData, tokensMetadata, tokensPrices }))
  }, [indexerData])

  return { isLoading: dappTotalValueLocked === null, dappTotalValueLocked: dappTotalValueLocked ?? 0 }
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
  const smvkToken = getTokenDataByAddress({ tokenAddress: SMVK_TOKEN_ADDRESS, tokensMetadata, tokensPrices })
  const doormanTVL =
    doormanAccount && smvkToken && smvkToken.rate
      ? convertNumberForClient({ number: doormanAccount.mvk_balance, grade: smvkToken.decimals }) * smvkToken.rate
      : 0

  // calculating vaults tvl
  const vaultsTvl = lendingControllerData?.vaultsLvl
    ? lendingControllerData?.vaultsLvl.reduce((acc, { balances_aggregate, token: { token_address } }) => {
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
      }, 0)
    : 0

  // calculating markets tvl
  const marketsTvl = lendingControllerData?.marketsTvl
    ? lendingControllerData?.marketsTvl.reduce((acc, { total_borrowed, total_remaining, token: { token_address } }) => {
        const marketToken = getTokenDataByAddress({
          tokenAddress: token_address,
          tokensMetadata,
          tokensPrices,
        })

        if (marketToken && marketToken.rate) {
          acc +=
            (convertNumberForClient({ number: Number(total_remaining), grade: marketToken.decimals }) +
              convertNumberForClient({ number: Number(total_borrowed), grade: marketToken.decimals })) *
            marketToken.rate
        }

        return acc
      }, 0)
    : 0

  // calculating treasury tvl
  const treasuryTvl = indexerTreasuryTvl
    ? indexerTreasuryTvl.reduce((acc, { balance, token: { token_address } }) => {
        const treasuryToken = getTokenDataByAddress({
          tokenAddress: token_address,
          tokensMetadata,
          tokensPrices,
        })

        if (treasuryToken && treasuryToken.rate) {
          acc += convertNumberForClient({ number: Number(balance), grade: treasuryToken.decimals }) * treasuryToken.rate
        }

        return acc
      }, 0)
    : 0

  // TODO: check this calculation with sam
  const farmsTVL = 0
  // farms.reduce((acc, farm) => {
  //   return (acc += farm.lpBalance)
  // }, 0)

  return doormanTVL + vaultsTvl + marketsTvl + treasuryTvl + farmsTVL
}
