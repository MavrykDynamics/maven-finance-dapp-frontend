import {
  ADD_COLLATERAL_MODAL_ID,
  ADD_NEW_COLLATERAL_MODAL_ID,
  BORROWIND_MOCK,
  BORROW_ASSET_MODAL_ID,
  CHANGE_BAKER_MODAL_ID,
  COLLATERAL_MOCK,
  MANAGE_PERMISSIONS_MODAL_ID,
  REPAY_AND_CLOSE_MODAL_ID,
  REPAY_MODAL_ID,
  UPDATE_MVK_OPERATORS_MODAL_ID,
  WITHDRAW_COLLATERAL_MODAL_ID,
} from '../Loans.const'
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
import { toggleLoansModal } from '../Loans.actions'

type BorrowingExpandCardPropsType = {
  isOwner?: boolean
  borrowedAsset: BorrowingData['borrowedAsset']
  collateralData: BorrowingData['collateralData']
  xtzDelegatedTo?: string
  operators?: Array<string>
  sMVKDelegatedTo?: string
  depositors?: string | Array<string>
}

export const BorrowingExpandCard = ({
  isOwner = false,
  borrowedAsset,
  collateralData,
  xtzDelegatedTo,
  operators,
  sMVKDelegatedTo,
  depositors,
}: BorrowingExpandCardPropsType) => {
  const dispatch = useDispatch()

  const {
    assetSymbol = 'xtz',
    assetIcon,
    amtBorrowed = 0,
    assetRate = 1,
    collateralBalance = 0,
    collateralUtilization = 0,
    apy,
    fee = 0,
  } = borrowedAsset

  const borrowHandler = () => dispatch(toggleLoansModal(BORROW_ASSET_MODAL_ID))
  const repayHandler = () => dispatch(toggleLoansModal(REPAY_MODAL_ID))
  const addCollateralHandler = () => dispatch(toggleLoansModal(ADD_COLLATERAL_MODAL_ID))
  const addNewCollateralHandler = () => dispatch(toggleLoansModal(ADD_NEW_COLLATERAL_MODAL_ID))
  const removeCollateralHandler = () => dispatch(toggleLoansModal(WITHDRAW_COLLATERAL_MODAL_ID))
  const repayFullHandler = () => dispatch(toggleLoansModal(REPAY_AND_CLOSE_MODAL_ID))
  const changeBakerHandler = () => dispatch(toggleLoansModal(CHANGE_BAKER_MODAL_ID))
  const updateOperatorsHandler = () => dispatch(toggleLoansModal(UPDATE_MVK_OPERATORS_MODAL_ID))
  const managePermissionsHandler = () => dispatch(toggleLoansModal(MANAGE_PERMISSIONS_MODAL_ID))

  const mappedDepositors = {
    isAll: depositors?.[0] === 'all',
    isNone: depositors?.[0] === 'none',
    firstAddress: depositors?.[0],
    ...(depositors ? { amount: depositors.length - 1 } : {}),
  }
  const mappedMVKOperators = {
    firstAddress: operators?.[0],
    ...(operators ? { amount: operators.length - 1 } : {}),
  }

  return (
    <Expand
      className="expand-borrow-tab"
      header={
        <>
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
          <ThreeLevelListItem>
            <div className="name">Asset</div>
            <div className="value">
              {assetIcon ? (
                <div className="img-wrapper">
                  <img src={assetIcon} alt={`${assetSymbol} logo`} />
                </div>
              ) : (
                <div className="no-icon">
                  <Icon id="noImage" />
                </div>
              )}
              {assetSymbol}
            </div>
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Amount</div>
            <CommaNumber value={amtBorrowed} className="value" />
            {assetRate ? <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" /> : null}
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Collateral Balance</div>
            <CommaNumber value={collateralBalance} className="value" endingText="%" />
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
                <div className="name">Asset</div>
                <div className="value">
                  {assetIcon ? (
                    <div className="img-wrapper">
                      <img src={assetIcon} alt={`${assetSymbol} logo`} />
                    </div>
                  ) : (
                    <div className="no-icon">
                      <Icon id="noImage" />
                    </div>
                  )}
                  {assetSymbol}
                </div>
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Amount</div>
                <CommaNumber value={amtBorrowed} className="value" />
                {assetRate ? <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" /> : null}
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Fee</div>
                <CommaNumber value={fee} className="value" endingText="%" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">APY</div>
                <CommaNumber value={apy} className="value" endingText="%" />
              </ThreeLevelListItem>
              {isOwner ? (
                <div className="buttons-wrapper">
                  <Button
                    text="Borrow"
                    icon="coin-loan"
                    strokeWidth={0.5}
                    onClick={borrowHandler}
                    kind={ACTION_PRIMARY}
                  />
                  <Button
                    text="Repay"
                    icon="okIcon"
                    strokeWidth={0.5}
                    onClick={repayHandler}
                    kind={TRANSPARENT_WITH_BORDER}
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {collateralData.length || true ? (
          <>
            <div className="block-name margin-top">Collateral In Vault</div>
            <Table className="no-margin borrowing-table">
              <TableHeader className="simple-header collateral">
                <TableRow>
                  <TableHeaderCell>Asset</TableHeaderCell>
                  <TableHeaderCell>Balance</TableHeaderCell>
                  <TableHeaderCell>Withdraw Max</TableHeaderCell>
                  <TableHeaderCell>Other Data</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {COLLATERAL_MOCK.map(({ assetSymbol, assetIcon, balance, assetRate, maxWithdraw }, idx) => {
                  const isTotalRow = COLLATERAL_MOCK.length - 1 === idx
                  if (isTotalRow && COLLATERAL_MOCK.length < 3) return null

                  return (
                    <TableRow rowHeight={60}>
                      <TableCell width={`17%`} className="vert-middle">
                        {isTotalRow ? (
                          'Total'
                        ) : (
                          <div className="cell-content row">
                            {assetIcon ? (
                              <div className="img-wrapper">
                                <img src={assetIcon} alt={`${assetSymbol} logo`} />
                              </div>
                            ) : (
                              <div className="no-icon">
                                <Icon id="noImage" />
                              </div>
                            )}
                            {assetSymbol}
                          </div>
                        )}
                      </TableCell>
                      <TableCell width={`17%`}>
                        <div className="cell-content">
                          <CommaNumber value={balance} className="value" endingText="%" />
                          <CommaNumber value={balance * assetRate} className="rate" beginningText="$" />
                        </div>
                      </TableCell>
                      <TableCell width={`17%`}>
                        <div className="cell-content">
                          <CommaNumber value={maxWithdraw} className="value" endingText="%" />
                          <CommaNumber value={maxWithdraw * assetRate} className="rate" beginningText="$" />
                        </div>
                      </TableCell>
                      <TableCell width={`17%`}>
                        <CommaNumber value={22.2} className="value" endingText="%" />
                      </TableCell>
                      <TableCell className="buttons borrowing">
                        <div className="cell-content row">
                          {isTotalRow ? (
                            <Button
                              text="Add Collateral"
                              icon="plus"
                              strokeWidth={0.1}
                              onClick={addNewCollateralHandler}
                              kind={ACTION_PRIMARY}
                              className="add-collateral"
                            />
                          ) : (
                            <>
                              <Button
                                text="Add"
                                icon="plus"
                                strokeWidth={0.1}
                                onClick={addCollateralHandler}
                                kind={TRANSPARENT_WITH_BORDER}
                              />
                              {isOwner ? (
                                <Button
                                  text="Remove"
                                  icon="minus"
                                  strokeWidth={0.1}
                                  onClick={removeCollateralHandler}
                                  kind={TRANSPARENT_WITH_BORDER}
                                />
                              ) : null}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {COLLATERAL_MOCK.length < 3 ? (
              <Button
                text="Add Collateral"
                icon="plus"
                strokeWidth={0.1}
                onClick={addNewCollateralHandler}
                kind={ACTION_PRIMARY}
                className="add-collateral"
              />
            ) : null}

            {isOwner ? (
              <>
                <div className="block-name margin-top">Delegations</div>
                <div className="bottom-info-row">
                  <div className="name">XTZ Delegated to </div>
                  <div className="value">
                    {xtzDelegatedTo ? <TzAddress tzAddress={xtzDelegatedTo} type={BLUE} /> : 'None'}
                  </div>
                  <Button
                    kind={ACTION_SIMPLE}
                    text="Change Baker"
                    icon="paginationArrowLeft"
                    iconAfter
                    onClick={changeBakerHandler}
                  />
                </div>
                <div className="bottom-info-row">
                  <div className="name">sMVKDelegated to </div>
                  <div className="value">
                    {sMVKDelegatedTo ? <TzAddress tzAddress={sMVKDelegatedTo} type={BLUE} /> : 'None'}
                  </div>
                  <Button kind={ACTION_SIMPLE} text="View Satellite" icon="paginationArrowLeft" iconAfter />
                </div>

                <div className="block-name margin-top-20">Permissions</div>
                <div className="bottom-info-row">
                  <div className="name">Depositors </div>
                  <div className="value">
                    {mappedDepositors.isAll ? 'All Alowed' : null}
                    {mappedDepositors.firstAddress
                      ? <TzAddress tzAddress={mappedDepositors.firstAddress} type={BLUE} /> +
                        ` ${mappedDepositors.amount ?? ''}`
                      : 'None Allowed'}
                  </div>
                  <Button
                    kind={ACTION_SIMPLE}
                    text="Update"
                    icon="paginationArrowLeft"
                    iconAfter
                    onClick={managePermissionsHandler}
                  />
                </div>
                <div className="bottom-info-row">
                  <div className="name">MVK Operators </div>
                  <div className="value">
                    {mappedMVKOperators.firstAddress
                      ? <TzAddress tzAddress={mappedMVKOperators.firstAddress} type={BLUE} /> +
                        ` ${mappedMVKOperators.amount ?? ''}`
                      : 'None'}
                  </div>
                  <Button
                    kind={ACTION_SIMPLE}
                    text="Update"
                    icon="paginationArrowLeft"
                    iconAfter
                    onClick={updateOperatorsHandler}
                  />
                </div>

                <Button
                  text="Repay Loan in Full"
                  kind={TRANSPARENT_WITH_BORDER}
                  onClick={repayFullHandler}
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
