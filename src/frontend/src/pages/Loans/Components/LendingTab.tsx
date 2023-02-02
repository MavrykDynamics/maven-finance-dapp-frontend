import { useContext } from 'react'

import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { LendingItemType, LoanMarketType } from 'utils/TypesAndInterfaces/Loans'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { loansPopupsContext } from './Modals/LoansModals.provider'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { ThreeLevelListItem } from '../Loans.style'
import { LendingTabListItem, LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { getAssetDisplayName } from '../Loans.helpers'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData, lendAPY }: LendingTabPropsType) => {
  const { openAddLendingAssetPopup, openRemoveLendingAssetPopup } = useContext(loansPopupsContext)

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Lending</h2>
      </GovRightContainerTitleArea>

      {lendingItem ? (
        <div className="list-wrapper">
          <LendingTabListItem>
            <ThreeLevelListItem>
              <div className="name">Asset</div>
              <div className="value">
                {assetData.icon ? (
                  <div className="img-wrapper">
                    <img src={assetData.icon} alt={`${assetData.name} logo`} />
                  </div>
                ) : (
                  <div className="no-icon">
                    <Icon id="noImage" />
                  </div>
                )}
                {getAssetDisplayName(assetData.gqlName)}
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lending</div>
              <CommaNumber value={lendingItem.lendValue} className="value" />
              {assetData.rate ? (
                <CommaNumber value={lendingItem.lendValue * assetData.rate} beginningText="$" className="rate" />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lend APY</div>
              <CommaNumber value={lendAPY} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Interest Earned</div>
              <CommaNumber value={lendingItem.interestEarned} className="value" />
              {assetData.rate ? (
                <CommaNumber value={lendingItem.interestEarned * assetData.rate} beginningText="$" className="rate" />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Wallet Balance</div>
              <CommaNumber value={lendingItem.loanAssetWalletBalance} className="value" />
              {assetData.rate ? (
                <CommaNumber
                  value={lendingItem.loanAssetWalletBalance * assetData.rate}
                  beginningText="$"
                  className="rate"
                />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">m{assetData.symbol} Balance</div>
              <CommaNumber value={lendingItem.mBalance} className="value" />
            </ThreeLevelListItem>
            <Button
              text="Add"
              icon="plus"
              kind={TRANSPARENT_WITH_BORDER}
              onClick={() => {
                openAddLendingAssetPopup({
                  userBalance: lendingItem.loanAssetWalletBalance,
                  mBalance: lendingItem.mBalance,
                  lendingAPY: lendAPY,
                  assetRate: assetData.rate,
                  decimals: assetData.decimals,
                  originalName: assetData.gqlName,
                  assetName: assetData.symbol,
                  assetIcon: assetData.icon,
                  tokenType: assetData.tokenType,
                  assetId: assetData.id,
                  assetAddress: assetData.address,
                })
              }}
              className="lending-btn"
            />
            <Button
              text="Remove"
              icon="minus"
              kind={TRANSPARENT_WITH_BORDER}
              onClick={() => {
                openRemoveLendingAssetPopup({
                  userBalance: lendingItem.loanAssetWalletBalance,
                  mBalance: lendingItem.mBalance,
                  lendingAPY: lendAPY,
                  assetRate: assetData.rate,
                  decimals: assetData.decimals,
                  originalName: assetData.gqlName,
                  assetName: assetData.symbol,
                  assetIcon: assetData.icon,
                  currentLendedAmount: lendingItem.lendValue,
                  tokenType: assetData.tokenType,
                  assetId: assetData.id,
                  assetAddress: assetData.address,
                })
              }}
              className="lending-btn"
            />
          </LendingTabListItem>
        </div>
      ) : (
        <NoItemsInTabStyled>
          <span>Lend assets to earn interest.</span>
          <Button
            text="Lend Asset"
            icon="plus"
            kind={ACTION_PRIMARY}
            onClick={() =>
              openAddLendingAssetPopup({
                userBalance: assetData.userBalance,
                mBalance: 0,
                lendingAPY: 0,
                decimals: assetData.decimals,
                assetRate: assetData.rate,
                originalName: assetData.gqlName,
                assetName: assetData.symbol,
                assetIcon: assetData.icon,
                tokenType: assetData.tokenType,
                assetId: assetData.id,
                assetAddress: assetData.address,
              })
            }
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
      <div className="factory-info">
        Lending Controller Address <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
      </div>
    </LoansTabStyled>
  )
}
