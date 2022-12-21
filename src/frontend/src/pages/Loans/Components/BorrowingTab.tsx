import { ACTION_PRIMARY, TRANSPARENT } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Expand from 'app/App.components/Expand/Expand.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FillBlock, ThreeLevelListItem } from '../Loans.style'
import { BorrowingTabListItemExpanded, LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

type BorrowingTabPropsType = {
  borrowingItems: Array<any>
}

export const BorrowingTab = ({ borrowingItems }: BorrowingTabPropsType) => {
  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Boorrowing</h2>
      </GovRightContainerTitleArea>

      {borrowingItems.length || true ? (
        <>
          <Button
            text="New Vault"
            icon="plus"
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <div className="list-wrapper">
            <Expand
              className="expand-borrow-tab"
              header={
                <>
                  <ThreeLevelListItem>
                    <div className="name">Borrowed Asset</div>
                    <div className="value">
                      <Icon id="xtzTezos" />
                      XTZ
                    </div>
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Amt Borrowed</div>
                    <CommaNumber value={12414.2423} className="value" showLetter />
                    <CommaNumber value={12414.2423} beginningText="$" className="rate" showLetter />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Collateral Balance</div>
                    <CommaNumber value={22.2} className="value" endingText="%" />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
                    <FillBlock width={75}>
                      <div className="colored"></div>
                    </FillBlock>
                    <div className="info-tip">
                      Collateral Utilization:
                      <span>
                        <CommaNumber value={22.5} endingText="%" />
                      </span>
                    </div>
                  </ThreeLevelListItem>
                </>
              }
            >
              <BorrowingTabListItemExpanded>
                <div className="block-name">Borrowed</div>
                <div className="list borrow">
                  <div className="list-item borrow">
                    <ThreeLevelListItem>
                      <div className="name">Borrowed Asset</div>
                      <div className="value">
                        <Icon id="xtzTezos" />
                        XTZ
                      </div>
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Amt Borrowed</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={2343322.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Borrowing Fee</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={234322.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Borrow APY</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                    </ThreeLevelListItem>

                    <Button text="Borrow" kind={TRANSPARENT} className="go-back-btn loans" />
                  </div>
                </div>

                <div className="block-name">Collateral In Vault</div>
                <div className="list collateral">
                  <div className="list-item collateral">
                    <ThreeLevelListItem>
                      <div className="name">Vault Asset</div>
                      <div className="value">
                        <Icon id="xtzTezos" />
                        XTZ
                      </div>
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Vault Balance</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={2322.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Withdraw Max</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={23422.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Other Data</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={222.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>

                    <Button text="Add" icon="plus" kind={TRANSPARENT} className="go-back-btn loans" />
                    <Button text="Remove" icon="minus" kind={TRANSPARENT} className="go-back-btn loans" />
                  </div>
                  <div className="list-item collateral">
                    <ThreeLevelListItem>
                      <div className="name">Vault Asset</div>
                      <div className="value">
                        <Icon id="xtzTezos" />
                        XTZ
                      </div>
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Vault Balance</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={2322.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Withdraw Max</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={23422.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Other Data</div>
                      <CommaNumber value={22.2} className="value" endingText="%" />
                      <CommaNumber value={222.2} className="rate" beginningText="$" showLetter />
                    </ThreeLevelListItem>

                    <Button text="Add" icon="plus" kind={TRANSPARENT} className="go-back-btn loans" />
                    <Button text="Remove" icon="minus" kind={TRANSPARENT} className="go-back-btn loans" />
                  </div>
                </div>
              </BorrowingTabListItemExpanded>
            </Expand>
          </div>
        </>
      ) : (
        <NoItemsInTabStyled>
          <span>To borrow, you must first create a vault and add collateral.</span>
          <Button text="New Vault" icon="plus" kind={ACTION_PRIMARY} className="lending-tab-no-items-btn" />
        </NoItemsInTabStyled>
      )}
    </LoansTabStyled>
  )
}
