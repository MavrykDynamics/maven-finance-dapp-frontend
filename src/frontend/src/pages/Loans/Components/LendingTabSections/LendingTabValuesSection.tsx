import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { LoansValuesSectionInfo, LoansValuesSection } from './../LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

import { isTezosAsset } from '../../Loans.helpers'

import { LendingItemType } from 'utils/TypesAndInterfaces/Loans'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { EARN_APY, INTEREST_EARNED, M_TOKEN_BALANCE, SUPPLIED_AMOUNT } from 'texts/tooltips/loan.text'
import { TokenAddress } from 'providers/TokensProvider/tokens.provider.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

type Props = {
  lendingItem: LendingItemType
  lendAPY: number
  loanTokenAddress: TokenAddress
}

export const LendingTabValuesSection = ({ lendingItem, loanTokenAddress, lendAPY }: Props) => {
  const {
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { symbol, decimals } = tokensMetadata[loanTokenAddress]
  const rate = tokensPrices[symbol]

  const { lendValue = 0, interestEarned = 0, mBalance = 0 } = lendingItem || {}

  // TODO: use just symbol, requires user tokens refactor
  const balanceSymbol = isTezosAsset(symbol.toLowerCase() ?? '') ? 'tezos' : symbol.toLowerCase().toLowerCase() ?? ''
  const tokenBalance = userTokens[balanceSymbol]?.balance ?? 0

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
          <CommaNumber value={lendAPY} className="value" showDecimal decimalsToShow={decimals} />

          <div className="name margin-top">
            Earn APY
            <CustomTooltip iconId="info" text={EARN_APY} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={mBalance} className="value" showDecimal decimalsToShow={decimals} />

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
          Learn more at the Mavryk Docs
        </a>
      </LoansValuesSectionInfo>
    </LoansValuesSection>
  )
}
