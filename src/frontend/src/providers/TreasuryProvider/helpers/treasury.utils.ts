import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import { TreasuryBalanceType, TreasuryData } from './treasury.types'
import {
  NullableTreasuryContextStateType,
  TreasuryContext,
  TreasuryContextStateType,
  TreasurySubsRecordType,
} from '../treasury.provider.types'
import { EMPTY_TREASURY_CTX, TREASURY_STORAGE_DATA_SUB } from './treasury.consts'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

/**
 * @param treasuryAddresses array of treasuries addresses
 * @param treasuryData Reacord of treasury data objects where key is address from "treasuryAddresses" array
 * @returns object that represent token address and amount of that token in all treasuries, AMOUNT is not converted
 */
export const reduceTreasuryAssets = (
  treasuryAddresses: TreasuryContextStateType['treasuryAddresses'],
  treasuryData: TreasuryContextStateType['treasuryMapper'],
) => {
  return treasuryAddresses.reduce<Record<string, TreasuryBalanceType>>((acc, address) => {
    const { balances } = treasuryData[address]
    balances.forEach((balanceAsset) => {
      if (acc[balanceAsset.tokenAddress]) {
        acc[balanceAsset.tokenAddress].balance += balanceAsset.balance
      } else {
        acc[balanceAsset.tokenAddress] = { ...balanceAsset }
      }
    })

    return acc
  }, {})
}

/**
 *
 * @param treasury treasury obj
 * @param tokensMetadata mapper of tokens metadata
 * @param tokensPrices mapper of token prices
 * @returns sum of all tokens in $ for all passed treasury, SUM is converted to USD
 */
export const getTreasuryTVL = (
  treasury: TreasuryData,
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) =>
  treasury.balances.reduce((treasuryTVLacc, { balance, tokenAddress }) => {
    const treasuryToken = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
    if (!treasuryToken || !treasuryToken.rate) return treasuryTVLacc

    const { decimals, rate } = treasuryToken
    return (treasuryTVLacc += convertNumberForClient({ number: balance, grade: decimals }) * rate)
  }, 0)

//
type TreasuryContextReturnValueArgs = {
  treasuryCtxState: NullableTreasuryContextStateType
  changeTreasurySubscriptionsList: TreasuryContext['changeTreasurySubscriptionsList']
  activeSubs: TreasurySubsRecordType
}

export const getTreasuryProviderReturnValue = ({
  treasuryCtxState,
  changeTreasurySubscriptionsList,
  activeSubs,
}: TreasuryContextReturnValueArgs) => {
  const { treasuryAddresses, treasuryMapper } = treasuryCtxState

  const commonToReturn = {
    changeTreasurySubscriptionsList,
  }

  const isTreasuryDataEmpty = treasuryAddresses === null || treasuryMapper === null

  const isLoading =
    (activeSubs[TREASURY_STORAGE_DATA_SUB] && isTreasuryDataEmpty) ||
    (!activeSubs[TREASURY_STORAGE_DATA_SUB] && isTreasuryDataEmpty)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_TREASURY_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<TreasuryContextStateType>(
    treasuryCtxState,
    EMPTY_TREASURY_CTX,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
