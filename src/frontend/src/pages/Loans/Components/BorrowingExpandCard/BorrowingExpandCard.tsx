import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import classNames from 'classnames'
import { State } from 'reducers'

import { StatusMessage } from '../StatusMessage.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { BorrowingExpandCardMenuSection } from './BorrowingExpandCardMenuSection.view'
import { BorrowingExpandCardValuesSection } from './BorrowingExpandCardValuesSection.view'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { BorrowingExpandCardBorrowSection } from './BorrowingExpandCardBorrowSection.view'
import { BorrowingExpandCardRepaySection } from './BorrowingExpandCardRepaySection.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

import { ThreeLevelListItem } from '../../Loans.style'
import { LoansActionsSection, BorrowingExpandedCard } from '../LoansComponents.style'

import { scrollToFullView } from 'utils/scrollToFullView'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import {
  COLLATERAL_RATIO_GRADIENT,
  VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS,
  VAULT_CARD_REPAY_SLIDING_BUTTONS,
  getCollateralRationPersent,
  loansTabNames,
} from 'pages/Loans/Loans.const'
import ExpandSimple from 'app/App.components/Expand/ExpandSimple.view'
import { useHistory, useLocation } from 'react-router'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { VaultType } from 'providers/VaultsProvider/vaults.provider.types'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

type BorrowingExpandCardPropsType = {
  vault: VaultType
  isOwner?: boolean
  headerSufix?: React.ReactNode
  children?: React.ReactNode
  status?: string
  DAOFee: number
  hideTransactionHistory?: boolean
}

export const BorrowingExpandCard = ({
  vault,
  isOwner = false,
  headerSufix,
  children,
  DAOFee,
  hideTransactionHistory,
}: BorrowingExpandCardPropsType) => {
  const {
    openChangeVaultNamePopup,
    openConfirmBorrowPopup,
    openConfirmRepayPopup,
    openConfirmRepayFullPopup,
    openChangeBakerPopup,
    openAddExistingCollateralPopup,
    openAddNewCollateralPopup,
    openManagePermissionsPopup,
    openUpdateMvkOperatorsPopup,
    openWithdrawCollateralPopup,
    confirmBorrowAssetPopup,
    confirmRepayFullPopup,
    confirmRepayPartPopup,
    changeVaultNamePopup,
    changeBakerPopup,
    borrowAssetPopup,
    addExistingCollateralPopup,
    addNewCollateralPopup,
    withdrawCollateralPopup,
    updateMvkOperatorPopup,
    managePermissionsPopup,
    liquidateVaultPopup,
    createVaultPopup,
  } = useLoansPopupsContext()
  const { marketsMapper } = useLoansContext()

  const history = useHistory()
  const location = useLocation()

  const { isActionActive } = useSelector((state: State) => state.loading)

  const [activeRepayTab, setActiveRepayTab] = useState(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.active))
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const paramsVaultAddress = params.get('vaultAddress')
  const isExpanded = vault.address === paramsVaultAddress

  const [activeRepayBorrowTabId, setActiveRepayBorrowTabId] = useState(
    VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.find((item) => item.active)?.id,
  )

  const notHandleClickAway =
    changeVaultNamePopup.showModal ||
    confirmBorrowAssetPopup.showModal ||
    confirmRepayFullPopup.showModal ||
    confirmRepayPartPopup.showModal ||
    changeBakerPopup.showModal ||
    borrowAssetPopup.showModal ||
    addExistingCollateralPopup.showModal ||
    addNewCollateralPopup.showModal ||
    withdrawCollateralPopup.showModal ||
    updateMvkOperatorPopup.showModal ||
    managePermissionsPopup.showModal ||
    liquidateVaultPopup.showModal ||
    createVaultPopup.showModal ||
    isActionActive

  const ref = useRef<HTMLDivElement | null>(null)
  useClickAway(ref, () => (notHandleClickAway ? null : handleCloseVault()))

  const vaultData = useFullVault(vault)

  useEffect(() => {
    if (activeRepayBorrowTabId !== loansTabNames.REPAY) return

    setActiveRepayTab(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.id === loansTabNames.REPAY_IN_PART))
  }, [activeRepayBorrowTabId])

  useEffect(() => {
    if (
      vaultData?.liquidationTimestamp &&
      isExpanded &&
      (vaultData.status === vaultsStatuses.GRACE_PERIOD || vaultData.status === vaultsStatuses.LIQUIDATABLE)
    ) {
      setTimerTimestamp(new Date(vaultData?.liquidationTimestamp).getTime())
    }
  }, [vaultData, isExpanded])

  if (!vaultData) return null

  const {
    borrowedToken,
    borrowedTokenAddress,
    address: vaultAddress,
    name: vaultName,
    borrowedAmount,
    collateralBalance,
    borrowCapacity,
    collateralRatio,
    deporsitorsFlag,
    depositors,
    xtzDelegatedTo,
    sMVKDelegatedTo,
    collateralData,
    fee,
    availableLiquidity,
    totalOutstanding,
    status,
    apr,
    minimumRepay,
    vaultId,
  } = vaultData

  const {
    symbol: borrowedTokenSymbol,
    icon: borrowedTokenIcon,
    decimals: borrowedTokenDecimals,
    rate: borrowedTokenRate,
  } = borrowedToken

  const repayBorrowSlidingButtons = VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.map((item) => ({
    ...item,
    text: `${item.text} ${borrowedTokenSymbol}`,
  }))

  // use for borrow or repay
  // it scrolls until the current vault after the transaction and changing position
  const scrollToCurrentVault = () => scrollToFullView(ref.current, 'nearest')

  const currentToken = marketsMapper[borrowedTokenAddress]

  const handleOpenVault = () => {
    if (isExpanded) return

    params.append('vaultAddress', vaultAddress)
    history.replace({ ...location, search: params.toString() })
  }

  const handleCloseVault = () => {
    if (!isExpanded) return

    params.delete('vaultAddress')
    history.replace({ ...location, search: params.toString() })
  }

  const handleClickExpand = () => {
    isExpanded ? handleCloseVault() : handleOpenVault()
  }

  const handleSwitchTab = (switcher: 'repay' | 'repayAndBorrow') => (tabId: number) => {
    switch (switcher) {
      case 'repay':
        setActiveRepayTab(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.id === tabId))
        break
      case 'repayAndBorrow':
        setActiveRepayBorrowTabId(repayBorrowSlidingButtons.find((item) => item.id === tabId)?.id)
        break
    }
  }

  const handleClickOpenChangeVaultNamePopup = () => {
    openChangeVaultNamePopup?.({
      vaultName,
      vaultAddress,
    })
  }

  const handleClickOpenConfirmBorrowPopup = (inputAmount: number, clearInputData: () => void) => {
    openConfirmBorrowPopup({
      inputAmount,
      vaultId,
      tokenAddress: borrowedTokenAddress,
      borrowedAmount,
      collateralBalance,
      borrowCapacity,
      DAOFee,
      callback: () => {
        scrollToCurrentVault()
        clearInputData()
      },
    })
  }

  const handleClickOpenConfirmRepayPopup = (inputAmount: number, clearInputData: () => void) => {
    openConfirmRepayPopup({
      inputAmount,
      vaultId,
      vaultAddress,
      tokenAddress: borrowedTokenAddress,
      borrowedAmount,
      collateralBalance,
      borrowCapacity,
      totalOutstanding,
      callback: () => {
        scrollToCurrentVault()
        clearInputData()
      },
    })
  }

  const handleClickOpenConfirmRepayFullPopup = (clearInputData: () => void) => {
    openConfirmRepayFullPopup?.({
      vaultId,
      vaultAddress,
      tokenAddress: borrowedTokenAddress,
      borrowedAmount,
      collateralBalance,
      borrowCapacity,
      totalOutstanding,
      callback: () => {
        scrollToCurrentVault()
        clearInputData()
      },
    })
  }

  const handleClickOpenAddNewCollateralPopup = () => {
    openAddNewCollateralPopup({
      vaultAddress,
      vaultId,
      borrowedAmount,
      collateralBalance,
      collateralRatio,
      borrowedTokenAddress,
      availableLiquidity,
      borrowCapacity,
      collateralData: vault.collateralData,
    })
  }

  const handleClickOpenAddExistingCollateralPopup = (idx: number) => {
    openAddExistingCollateralPopup({
      vaultAddress,
      vaultId,
      borrowedAmount,
      collateralBalance,
      collateralRatio,
      borrowedTokenAddress,
      availableLiquidity,
      borrowCapacity,
      collateralTokenAddress: collateralData[idx].tokenAddress,
    })
  }

  const handleClickOpenWithdrawCollateralPopup = ({ amount, idx }: { amount: number; idx: number }) => {
    openWithdrawCollateralPopup({
      vaultAddress,
      vaultId,
      borrowedAmount,
      collateralBalance,
      collateralRatio,
      borrowedTokenAddress,
      amountToWitdraw: amount,
      collateralTokenAddress: collateralData[idx].tokenAddress,
    })
  }

  const handleClickOpenChangeBakerPopup = () => {
    openChangeBakerPopup?.({
      bakerAddress: xtzDelegatedTo,
      vaultAddress,
    })
  }

  const handleClickOpenManagePermissionsPopup = () => {
    openManagePermissionsPopup?.({
      vaultAddress,
      deporsitorsFlag,
      depositors,
    })
  }

  const handleClickOpenUpdateMvkOperatorsPopup = () => {
    openUpdateMvkOperatorsPopup?.({
      vaultAddress,
      tokenAddress: borrowedTokenAddress,
      // TODO add data to this popup
      operators: {} as any,
    })
  }

  return (
    <div ref={ref}>
      <ExpandSimple
        isExpanded={isExpanded}
        onClick={handleClickExpand}
        openButtonName="View"
        className={classNames('expand-borrow-tab', { 'expanded-card': isExpanded })}
        sufix={headerSufix}
        header={
          <>
            <ThreeLevelListItem className="borrow-asset-header">
              <ImageWithPlug imageLink={borrowedTokenIcon} alt={`${borrowedTokenSymbol} icon`} />
              <div className="data">
                <div className="value">{vaultName ? vaultName : borrowedTokenSymbol}</div>
                <div className="value">
                  <TzAddress tzAddress={vaultAddress} shouldCopy hasIcon />
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
                currentPersentage={getCollateralRatioByPersentage(collateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Outstanding Debt</div>
              <CommaNumber
                value={totalOutstanding * borrowedTokenRate}
                beginningText="$"
                className="value"
                showDecimal
                decimalsToShow={borrowedTokenDecimals}
              />
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
          <BorrowingExpandedCard>
            {status && <StatusMessage status={status} timestamp={timerTimestamp} />}

            <div className="stats-and-actions">
              <BorrowingExpandCardValuesSection
                collateralRatio={collateralRatio}
                collateralBalance={collateralBalance}
                borrowedAmount={borrowedAmount}
                borrowCapacity={borrowCapacity}
                decimals={borrowedTokenDecimals}
                fee={fee}
                apr={apr}
                rate={borrowedTokenRate}
              />

              <LoansActionsSection className="borrowing-tab">
                <div className="switchers">
                  <SlidingTabButtons
                    onClick={handleSwitchTab('repayAndBorrow')}
                    tabItems={repayBorrowSlidingButtons}
                    className="vault"
                  />
                  {activeRepayBorrowTabId === loansTabNames.REPAY && (
                    <SlidingTabButtons
                      onClick={handleSwitchTab('repay')}
                      tabItems={VAULT_CARD_REPAY_SLIDING_BUTTONS}
                      className="vault"
                    />
                  )}
                </div>

                {activeRepayBorrowTabId === loansTabNames.BORROW && (
                  <BorrowingExpandCardBorrowSection
                    borrowedAssetAddress={borrowedTokenAddress}
                    borrowAPR={apr}
                    currentCollateralBalance={collateralBalance}
                    hasUserBorrowed={Boolean(borrowedAmount)}
                    borrowCapacity={borrowCapacity}
                    currentBorrowedAmount={borrowedAmount}
                    DAOFee={DAOFee}
                    openConfirmBorrowPopup={handleClickOpenConfirmBorrowPopup}
                  />
                )}

                {activeRepayBorrowTabId === loansTabNames.REPAY && (
                  <BorrowingExpandCardRepaySection
                    activeRepayTab={activeRepayTab}
                    openConfirmRepayPopup={handleClickOpenConfirmRepayPopup}
                    openConfirmRepayFullPopup={handleClickOpenConfirmRepayFullPopup}
                    vaultId={vaultId}
                    vaultAddress={vaultAddress}
                    borrowedToken={borrowedToken}
                    borrowedTokenRate={borrowedTokenRate}
                    fee={fee}
                    borrowedAmount={borrowedAmount}
                    minimumRepay={minimumRepay}
                    collateralBalance={collateralBalance}
                    borrowCapacity={borrowCapacity}
                  />
                )}
              </LoansActionsSection>
            </div>

            {currentToken && (
              <BorrowingExpandCardMenuSection
                openAddNewCollateralPopup={handleClickOpenAddNewCollateralPopup}
                openAddExistingCollateralPopup={handleClickOpenAddExistingCollateralPopup}
                openWithdrawCollateralPopup={handleClickOpenWithdrawCollateralPopup}
                openChangeBakerPopup={handleClickOpenChangeBakerPopup}
                openManagePermissionsPopup={handleClickOpenManagePermissionsPopup}
                openUpdateMvkOperatorsPopup={handleClickOpenUpdateMvkOperatorsPopup}
                openChangeVaultNamePopup={handleClickOpenChangeVaultNamePopup}
                collateralData={collateralData}
                currentToken={currentToken}
                isOwner={isOwner}
                vaultName={vaultName}
                vaultAddress={vaultAddress}
                xtzDelegatedTo={xtzDelegatedTo}
                sMVKDelegatedTo={sMVKDelegatedTo}
                collateralRatio={collateralRatio}
                collateralBalance={collateralBalance}
                deporsitorsFlag={deporsitorsFlag}
                hideTransactionHistory={hideTransactionHistory}
              />
            )}
          </BorrowingExpandedCard>
        )}
      </ExpandSimple>
    </div>
  )
}
