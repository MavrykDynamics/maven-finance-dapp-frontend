import { useContext, useEffect, useRef, useState } from 'react'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  ANY_USER,
  COLLATERAL_RATIO_GRADIENT,
  getCollateralRationPersent,
  getStatusByCollateralRatio,
  NONE_USER,
  WHITELIST_USERS,
} from '../Loans.const'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import Expand from 'app/App.components/Expand/Expand.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusMessage } from './StatusMessage.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { scrollToFullView } from 'utils/scrollToFullView'
import { assetDecimalsToShow } from '../Loans.const'

import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
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
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import colors from 'styles/colors'
import { getNumberInBounds } from 'utils/calcFunctions'
import { useClickAway } from 'react-use'

type BorrowingExpandCardPropsType = LoansVaultType & {
  isOwner?: boolean
  isOpenedVault?: boolean
  headerSufix?: React.ReactNode
  className?: string
  children?: React.ReactNode
  status?: string
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
  name,
  depositors,
  deporsitorsFlag,
  headerSufix,
  className,
  address,
  children,
  status,
  levelOfEarly,
  levelOfLate,
  isOpenedVault,
  fee,
  apr,
  collateralBalance,
  borrowedAmount,
  collateralRatio,
  borrowCapacity,
  avaliableLiq,
  minimumRepay,
  DAOFee,
}: BorrowingExpandCardPropsType) => {
  const { symbol, icon, rate = 1 } = borrowedAsset

  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const [expanded, setExpanded] = useState(false)

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
    changeBakerPopup,
    repayPartPopup,
    repayFullPopup,
    borrowAssetPopup,
    addExistingCollateralPopup,
    addNewCollateralPopup,
    withdrawCollateralPopup,
    updateMvkOperatorPopup,
    managePermissionsPopup,
    liquidateVaultPopup,
  } = useContext(loansPopupsContext)

  const notHandleClickAway =
    repayPartPopup.showModal ||
    changeBakerPopup.showModal ||
    repayFullPopup.showModal ||
    borrowAssetPopup.showModal ||
    addExistingCollateralPopup.showModal ||
    addNewCollateralPopup.showModal ||
    withdrawCollateralPopup.showModal ||
    updateMvkOperatorPopup.showModal ||
    managePermissionsPopup.showModal ||
    liquidateVaultPopup.showModal ||
    isActionLoading

  const ref = useRef<HTMLDivElement | null>(null)

  useClickAway(ref, () => (notHandleClickAway ? null : setExpanded(false)))

  // use for borrow or repay
  // it scrolls until the current vault after the transaction and changing position
  const scrollToCurrentVault = () => {
    scrollToFullView(ref.current, 'nearest')
  }

  const mappedMVKOperators = {
    firstAddress: operators?.[0],
    ...(operators ? { amount: operators.length - 1 } : {}),
  }

  const vaultStatus = status ?? getStatusByCollateralRatio(collateralRatio)
  const vaultHasXtzCollateral = collateralData.find(({ gqlName }) => isTezosAsset(gqlName))
  // TODO: test it when sMVK will be avaliable as collateral
  const vaultHasSmvkCollateral = collateralData.find(({ gqlName }) => gqlName === 'smvk')
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

  useEffect(() => {
    setExpanded(Boolean(isOpenedVault))
  }, [isOpenedVault])

  return (
    <div ref={ref}>
      <Expand
        getExpandedStatus={setExpanded}
        isExpandedByDefault={expanded}
        className={`expand-borrow-tab  ${expanded ? 'expandedCard' : ''}`}
        sufix={headerSufix}
        header={
          <>
            <ThreeLevelListItem className="borrow-asset-header">
              <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} />
              <div className="data">
                <div className="value">{name ? name : borrowedAsset.symbol}</div>
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
                Collateral Ratio: <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={Math.max(0, Math.min(((collateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Outstanding Debt</div>
              <CommaNumber
                value={borrowedAmount + fee}
                className="value"
                showDecimal
                decimalsToShow={assetDecimalsToShow}
              />
              {rate ? (
                <CommaNumber
                  value={(borrowedAmount + fee) * rate}
                  beginningText="$"
                  className="rate"
                  showDecimal
                  decimalsToShow={2}
                />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral amount</div>
              <CommaNumber
                value={collateralBalance}
                className="value"
                beginningText="$"
                showDecimal
                decimalsToShow={2}
              />
            </ThreeLevelListItem>
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
                  <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} />
                  {borrowedAsset.symbol}
                </div>
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Principal</div>
                <CommaNumber value={borrowedAmount} decimalsToShow={assetDecimalsToShow} className="value" />
                {rate ? (
                  <CommaNumber value={borrowedAmount * rate} decimalsToShow={2} beginningText="$" className="rate" />
                ) : null}
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">
                  Accrued Interest{' '}
                  <CustomTooltip
                    iconId="info"
                    text="Interest, compounded over time every time you borrow"
                    defaultStrokeColor={colors[themeSelected].textColor}
                  />
                </div>
                <CommaNumber value={fee} decimalsToShow={assetDecimalsToShow} className="value" />
                {rate ? <CommaNumber value={fee * rate} decimalsToShow={2} beginningText="$" className="rate" /> : null}
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">APR</div>
                <CommaNumber value={apr} decimalsToShow={2} className="value" endingText="%" />
              </ThreeLevelListItem>
              {isOwner ? (
                <div className="buttons-wrapper">
                  <Button
                    onClick={() =>
                      openBorrowPopup?.({
                        vaultId,
                        borrowedAsset: borrowedAsset,
                        collateralRatio,
                        borrowAPR: apr,
                        currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                        hasUserBorrowed: Boolean(borrowedAmount),
                        borrowCapacity,
                        currentBorrowedAmount: borrowedAmount,
                        DAOFee,
                        scrollToCurrentVault,
                      })
                    }
                    kind={BUTTON_SECONDARY}
                    form={BUTTON_WIDE}
                    disabled={collateralRatio < 200}
                  >
                    <Icon id="coin-loan" /> Borrow
                  </Button>
                  <Button
                    onClick={() =>
                      openRepayPopup?.({
                        vaultId,
                        vaultAddress: address,
                        borrowedAsset: borrowedAsset,
                        borrowedAmount,
                        feesAmount: fee,
                        minimumRepay,
                        currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                        borrowCapacity,
                        scrollToCurrentVault,
                      })
                    }
                    kind={BUTTON_PRIMARY}
                    form={BUTTON_WIDE}
                    disabled={!borrowedAmount}
                  >
                    <Icon id="okIcon" /> Repay
                  </Button>
                </div>
              ) : null}
            </div>

            {isOwner || (!isOwner && collateralData.length) ? (
              <>
                <div className="block-name margin-top">Collateral In Vault</div>
                <Table
                  className={`no-margin borrowing-table ${isOwner && collateralData.length <= 2 ? 'show-before' : ''}`}
                >
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
                        : getNumberInBounds(0, 100, calculateCollateralShare(amount * rate, collateralTotalBalance))

                      if (isTotalRow && collateralData.length < 3) return null

                      return (
                        <TableRow rowHeight={65} key={gqlName + '-' + idx}>
                          <TableCell width={'22%'} className="vert-middle">
                            {isTotalRow ? (
                              'Total'
                            ) : (
                              <div className="cell-content row with-icon">
                                <ImageWithPlug imageLink={icon} alt={`${gqlName} icon`} />
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
                                decimalsToShow={isTotalRow ? 2 : assetDecimalsToShow}
                                beginningText={isTotalRow ? '$' : ''}
                              />
                              {rate ? (
                                <CommaNumber value={amount * rate} className="rate" beginningText="$" showDecimal />
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell width={'22%'}>
                            <div className="cell-content">
                              <CommaNumber value={collateralShare} className="value" endingText="%" />
                            </div>
                          </TableCell>
                          {isTotalRow ? (
                            <TableCell className="buttons borrowing total">
                              <div className="cell-content row">
                                {isOwner ? (
                                  <Button
                                    onClick={() =>
                                      openAddNewCollateralPopup?.({
                                        vaultAddress: address,
                                        vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                        currentCollateralRatio: collateralRatio,
                                        borrowedAmount,
                                        existingCollaterals: collateralData,
                                        borrowedAssetRate: borrowedAsset.rate,
                                        borrowCapacity,
                                        avaliableLiq,
                                      })
                                    }
                                    kind={BUTTON_PRIMARY}
                                    form={BUTTON_WIDE}
                                    disabled={
                                      avaliableCollaterals.length === 0 ||
                                      avaliableCollaterals.length === collateralData.length - 1
                                    }
                                  >
                                    <Icon id="plus" /> Add Collateral
                                  </Button>
                                ) : null}
                              </div>
                            </TableCell>
                          ) : (
                            <TableCell className={`buttons borrowing ${!isOwner ? 'single-btn' : ''}`}>
                              <div className="cell-content row">
                                <Button
                                  onClick={() =>
                                    openAddExistingCollateralPopup?.({
                                      vaultAddress: address,
                                      vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                      selectedAsset: collateralData[idx],
                                      currentCollateralRatio: collateralRatio,
                                      borrowedAmount,
                                      borrowedAssetRate: borrowedAsset.rate,
                                      borrowCapacity,
                                      avaliableLiq,
                                    })
                                  }
                                  form={BUTTON_WIDE}
                                  kind={BUTTON_SECONDARY}
                                >
                                  <Icon id="plus" /> Add
                                </Button>
                                {isOwner ? (
                                  <Button
                                    onClick={() =>
                                      openWithdrawCollateralPopup?.({
                                        vaultAddress: address,
                                        currentCollateralBalance: amount,
                                        vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                        selectedAsset: collateralData[idx],
                                        currentCollateralRatio: collateralRatio,
                                        borrowedAmount,
                                        borrowedAssetRate: borrowedAsset.rate,
                                      })
                                    }
                                    form={BUTTON_WIDE}
                                    kind={BUTTON_SECONDARY}
                                    disabled={collateralRatio < 200}
                                  >
                                    <Icon id="minus" /> Remove
                                  </Button>
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
                  <div className="add-first-collateral">
                    <Button
                      onClick={() =>
                        openAddNewCollateralPopup?.({
                          vaultAddress: address,
                          vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                          currentCollateralRatio: collateralRatio,
                          borrowedAmount,
                          existingCollaterals: collateralData,
                          borrowedAssetRate: borrowedAsset.rate,
                          avaliableLiq,
                          borrowCapacity,
                        })
                      }
                      kind={BUTTON_PRIMARY}
                      form={BUTTON_WIDE}
                      isThin
                      disabled={
                        avaliableCollaterals.length === 0 || avaliableCollaterals.length === collateralData.length - 1
                      }
                    >
                      <Icon id="plus" /> Add Collateral
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}

            {isOwner ? (
              <>
                {vaultHasXtzCollateral || vaultHasSmvkCollateral ? (
                  <div className="block-name margin-top">Delegations</div>
                ) : null}

                {vaultHasXtzCollateral ? (
                  <div className="bottom-info-row">
                    <div className="name">XTZ Delegated to </div>
                    <div className="value">
                      {xtzDelegatedTo ? <TzAddress tzAddress={xtzDelegatedTo} type={BLUE} /> : 'Not Delegated'}
                    </div>
                    <Button
                      kind={BUTTON_SIMPLE}
                      disabled={!collateralData.find(({ gqlName }) => isTezosAsset(gqlName))}
                      onClick={() =>
                        openChangeBakerPopup?.({
                          bakerAddress: xtzDelegatedTo,
                          vaultAddress: address,
                        })
                      }
                    >
                      Change Baker <Icon id="paginationArrowLeft" />
                    </Button>
                  </div>
                ) : null}

                {vaultHasSmvkCollateral ? (
                  <div className="bottom-info-row">
                    <div className="name">sMVK Delegated to </div>
                    <div className="value">
                      {sMVKDelegatedTo ? <TzAddress tzAddress={sMVKDelegatedTo} type={BLUE} /> : 'None'}
                    </div>
                    <Link
                      to={sMVKDelegatedTo ? `/satellites/satellite-details/${sMVKDelegatedTo}` : '/satellite-nodes'}
                    >
                      <Button kind={BUTTON_SIMPLE}>
                        View Satellite <Icon id="paginationArrowLeft" />
                      </Button>
                    </Link>
                  </div>
                ) : null}

                {/* <div
                  className={`block-name ${
                    vaultHasXtzCollateral || vaultHasSmvkCollateral ? 'margin-top-20' : 'margin-top'
                  }`}
                >
                  Permissions (Advanced)
                </div>
                <div className="bottom-info-row">
                  <div className="name">
                    Depositors{' '}
                    <CustomTooltip
                      iconId="info"
                      text="Depositors are tz and KT addresses that are allowed to deposit tokens and XTZ into your vault. For instance, if you delegate your XTZ to a bakery, you should add the bakery’s payout address as a a depositor so your vault can receive its delegation rewards."
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </div>
                  <div className="value">
                    {deporsitorsFlag === ANY_USER ? 'Allow Any' : null}
                    {deporsitorsFlag === NONE_USER ? 'Vault Owner' : null}
                    {deporsitorsFlag === WHITELIST_USERS ? 'Defined Accounts' : null}
                  </div>

                  <Button
                    kind={BUTTON_SIMPLE}
                    onClick={() =>
                      openManagePermissionsPopup?.({
                        vaultAddress: address,
                        deporsitorsFlag,
                        depositors,
                      })
                    }
                  >
                    Update <Icon id="paginationArrowLeft" />
                  </Button>
                </div>
                {vaultHasSmvkCollateral ? (
                  <div className="bottom-info-row">
                    <div className="name">
                      MVK Operators{' '}
                      <CustomTooltip
                        iconId="info"
                        text="MVK operators are tz or KT addresses that you allow to perform specific actions with your tokens. Only use this if you know exactly what you are doing. By default, you have to allow the vault to do an operator of your sMVK so it can execute its required functions."
                        defaultStrokeColor={colors[themeSelected].textColor}
                      />
                    </div>
                    <div className="value">
                      {mappedMVKOperators.firstAddress
                        ? <TzAddress tzAddress={mappedMVKOperators.firstAddress} type={BLUE} /> +
                          ` ${mappedMVKOperators.amount ?? ''}`
                        : 'None'}
                    </div>
                    <Button kind={BUTTON_SIMPLE} disabled onClick={() => openUpdateMvkOperatorsPopup?.({})}>
                      Update <Icon id="paginationArrowLeft" />
                    </Button>
                  </div>
                ) : null} */}

                <div className="repay-full">
                  <Button
                    disabled={true || !borrowedAmount}
                    isThin
                    kind={BUTTON_SECONDARY}
                    onClick={() =>
                      openRepayFullPopup?.({
                        vaultId,
                        vaultAddress: address,
                        borrowedAsset: borrowedAsset,
                        collateralRatio,
                        borrowedAmount,
                        feesAmount: fee,
                        minimumRepay,
                        currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                        borrowCapacity,
                      })
                    }
                  >
                    <Icon id="navigation-menu_close" /> Repay Loan in Full
                  </Button>
                </div>
              </>
            ) : null}
          </BorrowingTabListItemExpanded>
        )}
      </Expand>
    </div>
  )
}
