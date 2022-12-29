import { BORROWIND_MOCK, COLLATERAL_MOCK } from '../Loans.const'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  ACTION_PRIMARY,
  ACTION_SIMPLE,
  TRANSPARENT,
  TRANSPARENT_WITH_BORDER,
} from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Expand from 'app/App.components/Expand/Expand.view'
import Icon from 'app/App.components/Icon/Icon.view'

import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { ThreeLevelListItem, FillBlock } from '../Loans.style'
import { BorrowingTabListItemExpanded } from './LoansComponents.style'
import { useDispatch } from 'react-redux'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'

type BorrowingExpandCardPropsType = {
  showFull?: boolean
  borrowedAsset: BorrowingData['borrowedAsset']
  collateralData: BorrowingData['collateralData']
  xtzDelegatedTo?: string
  operators?: Array<string>
  sMVKDelegatedTo?: string
  depositors?: string | Array<string>
}

export const BorrowingExpandCard = ({
  showFull = false,
  borrowedAsset,
  collateralData,
  xtzDelegatedTo,
  operators,
  sMVKDelegatedTo,
  depositors,
}: BorrowingExpandCardPropsType) => {
  const dispatch = useDispatch()

  const { assetSymbol, assetIcon, amtBorrowed, assetRate, collateralBalance, collateralUtilization, apy, fee } =
    borrowedAsset

  const borrowHandler = () => {}
  const repayHandler = () => {}
  const addCollateralHandler = () => {}
  const removeCollateralHandler = () => {}
  const closeVaultHandler = () => {}

  return (
    <Expand
      className="expand-borrow-tab"
      header={
        <>
          <ThreeLevelListItem>
            <div className="name">Borrowed Asset</div>
            <div className="value">
              {assetIcon ? (
                <div className="img-wrapper">
                  <img src={assetIcon} alt={`${assetSymbol} logo`} />
                </div>
              ) : (
                <Icon id="noIcon" />
              )}
              {assetSymbol}
            </div>
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Amt Borrowed</div>
            <CommaNumber value={amtBorrowed} className="value" showLetter />
            <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" showLetter />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Collateral Balance</div>
            <CommaNumber value={collateralBalance} className="value" endingText="%" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
            <FillBlock width={75}>
              <div className="colored"></div>
            </FillBlock>
            <div className="info-tip">
              Collateral Utilization:
              <span>
                <CommaNumber value={collateralUtilization} endingText="%" />
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
            <div className="borrowed-data">
              <ThreeLevelListItem>
                <div className="name">Borrowed Asset</div>
                <div className="value">
                  {assetIcon ? (
                    <div className="img-wrapper">
                      <img src={assetIcon} alt={`${assetSymbol} logo`} />
                    </div>
                  ) : (
                    <Icon id="noIcon" />
                  )}
                  {assetSymbol}
                </div>
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Amt Borrowed</div>
                <CommaNumber value={amtBorrowed} className="value" showLetter />
                <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" showLetter />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Borrowing Fee</div>
                <CommaNumber value={fee} className="value" endingText="%" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Borrow APY</div>
                <CommaNumber value={apy} className="value" endingText="%" />
              </ThreeLevelListItem>
              <div className="buttons-wrapper">
                <Button text="Borrow" onClick={borrowHandler} kind={ACTION_PRIMARY} />
                <Button text="Repay" onClick={repayHandler} kind={TRANSPARENT_WITH_BORDER} />
              </div>
            </div>
          </>
        ) : null}

        {collateralData.length ? (
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
                {collateralData.map(({ assetSymbol, assetIcon, balance, assetRate, maxWithdraw }) => {
                  return (
                    <TableRow rowHeight={70}>
                      <TableCell width={`15%`} className="vert-middle">
                        <div className="cell-content row">
                          {assetIcon ? (
                            <div className="img-wrapper">
                              <img src={assetIcon} alt={`${assetSymbol} logo`} />
                            </div>
                          ) : (
                            <Icon id="noIcon" />
                          )}
                          {assetSymbol}
                        </div>
                      </TableCell>
                      <TableCell width={`15%`}>
                        <div className="cell-content">
                          <CommaNumber value={balance} className="value" endingText="%" />
                          <CommaNumber value={balance * assetRate} className="rate" beginningText="$" showLetter />
                        </div>
                      </TableCell>
                      <TableCell width={`15%`}>
                        <div className="cell-content">
                          <CommaNumber value={maxWithdraw} className="value" endingText="%" />
                          <CommaNumber value={maxWithdraw * assetRate} className="rate" beginningText="$" showLetter />
                        </div>
                      </TableCell>
                      <TableCell width={`15%`}>
                        <CommaNumber value={22.2} className="value" endingText="%" />
                      </TableCell>
                      <TableCell className="buttons">
                        <div className="cell-content row">
                          <Button
                            text="Add"
                            icon="plus"
                            onClick={addCollateralHandler}
                            kind={TRANSPARENT_WITH_BORDER}
                          />
                          <Button
                            text="Remove"
                            icon="minus"
                            onClick={removeCollateralHandler}
                            kind={TRANSPARENT_WITH_BORDER}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {showFull ? (
              <>
                <div className="block-name margin-top">Delegations</div>
                {xtzDelegatedTo ? (
                  <div className="bottom-info-row">
                    <div className="name">XTZ Delegated to </div>
                    <div className="value">
                      <TzAddress tzAddress={xtzDelegatedTo} type={BLUE} />
                    </div>
                    <Button kind={ACTION_SIMPLE} text="View Bakers" icon="paginationArrowLeft" iconAfter />
                  </div>
                ) : null}
                {sMVKDelegatedTo ? (
                  <div className="bottom-info-row">
                    <div className="name">sMVKDelegated to </div>
                    <div className="value">
                      <TzAddress tzAddress={sMVKDelegatedTo} type={BLUE} />
                    </div>
                    <Button kind={ACTION_SIMPLE} text="View Satellite" icon="paginationArrowLeft" iconAfter />
                  </div>
                ) : null}

                <div className="block-name margin-top">Permissions</div>
                <div className="bottom-info-row">
                  <div className="name">Depositors </div>
                  <div className="value">
                    {Array.isArray(depositors) && depositors.length === 1 ? (
                      <TzAddress tzAddress={depositors[0]} type={BLUE} />
                    ) : (
                      ''
                    )}
                    {Array.isArray(depositors) && depositors.length > 1 ? depositors.length : ''}
                    {Array.isArray(depositors) && depositors.length < 1 ? 'None' : ''}
                    {!Array.isArray(depositors) ? depositors : ''}
                  </div>
                  <Button kind={ACTION_SIMPLE} text="View Bakers" icon="paginationArrowLeft" iconAfter />
                </div>
                <div className="bottom-info-row">
                  <div className="name">MVK Operators </div>
                  <div className="value">
                    {Array.isArray(operators) && operators.length >= 1
                      ? <TzAddress tzAddress={operators[0]} type={BLUE} /> +
                        (operators.length - 1 > 0 ? ` + ${operators.length - 1}` : '')
                      : ''}
                    {Array.isArray(operators) && operators.length < 1 ? 'None' : ''}
                    <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
                  </div>
                  <Button kind={ACTION_SIMPLE} text="View Satellite" icon="paginationArrowLeft" iconAfter />
                </div>

                <Button
                  text="Close Vault"
                  kind={TRANSPARENT_WITH_BORDER}
                  onClick={closeVaultHandler}
                  className="close-vault"
                  icon="close-stroke"
                />
              </>
            ) : null}
          </>
        ) : null}
      </BorrowingTabListItemExpanded>
    </Expand>
  )
}
