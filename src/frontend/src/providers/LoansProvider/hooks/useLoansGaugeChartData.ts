import { useCallback, useEffect, useMemo, useState } from 'react'

// hooks
import { useLoansContext } from '../loans.provider'
import { UserLoansData } from 'providers/UserProvider/user.provider.types'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getNumberInBounds } from 'utils/calcFunctions'
import { getGaugeVaultRiskSimpleStatus } from 'pages/LoansDashboard/helpers/position.helpers'

type Props = {
  userVaultsData: UserLoansData['userVaultsData']
}

type GaugeChartStateType = {
  maxValue: number
  minValue: number
  currentValue: number
  text: string
  isAPY: boolean
  status: string | null
}

const GAUGE_STATE_RISK_PART = {
  maxValue: 100,
  minValue: 0,
  isAPY: false,
}

const GAUGE_STATE_APY_PART = {
  maxValue: 100,
  minValue: 0,
  isAPY: true,
  text: 'Net APY',
  status: null,
}

/**
 * @param userVaultsData -> vaults data from userLoansData
 * @returns data for gauge, and setter of loans and APY data
 *
 * NOTE: using this hook requires usage useUserLoansData & subscribing to all markets data (changeLoansSubscriptionsList => [LOANS_MARKETS_DATA]: true)
 */
export const useLoansGaugeChartData = ({ userVaultsData }: Props) => {
  const { userMTokens, userAddress } = useUserContext()
  const { marketsAddresses, marketsMapper } = useLoansContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()

  // Default data for gauge chart will be for vault risk
  const [gaugeData, setGaugeData] = useState<GaugeChartStateType>({
    ...GAUGE_STATE_APY_PART,
    currentValue: 0,
    text: '',
    status: null,
  })

  const { vaultRiskGaugeData, apyGaugeData } = useMemo((): {
    vaultRiskGaugeData: GaugeChartStateType
    apyGaugeData: GaugeChartStateType
  } => {
    const { borrowedAmount, collateralAmount, totalSuppliedValue, sumOfRatioSuppliedToAPY, sumOfRatioBorrowedToAPR } =
      marketsAddresses.reduce(
        (acc, marketTokenAddress) => {
          const market = marketsMapper[marketTokenAddress]

          const token = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata, tokensPrices })

          if (!token || !token.rate || !market) return acc
          const { borrowAPR, lendingAPY, loanMTokenAddress, loanTokenAddress } = market

          const userMarketVaultsData = userVaultsData[loanTokenAddress]
          if (!userMarketVaultsData) return acc

          const { lendValue } = userMTokens[loanMTokenAddress] ?? { lendValue: 0 }

          const { rate } = token
          const { principle, collateralBalance } = userMarketVaultsData

          //  calculating value risk data & how much borrowed per vault
          acc.collateralAmount += principle > 0 ? collateralBalance : 0
          acc.borrowedAmount += principle

          // calculating net APY supplied & borrowed ratio's
          acc.sumOfRatioSuppliedToAPY += lendValue * rate * lendingAPY
          // TODO: check this calc
          acc.sumOfRatioBorrowedToAPR += principle * borrowAPR
          acc.totalSuppliedValue += lendValue * rate
          return acc
        },
        {
          borrowedAmount: 0,
          collateralAmount: 0,
          totalSuppliedValue: 0,
          sumOfRatioSuppliedToAPY: 0,
          sumOfRatioBorrowedToAPR: 0,
        },
      )

    const vaultRiskValue = !userAddress || !collateralAmount ? 0 : (borrowedAmount / collateralAmount) * 100
    const apyNet =
      !userAddress || !totalSuppliedValue ? 0 : (sumOfRatioSuppliedToAPY - sumOfRatioBorrowedToAPR) / totalSuppliedValue

    return {
      vaultRiskGaugeData: {
        ...GAUGE_STATE_RISK_PART,
        currentValue: getNumberInBounds(0, 100, vaultRiskValue),
        ...getGaugeVaultRiskSimpleStatus(vaultRiskValue),
      },
      apyGaugeData: {
        ...GAUGE_STATE_APY_PART,
        currentValue: getNumberInBounds(0, 100, apyNet),
      },
    }
  }, [marketsAddresses, userAddress, marketsMapper, tokensMetadata, tokensPrices, userMTokens, userVaultsData])

  // Set gauge chart data for vault risk
  useEffect(() => {
    if (gaugeData.isAPY) {
      setGaugeData(apyGaugeData)
    }
  }, [apyGaugeData])

  const setVaultsData = useCallback(() => setGaugeData(vaultRiskGaugeData), [vaultRiskGaugeData])
  const setApyData = useCallback(() => setGaugeData(apyGaugeData), [apyGaugeData])

  return {
    gaugeData,
    setVaultsData,
    setApyData,
  }
}
