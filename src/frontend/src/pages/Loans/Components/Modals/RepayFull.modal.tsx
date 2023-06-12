import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { RepayFullPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { State } from 'reducers'
import { repayFullAndCloseVaultAction } from 'pages/Loans/Actions/vault.actions'
import { BUTTON_SECONDARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber, formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { Info } from 'app/App.components/Info/Info.view'
import { INFO_ERROR } from 'app/App.components/Info/info.constants'
import { getCollateralRatio } from 'providers/LoansProvider/helpers/vaults.utils'
import { checkWhetherTokenIsLoanToken } from 'providers/TokensProvider/helpers/tokens.utils'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17953%3A224221&t=Sx2aEpp3ifrGxBtQ-0
export const RepayFull = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: RepayFullPopupDataType
}) => {
  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { userTokens } = useSelector((state: State) => state.wallet.user)

  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')

  useEffect(() => {
    if (!show) {
      setShownScreen('initial')
    }
  }, [show])

  if (!data) return null

  const {
    vault: {
      vaultId,
      minimumRepay,
      borrowedAmount,
      address: vaultAddress,
      fee,
      collateralBalance,
      totalOutstanding,
      borrowCapacity,
      borrowedTokenRate,
      borrowedTokenMetadata,
      collateralRatio,
    },
  } = data

  const { symbol } = borrowedTokenMetadata

  const futureCollateralRatio = getCollateralRatio(collateralBalance, 0, borrowedTokenRate),
    futureBorrowCapacity = Math.max(borrowCapacity + borrowedAmount, 0)

  // TODO: use user tokens balances
  const userAssetBalance = 0 //userTokens[balanceSymbol]?.balance ?? 0
  const canRepay = totalOutstanding <= userAssetBalance && totalOutstanding > minimumRepay

  const continueBtnHandler = () => setShownScreen('confitmation')
  const backBtnHandler = () => setShownScreen('initial')

  const repayBtnHandler = async () => {
    if (vaultId && vaultAddress && checkWhetherTokenIsLoanToken(borrowedTokenMetadata)) {
      await dispatch(
        repayFullAndCloseVaultAction(vaultId, vaultAddress, totalOutstanding, borrowedTokenMetadata, closePopup),
      )
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Repay in Full & Close Vault</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Fully repay the loan and close your vault. Your collateral will automatically be withdrawn to your wallet.
          </div>

          {screenShown === 'initial' ? (
            <>
              <div className="lending-stats" style={{ marginBottom: '25px' }}>
                <ThreeLevelListItem>
                  <div className="name">Borrowed</div>
                  <CommaNumber value={borrowedAmount} className="value" />
                  <CommaNumber value={borrowedAmount * borrowedTokenRate} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Fees Due</div>
                  <CommaNumber value={fee} className="value" />
                  <CommaNumber value={fee * borrowedTokenRate} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="left-divider">
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={totalOutstanding} className="value" />
                  <CommaNumber value={totalOutstanding * borrowedTokenRate} className="rate" beginningText="$" />
                </ThreeLevelListItem>
              </div>

              <ThreeLevelListItem>
                <div className="name">My Balance</div>
                <CommaNumber
                  value={userAssetBalance}
                  className={`value ${canRepay ? 'up' : 'down'}`}
                  endingText={symbol}
                />
              </ThreeLevelListItem>

              {canRepay ? (
                <div className="manage-btn">
                  <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={continueBtnHandler}>
                    Continue
                    <Icon id="arrowRight" />
                  </NewButton>
                </div>
              ) : (
                <>
                  <div className="repayFull-banner">
                    <Info
                      text={`To Repay in Full & Close Vault you need at least 
                      ${formatNumber({
                        decimalsToShow: 2,
                        number: totalOutstanding - userAssetBalance,
                      })} 
                      ${symbol ?? ''} on your balance`}
                      type={INFO_ERROR}
                    />
                  </div>

                  <div className="block-name" style={{ marginTop: '30px' }}>
                    Vault Stats
                  </div>
                  <VaultModalOverview>
                    <ThreeLevelListItem
                      className="collateral-diagram"
                      customColor={getCollateralRationPersent(collateralRatio)}
                    >
                      <div className={`percentage`}>
                        Collateral Ratio:{' '}
                        <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
                      </div>
                      <GradientDiagram
                        className="diagram"
                        colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                        currentPersentage={getCollateralRatioByPersentage(collateralRatio)}
                      />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Collateral Value</div>
                      <CommaNumber value={collateralBalance} className="value" beginningText="$" />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Borrow Capacity</div>
                      <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
                    </ThreeLevelListItem>
                  </VaultModalOverview>
                  <div className="manage-btn">
                    <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} disabled>
                      <Icon id="close" />
                      Repay And Close
                    </NewButton>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="lending-stats" style={{ marginBottom: '25px' }}>
                <ThreeLevelListItem>
                  <div className="name">Asset</div>
                  <div className="value">{symbol}</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount</div>
                  <CommaNumber value={totalOutstanding} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="right">
                  <div className="name">USD Value</div>
                  <CommaNumber value={totalOutstanding * borrowedTokenRate} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vault Stats</div>
              <VaultModalOverview>
                <ThreeLevelListItem
                  className="collateral-diagram"
                  customColor={getCollateralRationPersent(futureCollateralRatio)}
                >
                  <div className={`percentage`}>
                    Collateral Ratio:{' '}
                    <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
                  </div>
                  <GradientDiagram
                    className="diagram"
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={getCollateralRatioByPersentage(futureCollateralRatio)}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={collateralBalance} className="value" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available To Borrow</div>
                  <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              <div className="buttons-wrapper">
                <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backBtnHandler}>
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={repayBtnHandler}>
                  <Icon id="close" />
                  Repay And Close
                </NewButton>
              </div>
            </>
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
