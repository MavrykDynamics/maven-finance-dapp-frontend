import { useEffect, useMemo, useRef, useState } from 'react'
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
import { api } from 'utils/api/api'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { isAbortError } from 'errors/error'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  getVaultBorrowCapacity,
  getVaultCollateralBalance,
  getVaultCollateralRatio,
  getVaultStatus,
} from 'providers/LoansProvider/helpers/vaults.utils'

type BorrowingExpandCardPropsType = {
  vault: LoansVaultType
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
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { bug } = useToasterContext()
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
  } = useLoansPopupsContext()

  const history = useHistory()
  const location = useLocation()

  const { isActionActive } = useSelector((state: State) => state.loading)
  const { loanTokens, mvkTokenOperators } = useSelector((state: State) => state.loans)

  const [activeRepayTab, setActiveRepayTab] = useState(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.active))
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const vaultAddress = params.get('vaultAddress')
  const isExpanded = vault.address === vaultAddress

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
    isActionActive

  const ref = useRef<HTMLDivElement | null>(null)
  useClickAway(ref, () => (notHandleClickAway ? null : handleCloseVault()))

  const vaultData = useMemo(() => {
    const {
      borrowedTokenAddress,
      collateralData,
      borrowedAmount,
      fee,
      liquidationRatio,
      availableLiquidity,
      ...restVault
    } = vault

    const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })

    if (!borrowedToken || !borrowedToken.rate) return null

    const { rate: borrowedTokenRate, decimals: borrowedTokenDecimals } = borrowedToken

    const convertedBorrowedAmount = convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals })
    const convertedFee = convertNumberForClient({ number: fee, grade: borrowedTokenDecimals })
    const convertedAvailableLiquidity = convertNumberForClient({
      number: availableLiquidity,
      grade: borrowedTokenDecimals,
    })
    const collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)
    const borrowCapacity = getVaultBorrowCapacity(
      convertedAvailableLiquidity * borrowedTokenRate,
      convertedBorrowedAmount * borrowedTokenRate,
      collateralBalance,
    )
    const collateralRatio = getVaultCollateralRatio(collateralBalance, convertedBorrowedAmount * borrowedTokenRate)
    const status = getVaultStatus(collateralRatio, convertedBorrowedAmount)

    return {
      status,
      collateralRatio,
      collateralBalance,
      collateralData,
      convertedBorrowedAmount,
      convertedAvailableLiquidity,
      borrowedTokenRate,
      borrowedTokenAddress,
      borrowedToken,
      borrowCapacity,
      convertedFee,
      ...restVault,
    }
  }, [vault, tokensMetadata, tokensPrices])

  useEffect(() => {
    if (activeRepayBorrowTabId !== loansTabNames.REPAY) return

    setActiveRepayTab(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.id === loansTabNames.REPAY_IN_PART))
  }, [activeRepayBorrowTabId])

  useEffect(() => {
    if (!vaultData) return

    const { status, levelOfEarly, levelOfLate } = vaultData

    if (isExpanded && (status === vaultsStatuses.GRACE_PERIOD || status === vaultsStatuses.LIQUIDATABLE)) {
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
  }, [vaultData, isExpanded, bug])

  if (!vaultData) return null

  const {
    borrowedToken,
    borrowedTokenAddress,
    address,
    name: vaultName,
    convertedBorrowedAmount,
    collateralBalance,
    borrowCapacity,
    collateralRatio,
    deporsitorsFlag,
    depositors,
    xtzDelegatedTo,
    sMVKDelegatedTo,
    collateralData,
    convertedFee,
    borrowedTokenRate,
    convertedAvailableLiquidity,
    status,
    apr,
    minimumRepay,
    vaultId,
  } = vaultData

  const { symbol: borrowedTokenSymbol, icon: borrowedTokenIcon, decimals: borrowedTokenDecimals } = borrowedToken

  const repayBorrowSlidingButtons = VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.map((item) => ({
    ...item,
    text: `${item.text} ${borrowedTokenSymbol}`,
  }))

  // use for borrow or repay
  // it scrolls until the current vault after the transaction and changing position
  const scrollToCurrentVault = () => scrollToFullView(ref.current, 'nearest')

  const mappedMVKOperators = {
    firstAddress: mvkTokenOperators?.[0],
    ...(mvkTokenOperators ? { amount: mvkTokenOperators.length } : {}),
  }

  const currentToken = loanTokens.find(({ loanTokenAddress }) => loanTokenAddress === borrowedTokenAddress)

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
        setActiveRepayBorrowTabId(repayBorrowSlidingButtons.find((item) => item.id === tabId)?.id)
        break
    }
  }

  const handleClickOpenChangeVaultNamePopup = () => {
    openChangeVaultNamePopup?.({
      vaultName,
      vaultAddress: address,
    })
  }

  const handleClickOpenConfirmBorrowPopup = (inputAmount: number) => {
    openConfirmBorrowPopup({
      inputAmount,
      vaultId: vault.vaultId,
      borrowedTokenMetadata: borrowedToken,
      borrowedAmount: convertedBorrowedAmount,
      collateralBalance,
      borrowCapacity,
      borrowedTokenRate,
      DAOFee,
      scrollToCurrentVault,
    })
  }

  const handleClickOpenConfirmRepayPopup = (inputAmount: number) => {
    openConfirmRepayPopup({
      inputAmount,
      vaultId: vault.vaultId,
      vaultAddress: vault.address,
      borrowedTokenMetadata: borrowedToken,
      borrowedAmount: convertedBorrowedAmount,
      collateralBalance,
      borrowCapacity,
      totalOutstanding: convertedFee + convertedBorrowedAmount,
      borrowedTokenRate,
      scrollToCurrentVault,
    })
  }

  const handleClickOpenConfirmRepayFullPopup = () => {
    openConfirmRepayFullPopup({
      vaultId: vault.vaultId,
      vaultAddress: vault.address,
      borrowedTokenMetadata: borrowedToken,
      borrowedAmount: convertedBorrowedAmount,
      collateralBalance,
      borrowCapacity,
      totalOutstanding: convertedBorrowedAmount + convertedFee,
      borrowedTokenRate,
    })
  }

  const handleClickOpenAddNewCollateralPopup = () => {
    openAddNewCollateralPopup({
      vaultAddress: vault.address,
      borrowedAmount: convertedBorrowedAmount,
      collateralBalance,
      collateralRatio,
      borrowedTokenRate,
      availableLiquidity: convertedAvailableLiquidity,
      borrowCapacity,
      collateralData: vault.collateralData,
    })
  }

  const handleClickOpenAddExistingCollateralPopup = (idx: number) => {
    openAddExistingCollateralPopup({
      vaultAddress: vault.address,
      borrowedAmount: convertedBorrowedAmount,
      collateralBalance,
      collateralRatio,
      borrowedTokenRate,
      availableLiquidity: convertedAvailableLiquidity,
      borrowCapacity,
      collateralTokenAddress: collateralData[idx].tokenAddress,
    })
  }

  const handleClickOpenWithdrawCollateralPopup = ({ amount, idx }: { amount: number; idx: number }) => {
    openWithdrawCollateralPopup({
      vaultAddress: vault.address,
      borrowedAmount: convertedBorrowedAmount,
      collateralBalance,
      collateralRatio,
      borrowedTokenRate,
      amountToWitdraw: amount,
      collateralTokenAddress: collateralData[idx].tokenAddress,
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
      tokenAddress: borrowedTokenAddress,
      operators: mvkTokenOperators,
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
                value={(convertedBorrowedAmount + convertedFee) * borrowedTokenRate}
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
                borrowedAmount={convertedBorrowedAmount}
                borrowCapacity={borrowCapacity}
                decimals={borrowedTokenDecimals}
                fee={convertedFee}
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
                    hasUserBorrowed={Boolean(convertedBorrowedAmount)}
                    borrowCapacity={borrowCapacity}
                    currentBorrowedAmount={convertedBorrowedAmount}
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
                    vaultAddress={address}
                    borrowedToken={borrowedToken}
                    borrowedTokenRate={borrowedTokenRate}
                    fee={convertedFee}
                    borrowedAmount={convertedBorrowedAmount}
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
                vaultAddress={address}
                xtzDelegatedTo={xtzDelegatedTo}
                sMVKDelegatedTo={sMVKDelegatedTo}
                collateralRatio={collateralRatio}
                collateralBalance={collateralBalance}
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
