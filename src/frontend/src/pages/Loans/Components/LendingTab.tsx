import { useDispatch } from 'react-redux'

import { ACTION_PRIMARY, TRANSPARENT, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { toggleLoansModal } from '../Loans.actions'
import { ADD_COLLATERAL_MODAL_ID, REMOVE_COLLATERAL_MODAL_ID } from '../Loans.const'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { ThreeLevelListItem } from '../Loans.style'
import { LendingTabListItem, LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LendingItemType } from 'utils/TypesAndInterfaces/Loans'

type LendingTabPropsType = {
  lendingItem: LendingItemType
}

export const LendingTab = ({ lendingItem }: LendingTabPropsType) => {
  const dispatch = useDispatch()

  const addLendHandler = () => {
    dispatch(toggleLoansModal(ADD_COLLATERAL_MODAL_ID))
  }
  const removeLendHandler = () => {
    dispatch(toggleLoansModal(REMOVE_COLLATERAL_MODAL_ID))
  }
  const lendAssetHandler = () => {
    dispatch(toggleLoansModal(REMOVE_COLLATERAL_MODAL_ID))
  }

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
                {lendingItem.assetIcon ? (
                  <div className="img-wrapper">
                    <img src={lendingItem.assetIcon} alt={`${lendingItem.assetName} logo`} />
                  </div>
                ) : (
                  <Icon id="noIcon" />
                )}
                {lendingItem.assetName}
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lending</div>
              <CommaNumber value={lendingItem.lendValue} className="value" showLetter />
              <CommaNumber
                value={lendingItem.lendValue * lendingItem.lendAssetRate}
                beginningText="$"
                className="rate"
                showLetter
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lend APY</div>
              <CommaNumber value={lendingItem.lendAPY} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Interest Earned</div>
              <CommaNumber value={lendingItem.interestEarned} className="value" showLetter />
              <CommaNumber
                value={lendingItem.interestEarned * lendingItem.lendAssetRate}
                beginningText="$"
                className="rate"
                showLetter
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Wallet Balance</div>
              <CommaNumber value={lendingItem.loanAssetWalletBalance} className="value" showLetter />
              <CommaNumber
                value={lendingItem.loanAssetWalletBalance * lendingItem.lendAssetRate}
                beginningText="$"
                className="rate"
                showLetter
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">mXTZ Balance</div>
              <CommaNumber value={lendingItem.mXTZBalance} className="value" showLetter />
            </ThreeLevelListItem>
            <Button
              text="Add"
              icon="plus"
              kind={TRANSPARENT_WITH_BORDER}
              onClick={addLendHandler}
              className="lending-btn"
            />
            <Button
              text="Remove"
              icon="minus"
              kind={TRANSPARENT_WITH_BORDER}
              onClick={removeLendHandler}
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
            onClick={lendAssetHandler}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
    </LoansTabStyled>
  )
}
