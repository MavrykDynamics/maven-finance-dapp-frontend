import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

import { LendingItemType } from 'providers/LoansProvider/loans.provider.types'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

import { EARN_APY, INTEREST_EARNED, M_TOKEN_BALANCE, SUPPLIED_AMOUNT } from 'texts/tooltips/loan.text'

import { LoansValuesSection, LoansValuesSectionInfo } from './../LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import Icon from 'app/App.components/Icon/Icon.view'

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
            <Tooltip>
              <Tooltip.Trigger className="ml-5">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{SUPPLIED_AMOUNT(symbol)}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={interestEarned} className="value" showDecimal decimalsToShow={decimals} />

          <CommaNumber value={interestEarned * rate} beginningText="$" className="rate" showDecimal />

          <div className="name">
            Interest Earned
            <Tooltip>
              <Tooltip.Trigger className="ml-5">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{INTEREST_EARNED}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={lendAPY} className="value" endingText="%" showDecimal decimalsToShow={2} />

          <div className="name margin-top">
            Earn APY
            <Tooltip>
              <Tooltip.Trigger className="ml-5">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{EARN_APY}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={lendValue} className="value" showDecimal decimalsToShow={decimals} />

          <div className="name margin-top">
            m{symbol} Balance
            <Tooltip>
              <Tooltip.Trigger className="ml-5">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{M_TOKEN_BALANCE(symbol)}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={tokenBalance} className="value" showDecimal decimalsToShow={decimals} />
          <CommaNumber value={tokenBalance * rate} beginningText="$" className="rate" showDecimal />

          <div className="name">Wallet Balance</div>
        </LoansValuesSectionInfo>
      </div>

      <LoansValuesSectionInfo className="learn-more">
        <a
          href="https://docs.mavryk.finance/mavryk-finance/earn-and-borrow/multi-collateral-vaults"
          target="_blank"
          rel="noreferrer"
        >
          Learn more at the Maven Finance Docs
        </a>
      </LoansValuesSectionInfo>
    </LoansValuesSection>
  )
}
