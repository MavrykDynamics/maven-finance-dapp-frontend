import { ACTION_PRIMARY, TRANSPARENT } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Expand from 'app/App.components/Expand/Expand.view'
import Icon from 'app/App.components/Icon/Icon.view'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from 'app/App.components/Table/Table.style'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { BORROWIND_MOCK, COLLATERAL_MOCK } from '../Loans.const'
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
                {BORROWIND_MOCK ? (
                  <>
                    <div className="block-name">Borrowed</div>
                    <Table className="borrowing-table">
                      <TableHeader>
                        <TableRow className="simple-header">
                          <TableHeaderCell>Borrowed Asset</TableHeaderCell>
                          <TableHeaderCell>Amt Borrowed</TableHeaderCell>
                          <TableHeaderCell>Borrowing Fee</TableHeaderCell>
                          <TableHeaderCell>Borrow APY</TableHeaderCell>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {BORROWIND_MOCK.map(() => {
                          return (
                            <TableRow rowHeight={70}>
                              <TableCell width={`15%`} className="vert-middle">
                                <div className="cell-content row">
                                  <Icon id="xtzTezos" />
                                  XTZ
                                </div>
                              </TableCell>
                              <TableCell width={`15%`}>
                                <div className="cell-content">
                                  <CommaNumber value={22.2} className="value" endingText="%" />
                                  <CommaNumber value={2343322.2} className="rate" beginningText="$" showLetter />
                                </div>
                              </TableCell>
                              <TableCell width={`15%`}>
                                <div className="cell-content">
                                  <CommaNumber value={22.2} className="value" endingText="%" />
                                  <CommaNumber value={234322.2} className="rate" beginningText="$" showLetter />
                                </div>
                              </TableCell>
                              <TableCell width={`15%`}>
                                <div className="cell-content">
                                  <CommaNumber value={22.2} className="value" endingText="%" />
                                </div>
                              </TableCell>
                              <TableCell className="buttons">
                                <div className="cell-content row">
                                  <Button text="Borrow" kind={TRANSPARENT} className="go-back-btn loans" />
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </>
                ) : null}

                {COLLATERAL_MOCK.length ? (
                  <>
                    <div className="block-name margin-top">Collateral In Vault</div>
                    <Table className="no-margin borrowing-table">
                      <TableHeader className="simple-header">
                        <TableRow>
                          <TableHeaderCell>Vault Asset</TableHeaderCell>
                          <TableHeaderCell>Vault Balance</TableHeaderCell>
                          <TableHeaderCell>Withdraw Max</TableHeaderCell>
                          <TableHeaderCell>Other Data</TableHeaderCell>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {COLLATERAL_MOCK.map(() => {
                          return (
                            <TableRow rowHeight={70}>
                              <TableCell width={`15%`} className="vert-middle">
                                <div className="cell-content row">
                                  <Icon id="xtzTezos" />
                                  XTZ
                                </div>
                              </TableCell>
                              <TableCell width={`15%`}>
                                <div className="cell-content">
                                  <CommaNumber value={22.2} className="value" endingText="%" />
                                  <CommaNumber value={2343322.2} className="rate" beginningText="$" showLetter />
                                </div>
                              </TableCell>
                              <TableCell width={`15%`}>
                                <div className="cell-content">
                                  <CommaNumber value={22.2} className="value" endingText="%" />
                                  <CommaNumber value={234322.2} className="rate" beginningText="$" showLetter />
                                </div>
                              </TableCell>
                              <TableCell width={`15%`}>
                                <CommaNumber value={22.2} className="value" endingText="%" />
                              </TableCell>
                              <TableCell className="buttons">
                                <div className="cell-content row">
                                  <Button text="Add" icon="plus" kind={TRANSPARENT} className="go-back-btn loans" />
                                  <Button text="Remove" icon="minus" kind={TRANSPARENT} className="go-back-btn loans" />
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </>
                ) : null}
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
