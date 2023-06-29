import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import classNames from 'classnames'
import { State } from 'reducers'

import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
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
import { loansPopupsContext } from '../Modals/LoansModals.provider'

import { scrollToFullView } from 'utils/scrollToFullView'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import {
  COLLATERAL_RATIO_GRADIENT,
  VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS,
  VAULT_CARD_REPAY_SLIDING_BUTTONS,
  getCollateralRationPersent,
  getStatusByCollateralRatio,
  loansTabNames,
} from 'pages/Loans/Loans.const'
import ExpandSimple from 'app/App.components/Expand/ExpandSimple.view'
import { useHistory, useLocation } from 'react-router'
import { api } from 'utils/api/api'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { isAbortError } from 'errors/error'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

type BorrowingExpandCardPropsType = LoansVaultType & {
  isOwner?: boolean
  headerSufix?: React.ReactNode
  children?: React.ReactNode
  status?: string
  DAOFee: number
  hideTransactionHistory?: boolean
}

export const BorrowingExpandCard = ({
  isOwner = false,
  borrowedAsset,
  collateralData,
  xtzDelegatedTo,
  sMVKDelegatedTo,
  vaultId,
  name,
  depositors,
  deporsitorsFlag,
  headerSufix,
  address,
  children,
  status,
  levelOfEarly,
  levelOfLate,
  fee,
  apr,
  collateralBalance,
  borrowedAmount,
  collateralRatio,
  borrowCapacity,
  availableLiquidity,
  minimumRepay,
  DAOFee,
  hideTransactionHistory,
}: BorrowingExpandCardPropsType) => {
  const history = useHistory()
  const location = useLocation()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const vaultAddress = params.get('vaultAddress')

  const { gqlName, symbol, icon, rate = 1 } = borrowedAsset

  const { bug } = useToasterContext()

  const { loanTokens, mvkTokenOperators } = useSelector((state: State) => state.loans)

  const repayBorrowSlidingButtons = useMemo(
    () =>
      VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.map((item) => ({
        ...item,
        text: `${item.text} ${borrowedAsset?.symbol}`,
      })),
    [borrowedAsset?.symbol],
  )

  const { isActionActive } = useSelector((state: State) => state.loading)
  const isExpanded = address === vaultAddress

  const [activeRepayBorrowTab, setActiveRepayBorrowTab] = useState(
    repayBorrowSlidingButtons.find((item) => item.active),
  )
  const [activeRepayTab, setActiveRepayTab] = useState(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.active))

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
    repayPartPopup,
    repayFullPopup,
    borrowAssetPopup,
    addExistingCollateralPopup,
    addNewCollateralPopup,
    withdrawCollateralPopup,
    updateMvkOperatorPopup,
    managePermissionsPopup,
    liquidateVaultPopup,
    createVaultPopup,
  } = useContext(loansPopupsContext)

  const notHandleClickAway =
    changeVaultNamePopup.showModal ||
    confirmBorrowAssetPopup.showModal ||
    confirmRepayFullPopup.showModal ||
    confirmRepayPartPopup.showModal ||
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
    createVaultPopup.showModal ||
    isActionActive

  const ref = useRef<HTMLDivElement | null>(null)
  useClickAway(ref, () => (notHandleClickAway ? null : handleCloseVault()))

  // use for borrow or repay
  // it scrolls until the current vault after the transaction and changing position
  const scrollToCurrentVault = () => {
    scrollToFullView(ref.current, 'nearest')
  }

  const mappedMVKOperators = {
    firstAddress: mvkTokenOperators?.[0],
    ...(mvkTokenOperators ? { amount: mvkTokenOperators.length } : {}),
  }

  const vaultStatus = status ?? getStatusByCollateralRatio(collateralRatio)
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const currentToken = useMemo(() => {
    return loanTokens.find(({ loanTokenData }) => loanTokenData.symbol === symbol)
  }, [symbol, loanTokens])

  const handleOpenVault = () => {
    if (isExpanded) return

    params.append('vaultAddress', address)
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
        setActiveRepayBorrowTab(repayBorrowSlidingButtons.find((item) => item.id === tabId))
        break
    }
  }

  const handleClickOpenChangeVaultNamePopup = () => {
    openChangeVaultNamePopup?.({
      vaultName: name,
      vaultAddress: address,
    })
  }

  const handleClickOpenConfirmBorrowPopup = (inputAmount: number) => {
    openConfirmBorrowPopup?.({
      inputAmount,
      vaultId,
      borrowedAsset: borrowedAsset,
      currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
      borrowCapacity,
      currentBorrowedAmount: borrowedAmount,
      DAOFee,
      scrollToCurrentVault,
    })
  }

  const handleClickOpenConfirmRepayPopup = (inputAmount: number) => {
    openConfirmRepayPopup?.({
      inputAmount,
      vaultId,
      vaultAddress: address,
      borrowedAsset: borrowedAsset,
      borrowedAmount,
      currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
      borrowCapacity,
      scrollToCurrentVault,
    })
  }

  const handleClickOpenConfirmRepayFullPopup = () => {
    openConfirmRepayFullPopup?.({
      vaultId,
      vaultAddress: address,
      borrowedAsset: borrowedAsset,
      borrowedAmount,
      feesAmount: fee,
      currentCollateralBalance: collateralData.at(-1)?.amount ?? 0,
      borrowCapacity,
    })
  }

  const handleClickOpenAddNewCollateralPopup = () => {
    openAddNewCollateralPopup?.({
      vaultAddress: address,
      vaultId,
      vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
      currentCollateralRatio: collateralRatio,
      borrowedAmount,
      existingCollaterals: collateralData,
      borrowedAssetRate: borrowedAsset.rate,
      borrowCapacity,
      availableLiquidity,
    })
  }

  const handleClickOpenAddExistingCollateralPopup = (idx: number) => {
    openAddExistingCollateralPopup?.({
      vaultAddress: address,
      vaultId,
      vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
      selectedAsset: collateralData[idx],
      currentCollateralRatio: collateralRatio,
      borrowedAmount,
      borrowedAssetRate: borrowedAsset.rate,
      borrowCapacity,
      availableLiquidity,
    })
  }

  const handleClickOpenWithdrawCollateralPopup = ({ amount, idx }: { amount: number; idx: number }) => {
    openWithdrawCollateralPopup?.({
      vaultAddress: address,
      vaultId,
      currentCollateralBalance: amount,
      vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
      selectedAsset: collateralData[idx],
      currentCollateralRatio: collateralRatio,
      borrowedAmount,
      borrowedAssetRate: borrowedAsset.rate,
    })
  }

  const handleClickOpenChangeBakerPopup = () => {
    openChangeBakerPopup?.({
      bakerAddress: xtzDelegatedTo,
      vaultAddress: address,
    })
  }

  const handleClickOpenManagePermissionsPopup = () => {
    openManagePermissionsPopup?.({
      vaultAddress: address,
      deporsitorsFlag,
      depositors,
    })
  }

  const handleClickOpenUpdateMvkOperatorsPopup = () => {
    openUpdateMvkOperatorsPopup?.({
      vaultAddress: address,
      tokenName: gqlName,
      operators: mvkTokenOperators,
    })
  }

  useEffect(() => {
    if (activeRepayBorrowTab?.id !== loansTabNames.REPAY) return

    setActiveRepayTab(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.id === loansTabNames.REPAY_IN_PART))
  }, [activeRepayBorrowTab])

  useEffect(() => {
    if (isExpanded && (vaultStatus === vaultsStatuses.GRACE_PERIOD || vaultStatus === vaultsStatuses.LIQUIDATABLE)) {
      if (!levelOfEarly || !levelOfLate) return

      const abortEarlyController = new AbortController()
      const abortLatelyController = new AbortController()

      ;(async () => {
        try {
          const [{ data: timestampOfEarly }, { data: timestampOfLate }] = await Promise.all([
            api(
              getTimestampByLevelUrl(levelOfEarly),
              { signal: abortEarlyController.signal, headers: getTimestampByLevelHeaders },
              getTimestampByLevelSchema,
            ),
            api(
              getTimestampByLevelUrl(levelOfLate),
              { signal: abortLatelyController.signal, headers: getTimestampByLevelHeaders },
              getTimestampByLevelSchema,
            ),
          ])

          const timestamp =
            new Date(timestampOfEarly).getTime() - new Date(timestampOfLate).getTime() + new Date().getTime()

          setTimerTimestamp(timestamp)
        } catch (e) {
          // TODO: handle fetch errors when error boundary will be ready
          if (!isAbortError(e)) {
            console.error('getting timestamp by lvl error: ', e)
          }
          bug('Unexpected error happened occured, please reload the page')
        }
      })()

      return () => {
        abortEarlyController.abort()
        abortLatelyController.abort()
      }
    }

    return () => {}
  }, [vaultStatus, levelOfEarly, levelOfLate, isExpanded])

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
              <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} />
              <div className="data">
                <div className="value">{name ? name : borrowedAsset.symbol}</div>
                <div className="value">
                  <TzAddress tzAddress={address} shouldCopy hasIcon />
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
                value={(borrowedAmount + fee) * rate}
                beginningText="$"
                className="value"
                showDecimal
                decimalsToShow={borrowedAsset.decimals}
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
            {vaultStatus && <StatusMessage status={vaultStatus} timestamp={timerTimestamp} />}

            <div className="stats-and-actions">
              <BorrowingExpandCardValuesSection
                collateralRatio={collateralRatio}
                collateralBalance={collateralBalance}
                borrowedAmount={borrowedAmount}
                borrowCapacity={borrowCapacity}
                decimals={borrowedAsset.decimals}
                fee={fee}
                apr={apr}
                rate={rate}
              />

              <LoansActionsSection className="borrowing-tab">
                <div className="switchers">
                  <SlidingTabButtons
                    onClick={handleSwitchTab('repayAndBorrow')}
                    tabItems={repayBorrowSlidingButtons}
                    className="vault"
                  />
                  {activeRepayBorrowTab?.id === loansTabNames.REPAY && (
                    <SlidingTabButtons
                      onClick={handleSwitchTab('repay')}
                      tabItems={VAULT_CARD_REPAY_SLIDING_BUTTONS}
                      className="vault"
                    />
                  )}
                </div>

                {activeRepayBorrowTab?.id === loansTabNames.BORROW && (
                  <BorrowingExpandCardBorrowSection
                    borrowedAsset={borrowedAsset}
                    borrowAPR={apr}
                    currentCollateralBalance={collateralData.at(-1)?.amount ?? 0}
                    hasUserBorrowed={Boolean(borrowedAmount)}
                    borrowCapacity={borrowCapacity}
                    currentBorrowedAmount={borrowedAmount}
                    DAOFee={DAOFee}
                    openConfirmBorrowPopup={handleClickOpenConfirmBorrowPopup}
                  />
                )}

                {activeRepayBorrowTab?.id === loansTabNames.REPAY && (
                  <BorrowingExpandCardRepaySection
                    vaultId={vaultId}
                    borrowedAsset={borrowedAsset}
                    currentCollateralBalance={collateralData.at(-1)?.amount ?? 0}
                    borrowCapacity={borrowCapacity}
                    vaultAddress={address}
                    borrowedAmount={borrowedAmount}
                    feesAmount={fee}
                    minimumRepay={minimumRepay}
                    activeRepayTab={activeRepayTab}
                    openConfirmRepayPopup={handleClickOpenConfirmRepayPopup}
                    openConfirmRepayFullPopup={handleClickOpenConfirmRepayFullPopup}
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
                vaultName={name}
                vaultAddress={address}
                xtzDelegatedTo={xtzDelegatedTo}
                sMVKDelegatedTo={sMVKDelegatedTo}
                collateralRatio={collateralRatio}
                deporsitorsFlag={deporsitorsFlag}
                mappedMVKOperators={mappedMVKOperators}
                hideTransactionHistory={hideTransactionHistory}
              />
            )}
          </BorrowingExpandedCard>
        )}
      </ExpandSimple>
    </div>
  )
}
