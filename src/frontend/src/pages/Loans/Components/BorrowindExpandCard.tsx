import { useContext, useEffect, useState } from 'react'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent, getStatusByCollateralRatio } from '../Loans.const'
import { ACTION_PRIMARY, ACTION_SIMPLE, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import Expand from 'app/App.components/Expand/Expand.view'
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusMessage } from './StatusMessage.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'
import { ThreeLevelListItem } from '../Loans.style'
import { BorrowingTabListItemExpanded } from './LoansComponents.style'

import { loansPopupsContext } from './Modals/LoansModals.provider'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { getTimestampByLevel } from 'pages/Governance/Governance.actions'
import { calculateCollateralShare } from 'pages/Vaults/calcFunctionsForVaultStatuses'

export type BorrowingCardOptions = {
  reverseColumns?: boolean
  showOtherColumns?: boolean
}

type BorrowingExpandCardPropsType = BorrowingData & {
  isOwner?: boolean
  headerSufix?: React.ReactNode
  getExpandedStatus?: (arg: boolean) => void
  className?: string
  children?: React.ReactNode
  status?: string
  options?: BorrowingCardOptions
}

export const BorrowingExpandCard = ({
  isOwner = false,
  borrowedAsset,
  collateralData,
  xtzDelegatedTo,
  operators,
  sMVKDelegatedTo,
  depositors,
  headerSufix,
  getExpandedStatus,
  className,
  address,
  children,
  status,
  options,
  levelOfEarly,
  levelOfLate,
}: BorrowingExpandCardPropsType) => {
  const { reverseColumns, showOtherColumns } = options ?? {}

  const {
    assetSymbol,
    assetIcon,
    amtBorrowed = 0,
    assetRate = 1,
    collateralBalance = 0,
    collateralUtilization = 0,
    apr,
    fee = 0,
  } = borrowedAsset

  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)

  const {
    openChangeBakerPopup,
    openAddExistingCollateralPopup,
    openAddNewCollateralPopup,
    openBorrowPopup,
    openManagePermissionsPopup,
    openRepayFullPopup,
    openRepayPopup,
    openUpdateMvkOperatorsPopup,
    openWithdrawCollateralPopup,
  } = useContext(loansPopupsContext)

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

  const vaultStatus = status ?? getStatusByCollateralRatio(collateralUtilization)

  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const collateralTotalBalance = collateralData[collateralData.length - 1]?.balance

  useEffect(() => {
    if (vaultStatus === vaultsStatuses.GRACE_PERIOD || vaultStatus === vaultsStatuses.LIQUIDATABLE) {
      ;(async () => {
        if (!levelOfEarly || !levelOfLate) {
          setTimerTimestamp(undefined)
          return
        }

        const [timestampOfEarly, timestampOfLate] = await Promise.all([
          getTimestampByLevel(levelOfEarly),
          getTimestampByLevel(levelOfLate),
        ])

        const timestamp =
          new Date(timestampOfEarly).getTime() - new Date(timestampOfLate).getTime() + new Date().getTime()

        setTimerTimestamp(timestamp)
      })()
    }
  }, [vaultStatus, levelOfEarly, levelOfLate])

  return (
    <>
      <Expand
        getExpandedStatus={getExpandedStatus}
        className={className || 'expand-borrow-tab'}
        sufix={headerSufix}
        header={
          <>
            <ThreeLevelListItem className="borrow-asset-header">
              {assetIcon ? (
                <div className="img-wrapper">
                  <img src={assetIcon} alt={`${assetSymbol} logo`} />
                </div>
              ) : (
                <Icon id="noImage" />
              )}
              <div className="data">
                <div className="value">{assetSymbol === 'tez' ? 'XTZ' : assetSymbol?.toUpperCase()}</div>
                <div className="value">
                  <TzAddress tzAddress={address} shouldCopy hasIcon amountFromStart={4} amountFromEnd={4} />
                </div>
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(collateralUtilization)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber
                  beginningText={`${collateralUtilization > 250 ? '+' : ''}`}
                  value={Math.max(0, Math.min(collateralUtilization, 250))}
                  endingText="%"
                  showDecimal
                  decimalsToShow={2}
                />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={Math.max(0, Math.min(((collateralUtilization - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>
            {reverseColumns && (
              <ThreeLevelListItem>
                <div className="name">Collateral Balance</div>
                <CommaNumber
                  value={collateralBalance}
                  className="value"
                  beginningText="$"
                  showDecimal
                  decimalsToShow={4}
                />
              </ThreeLevelListItem>
            )}
            <ThreeLevelListItem>
              <div className="name">Borrowed Amount</div>
              <CommaNumber value={amtBorrowed} className="value" showDecimal decimalsToShow={4} />
              {assetRate ? (
                <CommaNumber
                  value={amtBorrowed * assetRate}
                  beginningText="$"
                  className="rate"
                  showDecimal
                  decimalsToShow={4}
                />
              ) : null}
            </ThreeLevelListItem>
            {!reverseColumns && (
              <ThreeLevelListItem>
                <div className="name">Collateral Balance</div>
                <CommaNumber
                  value={collateralBalance}
                  className="value"
                  beginningText="$"
                  showDecimal
                  decimalsToShow={4}
                />
              </ThreeLevelListItem>
            )}
          </>
        }
      >
        {children || (
          <BorrowingTabListItemExpanded className="expand-borrow-tab-container">
            {vaultStatus && <StatusMessage status={vaultStatus} timestamp={timerTimestamp} />}

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
                  {assetSymbol === 'tez' ? 'XTZ' : assetSymbol?.toUpperCase()}
                </div>
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Amount</div>
                <CommaNumber value={amtBorrowed} className="value" />
                {assetRate ? <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" /> : null}
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Fee</div>
                <CommaNumber value={fee} className="value" />
                {assetRate ? <CommaNumber value={fee * assetRate} beginningText="$" className="rate" /> : null}
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">APR</div>
                <CommaNumber value={apr} className="value" endingText="%" />
              </ThreeLevelListItem>
              {isOwner ? (
                <div className="buttons-wrapper">
                  <Button
                    text="Borrow"
                    icon="coin-loan"
                    strokeWidth={0.5}
                    onClick={() =>
                      openBorrowPopup?.({
                        vaultAddress: address,
                        borrowedAsset: borrowedAsset,
                        borowCapacity: 0,
                        collateralUtilization: 0,
                        borrowAPR: apr,
                        hasUserBorrowed: false,
                        currentCollateralBalance: collateralData.at(-1)?.balance ?? 0,
                        currentAvaliableToBorrow: 0,
                      })
                    }
                    disabled
                    kind={ACTION_PRIMARY}
                  />
                  <NewButton
                    onClick={() =>
                      openRepayPopup?.({
                        vaultAddress: address,
                        borrowedAsset: borrowedAsset,
                        feesAmount: 0,
                        currentCollateralBalance: collateralData.at(-1)?.balance ?? 0,
                        currentAvaliableToBorrow: 0,
                      })
                    }
                    kind={TRANSPARENT_WITH_BORDER}
                    className="repay"
                    disabled
                  >
                    <Icon id="okIcon" /> Repay
                  </NewButton>
                </div>
              ) : null}
            </div>

            <div className="block-name margin-top">Collateral In Vault</div>
            <Table className={`no-margin borrowing-table ${isOwner ? 'show-before' : ''}`}>
              <TableHeader className={`simple-header collateral ${collateralData.length === 0 ? 'empty' : ''}`}>
                <TableRow>
                  <TableHeaderCell>Asset</TableHeaderCell>
                  <TableHeaderCell>Balance</TableHeaderCell>
                  <TableHeaderCell>Withdraw Max</TableHeaderCell>
                  {showOtherColumns && <TableHeaderCell>Collateral Share</TableHeaderCell>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {collateralData.map(({ assetSymbol, assetIcon, balance, assetRate, maxWithdraw }, idx, array) => {
                  const columnWidth = showOtherColumns ? '18%' : '22%'
                  const isTotalRow = collateralData.length - 1 === idx

                  const collateralShare = isTotalRow
                    ? 100
                    : calculateCollateralShare(balance * assetRate, collateralTotalBalance)

                  if (isTotalRow && collateralData.length < 3) return null

                  return (
                    <TableRow rowHeight={60} key={assetSymbol + '-' + idx}>
                      <TableCell width={columnWidth} className="vert-middle">
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
                            {assetSymbol === 'tez' ? 'XTZ' : assetSymbol?.toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell width={columnWidth}>
                        <div className="cell-content">
                          <CommaNumber
                            value={balance}
                            className="value"
                            showDecimal
                            decimalsToShow={4}
                            beginningText={isTotalRow ? '$' : ''}
                          />
                          {assetRate ? (
                            <CommaNumber
                              value={balance * assetRate}
                              className="rate"
                              beginningText="$"
                              showDecimal
                              decimalsToShow={4}
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell width={columnWidth}>
                        <div className="cell-content">
                          <CommaNumber value={maxWithdraw} className="value" />
                          {assetRate ? (
                            <CommaNumber value={maxWithdraw * assetRate} className="rate" beginningText="$" />
                          ) : null}
                        </div>
                      </TableCell>
                      {showOtherColumns ? (
                        <TableCell width={columnWidth}>
                          <div className="cell-content">
                            <CommaNumber value={collateralShare} className="value" endingText="%" />
                          </div>
                        </TableCell>
                      ) : null}
                      {isTotalRow ? (
                        <TableCell className="buttons borrowing">
                          <div className="cell-content row">
                            {isOwner ? (
                              <Button
                                text="Add Collateral"
                                icon="plus"
                                strokeWidth={0.1}
                                onClick={() =>
                                  openAddNewCollateralPopup?.({
                                    vaultAddress: address,
                                    currentCollateralValue: collateralData.at(-1)?.balance ?? 0,
                                    currentAvaliableToWithdraw: 0,
                                  })
                                }
                                kind={ACTION_PRIMARY}
                                disabled={avaliableCollaterals.length === 0}
                                className="add-collateral"
                              />
                            ) : null}
                          </div>
                        </TableCell>
                      ) : (
                        <TableCell className="buttons borrowing">
                          <div className="cell-content row">
                            <NewButton
                              onClick={() =>
                                openAddExistingCollateralPopup?.({
                                  vaultAddress: address,
                                  currentCollateralValue: collateralData.at(-1)?.balance ?? 0,
                                  currentAvaliableToWithdraw: 0,
                                  selectedAsset: collateralData[idx],
                                })
                              }
                              kind={TRANSPARENT_WITH_BORDER}
                            >
                              <Icon id="plus" /> Add
                            </NewButton>
                            {isOwner ? (
                              <NewButton
                                onClick={() =>
                                  openWithdrawCollateralPopup?.({
                                    vaultAddress: address,
                                    currentCollateralValue: collateralData.at(-1)?.balance ?? 0,
                                    currentAvaliableToWithdraw: 0,
                                    selectedAsset: collateralData[idx],
                                  })
                                }
                                disabled
                                kind={TRANSPARENT_WITH_BORDER}
                              >
                                <Icon id="minus" /> Remove
                              </NewButton>
                            ) : null}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {collateralData.length < 3 && isOwner ? (
              <Button
                text="Add Collateral"
                icon="plus"
                strokeWidth={0.1}
                onClick={() =>
                  openAddNewCollateralPopup?.({
                    vaultAddress: address,
                    currentCollateralValue: collateralData.at(-1)?.balance ?? 0,
                    currentAvaliableToWithdraw: 0,
                  })
                }
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
                    disabled
                    onClick={() =>
                      openChangeBakerPopup?.({
                        bakerAddress: xtzDelegatedTo,
                      })
                    }
                  />
                </div>
                <div className="bottom-info-row">
                  <div className="name">sMVK Delegated to </div>
                  <div className="value">
                    {sMVKDelegatedTo ? <TzAddress tzAddress={sMVKDelegatedTo} type={BLUE} /> : 'None'}
                  </div>
                  <Link to={sMVKDelegatedTo ? `/satellites/satellite-details/${sMVKDelegatedTo}` : '/satellite-nodes'}>
                    <Button kind={ACTION_SIMPLE} text="View Satellite" icon="paginationArrowLeft" iconAfter />
                  </Link>
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
                    disabled
                    onClick={() => openManagePermissionsPopup?.({})}
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
                    disabled
                    onClick={() => openUpdateMvkOperatorsPopup?.({})}
                  />
                </div>

                <Button
                  text="Repay Loan in Full"
                  disabled
                  kind={TRANSPARENT_WITH_BORDER}
                  onClick={() =>
                    openRepayFullPopup?.({
                      vaultAddress: address,
                      borrowedAsset: borrowedAsset,
                      feesAmount: 0,
                      currentCollateralBalance: collateralData.at(-1)?.balance ?? 0,
                      currentAvaliableToBorrow: 0,
                    })
                  }
                  className="close-vault"
                  icon="close-stroke"
                />
              </>
            ) : null}
          </BorrowingTabListItemExpanded>
        )}
      </Expand>
    </>
  )
}
