import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

import { LendingItemType } from 'providers/LoansProvider/loans.provider.types'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { EARN_APY, INTEREST_EARNED, M_TOKEN_BALANCE, SUPPLIED_AMOUNT } from 'texts/tooltips/loan.text'

import { LoansValuesSectionInfo, LoansValuesSection } from './../LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

type Props = {
  lendingItem: LendingItemType
  lendAPY: number
  loanTokenAddress: TokenAddressType
}

export const LendingTabValuesSection = ({ lendingItem, loanTokenAddress, lendAPY }: Props) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userTokensBalances } = useUserContext()

  const loanToken = getTokenDataByAddress({ tokenAddress: loanTokenAddress, tokensPrices, tokensMetadata })

  if (!loanToken || !loanToken.rate) return null

  const { symbol, decimals, rate } = loanToken

  const { lendValue = 0, interestEarned = 0 } = lendingItem || {}

  const tokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: loanToken.address })

  return (
    <LoansValuesSection className="lending-tab">
      <H2Title>Your Earn Position</H2Title>

      <div className="stats">
        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={lendValue} className="value" showDecimal decimalsToShow={decimals} />

          <CommaNumber value={lendValue * rate} beginningText="$" className="rate" showDecimal />

          <div className="name">
            Supplied Amount
            <CustomTooltip iconId="info" text={SUPPLIED_AMOUNT(symbol)} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={interestEarned} className="value" showDecimal decimalsToShow={decimals} />

          <CommaNumber value={interestEarned * rate} beginningText="$" className="rate" showDecimal />

          <div className="name">
            Interest Earned
            <CustomTooltip iconId="info" text={INTEREST_EARNED} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={lendAPY} className="value" endingText="%" showDecimal decimalsToShow={2} />

          <div className="name margin-top">
            Earn APY
            <CustomTooltip iconId="info" text={EARN_APY} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={lendValue} className="value" showDecimal decimalsToShow={decimals} />

          <div className="name margin-top">
            m{symbol} Balance
            <CustomTooltip iconId="info" text={M_TOKEN_BALANCE(symbol)} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={tokenBalance} className="value" showDecimal decimalsToShow={decimals} />
          <CommaNumber value={tokenBalance * rate} beginningText="$" className="rate" showDecimal />

          <div className="name">Wallet Balance</div>
        </LoansValuesSectionInfo>
      </div>

      <LoansValuesSectionInfo className="learn-more">
        <a href="https://mavryk.finance/litepaper#multi-collateral-vaults" target="_blank" rel="noreferrer">
          Learn more at the Mavryk Finance Docs
        </a>
      </LoansValuesSectionInfo>
    </LoansValuesSection>
  )
}
