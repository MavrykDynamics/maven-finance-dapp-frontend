import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { RepayFullPopupDataType } from './Modals.helpers'
import { State } from 'reducers'
import { repayFullAndCloseVaultAction } from 'pages/Loans/Actions/vault.actions'
import { BUTTON_SECONDARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber, formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { ConnectWalletInfoStyled } from 'app/App.components/ConnectWallet/ConnectWallet.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { calcCollateralRatio } from 'pages/Loans/Loans.helpers'

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
  const {
    vaultId,
    borrowedAsset,
    feesAmount = 0,
    currentCollateralBalance = 0,
    collateralRatio = 0,
    borrowCapacity = 0,
    borrowedAmount = 0,
  } = data ?? {}

  const totalOutstanding = feesAmount + Number(borrowedAmount)

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const canRepay = useMemo(
    () => totalOutstanding <= (borrowedAsset?.userBalance ?? 0),
    [borrowedAsset, totalOutstanding],
  )
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')

  useEffect(() => {
    if (!show) {
      setShownScreen('initial')
    }
  }, [show])

  const continueBtnHandler = () => setShownScreen('confitmation')
  const backBtnHandler = () => setShownScreen('initial')

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, 0, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = Math.max(borrowCapacity + borrowedAmount, 0)
    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, borrowCapacity, borrowedAmount])

  const repayBtnHandler = async () => {
    if (vaultId && borrowedAsset) {
      await dispatch(repayFullAndCloseVaultAction(vaultId, totalOutstanding, borrowedAsset.decimals, closePopup))
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
                  <CommaNumber value={borrowedAmount} className="value" endingText={borrowedAsset?.symbol} />
                  <CommaNumber
                    value={borrowedAmount * Number(borrowedAsset?.rate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Fees Due</div>
                  <CommaNumber value={feesAmount} className="value" endingText={borrowedAsset?.symbol} />
                  <CommaNumber value={feesAmount * Number(borrowedAsset?.rate)} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="left-divider">
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={totalOutstanding} className="value" endingText={borrowedAsset?.symbol} />
                  <CommaNumber
                    value={totalOutstanding * Number(borrowedAsset?.rate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <ThreeLevelListItem>
                <div className="name">My Balance</div>
                <CommaNumber
                  value={Number(borrowedAsset?.userBalance)}
                  className={`value ${canRepay ? 'up' : 'down'}`}
                  endingText={borrowedAsset?.symbol}
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
                  <ConnectWalletInfoStyled className="info error">
                    <Icon id="info" />{' '}
                    <p>
                      To Repay in Full & Close Vault you need at least{' '}
                      {formatNumber({
                        decimalsToShow: 2,
                        number: totalOutstanding - Number(borrowedAsset?.userBalance),
                      })}{' '}
                      {borrowedAsset?.symbol} on your Ballance
                    </p>
                  </ConnectWalletInfoStyled>

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
                    <ThreeLevelListItem>
                      <div className="name">Collateral Value</div>
                      <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
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
                  <div className="value">{borrowedAsset?.symbol}</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount</div>
                  <CommaNumber value={totalOutstanding} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="right">
                  <div className="name">USD Value</div>
                  <CommaNumber
                    value={totalOutstanding * Number(borrowedAsset?.rate)}
                    className="value"
                    beginningText="$"
                  />
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
                    <CommaNumber
                      beginningText={`${futureCollateralRatio > 250 ? '+' : ''}`}
                      value={Math.max(0, Math.min(futureCollateralRatio, 250))}
                      endingText="%"
                      showDecimal
                      decimalsToShow={2}
                    />
                  </div>
                  <GradientDiagram
                    className="diagram"
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={Math.max(0, Math.min(((futureCollateralRatio - 100) / 150) * 100, 100))}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
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
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={repayBtnHandler}
                  disabled={isActionLoading}
                >
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
