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
import Icon from 'app/App.components/Icon/Icon.view'
import { assetDecimalsToShow } from '../Loans.const'

import { ThreeLevelListItem } from '../Loans.style'
import { LendingTabListItem, LoansTabStyled, NoItemsInTabStyled, VaultsList } from './LoansComponents.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData, lendAPY }: LendingTabPropsType) => {
  const { openAddLendingAssetPopup, openRemoveLendingAssetPopup } = useContext(loansPopupsContext)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Lending</h2>
      </GovRightContainerTitleArea>

      {lendingItem ? (
        <VaultsList>
          <LendingTabListItem>
            <ThreeLevelListItem>
              <div className="name">Asset</div>
              <div className="value">
                <ImageWithPlug imageLink={assetData.icon} alt={`${assetData.symbol} icon`} />
                {assetData.symbol}
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lending</div>
              <CommaNumber value={lendingItem.lendValue} decimalsToShow={assetDecimalsToShow} className="value" />
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
              <CommaNumber value={assetData.userBalance} decimalsToShow={assetDecimalsToShow} className="value" />
              {assetData.rate ? (
                <CommaNumber value={assetData.userBalance * assetData.rate} beginningText="$" className="rate" />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">m{assetData.symbol} Balance</div>
              <CommaNumber value={lendingItem.mBalance} decimalsToShow={assetDecimalsToShow} className="value" />
            </ThreeLevelListItem>
            <Button
              text="Add"
              icon="plus"
              kind={TRANSPARENT_WITH_BORDER}
              disabled={!Boolean(accountPkh) || isActionActive}
              onClick={() => {
                openAddLendingAssetPopup({
                  mBalance: lendingItem.mBalance,
                  lendingAPY: lendAPY,
                  ...assetData,
                })
              }}
              className="lending-btn"
            />
            <Button
              text="Remove"
              icon="minus"
              kind={TRANSPARENT_WITH_BORDER}
              disabled={!Boolean(accountPkh) || isActionActive}
              onClick={() => {
                openRemoveLendingAssetPopup({
                  mBalance: lendingItem.mBalance,
                  lendingAPY: lendAPY,
                  currentLendedAmount: lendingItem.lendValue,
                  ...assetData,
                })
              }}
              className="lending-btn"
            />
          </LendingTabListItem>
        </VaultsList>
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
      <div className="factory-info">
        Lending Controller Address <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
      </div>
    </LoansTabStyled>
  )
}
