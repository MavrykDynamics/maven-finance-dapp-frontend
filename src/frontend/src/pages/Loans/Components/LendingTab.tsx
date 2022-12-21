import { ACTION_PRIMARY, TRANSPARENT } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from '../Loans.style'
import { LendingTabListItem, LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

type LendingTabPropsType = {
  lendingItems: Array<any>
}

export const LendingTab = ({ lendingItems }: LendingTabPropsType) => {
  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Lending</h2>
      </GovRightContainerTitleArea>

      {lendingItems.length || true ? (
        <div className="list-wrapper">
          <LendingTabListItem>
            <ThreeLevelListItem>
              <div className="name">Asset</div>
              <div className="value">
                <Icon id="xtzTezos" />
                XTZ
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lending</div>
              <CommaNumber value={12414.2423} className="value" showLetter />
              <CommaNumber value={12414.2423} beginningText="$" className="rate" showLetter />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lend APY</div>
              <CommaNumber value={22.2} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Interest Earned</div>
              <CommaNumber value={12414.2423} className="value" showLetter />
              <CommaNumber value={12414.2423} beginningText="$" className="rate" showLetter />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Wallet Balance</div>
              <CommaNumber value={1241334.2423} className="value" showLetter />
              <CommaNumber value={12414.2423} beginningText="$" className="rate" showLetter />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">mXTZ Balance</div>
              <CommaNumber value={12414.2423} className="value" showLetter />
            </ThreeLevelListItem>
            <Button text="Add" icon="plus" kind={TRANSPARENT} className="go-back-btn" />
            <Button text="Remove" icon="minus" kind={TRANSPARENT} className="go-back-btn" />
          </LendingTabListItem>
        </div>
      ) : (
        <NoItemsInTabStyled>
          <span>Lend assets to earn interest.</span>
          <Button text="Lend Asset" icon="plus" kind={ACTION_PRIMARY} className="lending-tab-no-items-btn" />
        </NoItemsInTabStyled>
      )}
    </LoansTabStyled>
  )
}
