import { useEffect, useState } from 'react'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from '../dappConfig.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { getAssetColor } from 'providers/TreasuryProvider/helpers/treasury.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// types
import { TokensContext } from './../../TokensProvider/tokens.provider.types'
import { VaultsDashboardDataType } from 'providers/VaultsProvider/vaults.provider.types'
import { DashboardTvlQuery } from 'utils/__generated__/graphql'

// consts
import { GET_DAPP_TVL } from '../queries/dappTvl.query'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'

export const useDappTvl = () => {
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { setVaultsDashboardData, vaultsDashboardData } = useVaultsContext()
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

    const { tvlValue, reducedVaultsCollaterals, totalCollateralRatio, averageCollateralRatio, vaultTvl } =
      reduceTvlValue({
        indexerData,
        tokensMetadata,
        tokensPrices,
      })

    console.log({ reducedVaultsCollaterals })

    setDappTotalValueLocked(tvlValue)
    setVaultsDashboardData({ reducedVaultsCollaterals, totalCollateralRatio, averageCollateralRatio, vaultTvl })
  }, [indexerData, tokensMetadata, tokensPrices])

  console.log({ vaultsDashboardData })

  return {
    isTvlValueLoading: dappTotalValueLocked === null,
    isVaultsDashboardDataLoading: vaultsDashboardData === null,
    vaultsDashboardData: vaultsDashboardData ?? {
      reducedVaultsCollaterals: [],
      totalCollateralRatio: 0,
      averageCollateralRatio: 0,
      vaultTvl: 0,
    },
    dappTotalValueLocked: dappTotalValueLocked ?? 0,
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
  const smvkToken = getTokenDataByAddress({ tokenAddress: SMVK_TOKEN_ADDRESS, tokensMetadata, tokensPrices })
  const doormanTVL =
    doormanAccount && smvkToken && smvkToken.rate
      ? convertNumberForClient({ number: doormanAccount.mvk_balance, grade: smvkToken.decimals }) * smvkToken.rate
      : 0

  // calculating vaults tvl
  const { vaultTvl, reducedVaultsCollaterals } = lendingControllerData.vaultsLvl.reduce<{
    vaultTvl: number
    reducedVaultsCollaterals: VaultsDashboardDataType['reducedVaultsCollaterals']
  }>(
    (acc, { balances_aggregate, token: { token_address } }, collateralIdx) => {
      const collateralToken = getTokenDataByAddress({
        tokenAddress: token_address,
        tokensMetadata,
        tokensPrices,
      })

      if (collateralToken && collateralToken.rate) {
        const collateralBalance = convertNumberForClient({
          number: Number(balances_aggregate.aggregate?.sum?.balance),
          grade: collateralToken.decimals,
        })
        acc.vaultTvl += collateralBalance * collateralToken.rate

        acc.reducedVaultsCollaterals.push({
          balance: Number(balances_aggregate.aggregate?.sum?.balance),
          tokenAddress: token_address,
          chartColor: getAssetColor(collateralIdx),
        })
      }

      return acc
    },
    {
      vaultTvl: 0,
      reducedVaultsCollaterals: [],
    },
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
          (convertNumberForClient({ number: Number(total_remaining), grade: marketToken.decimals }) +
            convertNumberForClient({ number: Number(total_borrowed), grade: marketToken.decimals })) *
          marketToken.rate
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
          acc += convertNumberForClient({ number: Number(balance), grade: treasuryToken.decimals }) * treasuryToken.rate
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
    reducedVaultsCollaterals,
    totalCollateralRatio: 0,
    averageCollateralRatio: 0,
    vaultTvl,
  }
}
