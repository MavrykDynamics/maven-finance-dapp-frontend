import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { LoansValuesSectionInfo, LoansValuesSection } from './../LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

import { assetDecimalsToShow } from '../../Loans.const'
import { isTezosAsset } from '../../Loans.helpers'

import { LendingItemType, LoanMarketType } from 'utils/TypesAndInterfaces/Loans'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { EARN_APY, INTEREST_EARNED, M_TOKEN_BALANCE, SUPPLIED_AMOUNT } from 'texts/tooltips/loan.text'

type Props = {
  lendingItem: LendingItemType
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTabValuesSection = ({ lendingItem, assetData, lendAPY }: Props) => {
  const {
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)

  const { lendValue = 0, interestEarned = 0, mBalance = 0 } = lendingItem || {}

  const balanceSymbol = isTezosAsset(assetData.symbol.toLowerCase() ?? '')
    ? 'tezos'
    : assetData.symbol.toLowerCase().toLowerCase() ?? ''

  const tokenBalance = userTokens[balanceSymbol]?.balance ?? 0

  return (
    <LoansValuesSection className="lending-tab">
      <H2Title>Your Earn Position</H2Title>

      <div className="stats">
        <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
          <CommaNumber value={lendValue} className="value" showDecimal decimalsToShow={assetDecimalsToShow} />

          <CommaNumber value={lendValue * assetData.rate} beginningText="$" className="rate" showDecimal />

          <div className="name">
            Supplied Amount
            <CustomTooltip iconId="info" text={SUPPLIED_AMOUNT(assetData.symbol)} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
          <CommaNumber value={interestEarned} className="value" showDecimal />

          <CommaNumber value={interestEarned * assetData.rate} beginningText="$" className="rate" showDecimal />

          <div className="name">
            Interest Earned
            <CustomTooltip iconId="info" text={INTEREST_EARNED} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={lendAPY} className="value" showDecimal />

          <div className="name margin-top">
            Earn APY
            <CustomTooltip iconId="info" text={EARN_APY} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={mBalance} className="value" showDecimal decimalsToShow={assetDecimalsToShow} />

          <div className="name margin-top">
            m{assetData.symbol} Balance
            <CustomTooltip iconId="info" text={M_TOKEN_BALANCE(assetData.symbol)} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
          <CommaNumber value={tokenBalance} className="value" showDecimal decimalsToShow={assetDecimalsToShow} />
          <CommaNumber value={tokenBalance * assetData.rate} beginningText="$" className="rate" showDecimal />

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
