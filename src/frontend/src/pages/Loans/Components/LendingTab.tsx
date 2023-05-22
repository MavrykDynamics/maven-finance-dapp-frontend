import { useSelector } from 'react-redux'
import { useContext } from 'react'

import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { LendingItemType, LoanMarketType } from 'utils/TypesAndInterfaces/Loans'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { State } from 'reducers'
import { loansPopupsContext } from './Modals/LoansModals.provider'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { assetDecimalsToShow } from '../Loans.const'

import { ThreeLevelListItem } from '../Loans.style'
import {
  LoansValuesSectionInfo,
  LoansValuesSection,
  LendingTabStyled,
  NoItemsInTabStyled,
  VaultsList,
} from './LoansComponents.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { isTezosAsset } from '../Loans.helpers'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData, lendAPY }: LendingTabPropsType) => {
  const { openAddLendingAssetPopup, openRemoveLendingAssetPopup } = useContext(loansPopupsContext)
  const {
    accountPkh,
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const balanceSymbol = isTezosAsset(assetData.symbol.toLowerCase() ?? '')
    ? 'tezos'
    : assetData.symbol.toLowerCase().toLowerCase() ?? ''
  const tokenBalance = userTokens[balanceSymbol]?.balance ?? 0

  return (
    <LendingTabStyled>
      {lendingItem ? (
        <div className="main">
          <LoansValuesSection className="secondary-background">
            <H2Title>Your Supplied XTZ Position</H2Title>

            <div className="stats">
              <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
                <CommaNumber
                  value={lendingItem.lendValue}
                  className="value"
                  showDecimal
                  decimalsToShow={assetDecimalsToShow}
                />

                <CommaNumber
                  value={lendingItem.lendValue * assetData.rate}
                  beginningText="$"
                  className="rate"
                  showDecimal
                />

                <div className="name">
                  Supplied Amount
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
                <CommaNumber value={lendingItem.interestEarned} className="value" showDecimal />

                <CommaNumber
                  value={lendingItem.interestEarned * assetData.rate}
                  beginningText="$"
                  className="rate"
                  showDecimal
                />

                <div className="name">
                  Interest Earned
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo>
                <CommaNumber value={lendAPY} className="value" showDecimal />

                <div className="name margin-top">
                  Earn APY
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo>
                <CommaNumber
                  value={lendingItem.mBalance}
                  className="value"
                  showDecimal
                  decimalsToShow={assetDecimalsToShow}
                />

                <div className="name margin-top">
                  m{assetData.symbol} Balance
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
                <CommaNumber value={tokenBalance} className="value" showDecimal decimalsToShow={assetDecimalsToShow} />
                <CommaNumber value={tokenBalance * assetData.rate} beginningText="$" className="rate" showDecimal />

                <div className="name">
                  Wallet Balance
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>
            </div>

            <LoansValuesSectionInfo className="learn-more">
              <a href="https://mavryk.finance/litepaper#multi-collateral-vaults" target="_blank" rel="noreferrer">
                Learn more at the Mavryk Docs
              </a>
            </LoansValuesSectionInfo>
          </LoansValuesSection>
        </div>
      ) : (
        <NoItemsInTabStyled>
          <span>Lend assets to earn interest.</span>
          <Button
            text="Lend Asset"
            icon="plus"
            kind={ACTION_PRIMARY}
            disabled={!Boolean(accountPkh) || isActionActive}
            onClick={() =>
              openAddLendingAssetPopup({
                mBalance: 0,
                lendingAPY: lendAPY,
                ...assetData,
              })
            }
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
    </LendingTabStyled>
  )
}
