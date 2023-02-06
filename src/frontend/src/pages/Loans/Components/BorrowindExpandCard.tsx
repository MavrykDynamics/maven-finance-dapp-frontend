import { useContext, useEffect, useState } from 'react'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent, getStatusByCollateralRatio } from '../Loans.const'
import { ACTION_PRIMARY, ACTION_SIMPLE, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
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
import { calculateCollateralShare } from 'pages/Vaults/calcFunctionsForVault'
import { isTezosAsset } from '../Loans.helpers'

export type BorrowingCardOptions = {
  reverseColumns?: boolean
}

type BorrowingExpandCardPropsType = LoansVaultType & {
  isOwner?: boolean
  headerSufix?: React.ReactNode
  getExpandedStatus?: (arg: boolean) => void
  className?: string
  children?: React.ReactNode
  status?: string
  options?: BorrowingCardOptions
  isOpenedVault?: boolean
  DAOFee: number
}

export const BorrowingExpandCard = ({
  isOwner = false,
  borrowedAsset,
  collateralData,
  xtzDelegatedTo,
  operators,
  sMVKDelegatedTo,
  vaultId,
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
  isOpenedVault,
  fee,
  apr,
  collateralBalance,
  borrowedAmount,
  collateralRatio,
  borrowCapacity,
  DAOFee,
  repayFee,
}: BorrowingExpandCardPropsType) => {
  const { reverseColumns } = options ?? {}

  const { symbol, icon, rate = 1 } = borrowedAsset

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

  const vaultStatus = status ?? getStatusByCollateralRatio(collateralRatio)

  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const collateralTotalBalance = collateralData[collateralData.length - 1]?.amount

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
        isExpandedByDefault={isOpenedVault}
        className={className || 'expand-borrow-tab'}
        sufix={headerSufix}
        header={
          <>
            <ThreeLevelListItem className="borrow-asset-header">
              {icon ? (
                <div className="img-wrapper">
                  <img src={icon} alt={`${symbol} logo`} />
                </div>
              ) : (
                <Icon id="noImage" />
              )}
              <div className="data">
                <div className="value">{borrowedAsset.symbol}</div>
                <div className="value">
                  <TzAddress tzAddress={address} shouldCopy hasIcon amountFromStart={4} amountFromEnd={4} />
                </div>
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(collateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber
                  beginningText={`${collateralRatio > 250 ? '+' : ''}`}
                  value={Math.max(0, Math.min(collateralRatio, 250))}
                  endingText="%"
                  showDecimal
                  decimalsToShow={2}
                />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={Math.max(0, Math.min(((collateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>
            {reverseColumns && (
              <ThreeLevelListItem>
                <div className="name">Collateral amount</div>
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
              <CommaNumber value={borrowedAmount} className="value" showDecimal decimalsToShow={4} />
              {rate ? (
                <CommaNumber
                  value={borrowedAmount * rate}
                  beginningText="$"
                  className="rate"
                  showDecimal
                  decimalsToShow={4}
                />
              ) : null}
            </ThreeLevelListItem>
            {!reverseColumns && (
              <ThreeLevelListItem>
                <div className="name">Collateral amount</div>
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
                  {icon ? (
                    <div className="img-wrapper">
                      <img src={icon} alt={`${symbol} logo`} />
                    </div>
                  ) : (
                    <div className="no-icon">
                      <Icon id="noImage" />
                    </div>
                  )}
                  {borrowedAsset.symbol}
                </div>
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Amount</div>
                <CommaNumber value={borrowedAmount} className="value" />
                {rate ? <CommaNumber value={borrowedAmount * rate} beginningText="$" className="rate" /> : null}
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Fee</div>
                <CommaNumber value={fee} className="value" />
                {rate ? <CommaNumber value={fee * rate} beginningText="$" className="rate" /> : null}
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
                    disabled={collateralRatio < 200}
                    strokeWidth={0.5}
                    onClick={() =>
                      openBorrowPopup?.({
                        vaultId,
                        borrowedAsset: borrowedAsset,
                        collateralRatio,
                        borrowAPR: apr,
                        currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                        hasUserBorrowed: false,
                        borrowCapacity: borrowCapacity / borrowedAsset.rate,
                        currentBorrowedAmount: borrowedAmount,
                        DAOFee,
                      })
                    }
                    kind={ACTION_PRIMARY}
                  />
                  <NewButton
                    onClick={() =>
                      openRepayPopup?.({
                        vaultId,
                        borrowedAsset: borrowedAsset,
                        borrowedAmount,
                        feesAmount: repayFee,
                        currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                        borrowCapacity: borrowCapacity / borrowedAsset.rate,
                      })
                    }
                    kind={TRANSPARENT_WITH_BORDER}
                    disabled={!borrowedAmount}
                    className="repay"
                  >
                    <Icon id="okIcon" /> Repay
                  </NewButton>
                </div>
              ) : null}
            </div>

            <div className="block-name margin-top">Collateral In Vault</div>
            <Table className={`no-margin borrowing-table ${collateralData.length === 0 ? 'show-before' : ''}`}>
              {collateralData.length ? (
                <TableHeader className={`simple-header collateral `}>
                  <TableRow>
                    <TableHeaderCell>Asset</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Collateral Share</TableHeaderCell>
                  </TableRow>
                </TableHeader>
              ) : null}

              <TableBody>
                {collateralData.map(({ icon, amount, rate, gqlName, symbol }, idx) => {
                  const isTotalRow = collateralData.length - 1 === idx

                  const collateralShare = isTotalRow
                    ? 100
                    : calculateCollateralShare(amount * rate, collateralTotalBalance)

                  if (isTotalRow && collateralData.length < 3) return null

                  return (
                    <TableRow rowHeight={60} key={gqlName + '-' + idx}>
                      <TableCell width={'22%'} className="vert-middle">
                        {isTotalRow ? (
                          'Total'
                        ) : (
                          <div className="cell-content row">
                            {icon ? (
                              <div className="img-wrapper">
                                <img src={icon} alt={`${gqlName} logo`} />
                              </div>
                            ) : (
                              <div className="no-icon">
                                <Icon id="noImage" />
                              </div>
                            )}
                            {symbol}
                          </div>
                        )}
                      </TableCell>
                      <TableCell width={'22%'}>
                        <div className="cell-content">
                          <CommaNumber
                            value={amount}
                            className="value"
                            showDecimal
                            decimalsToShow={4}
                            beginningText={isTotalRow ? '$' : ''}
                          />
                          {rate ? (
                            <CommaNumber
                              value={amount * rate}
                              className="rate"
                              beginningText="$"
                              showDecimal
                              decimalsToShow={4}
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell width={'22%'}>
                        <div className="cell-content">
                          <CommaNumber value={collateralShare} className="value" endingText="%" />
                        </div>
                      </TableCell>
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
                                    vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                    currentCollateralRatio: collateralRatio,
                                    borrowedAmount,
                                    collateralWithdrawAmount: 0,
                                    existingCollaterals: collateralData,
                                  })
                                }
                                kind={ACTION_PRIMARY}
                                disabled={
                                  avaliableCollaterals.length === 0 ||
                                  avaliableCollaterals.length === collateralData.length - 1
                                }
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
                                  vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                  selectedAsset: collateralData[idx],
                                  currentCollateralRatio: collateralRatio,
                                  borrowedAmount,
                                  collateralWithdrawAmount: amount,
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
                                    currentCollateralBalance: amount,
                                    vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                    selectedAsset: collateralData[idx],
                                    currentCollateralRatio: collateralRatio,
                                    borrowedAmount,
                                    collateralWithdrawAmount: amount,
                                  })
                                }
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
                    vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                    currentCollateralRatio: collateralRatio,
                    borrowedAmount,
                    collateralWithdrawAmount: 0,
                    existingCollaterals: collateralData,
                  })
                }
                kind={ACTION_PRIMARY}
                disabled={
                  avaliableCollaterals.length === 0 || avaliableCollaterals.length === collateralData.length - 1
                }
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
                    disabled={!collateralData.find(({ gqlName }) => isTezosAsset(gqlName))}
                    onClick={() =>
                      openChangeBakerPopup?.({
                        bakerAddress: xtzDelegatedTo,
                        vaultAddress: address,
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
                  disabled={!borrowedAmount}
                  kind={TRANSPARENT_WITH_BORDER}
                  onClick={() =>
                    openRepayFullPopup?.({
                      vaultId,
                      borrowedAsset: borrowedAsset,
                      collateralRatio,
                      borrowedAmount,
                      feesAmount: repayFee,
                      currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                      borrowCapacity: borrowCapacity / borrowedAsset.rate,
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
