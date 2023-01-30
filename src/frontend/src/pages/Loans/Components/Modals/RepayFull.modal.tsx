import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import { repayFullAndCloseVaultAction } from 'pages/Loans/Loans.actions'
import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'
import { RepayFullPopupDataType } from './Modals.helpers'
import { getAssetName } from 'pages/Loans/Loans.helpers'
import { State } from 'reducers'
import { TRANSPARENT_WITH_BORDER, ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber, formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { ConnectWalletInfoStyled } from 'app/App.components/ConnectWallet/ConnectWallet.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'

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
    vaultAddress,
    borrowedAsset,
    feesAmount = 0,
    currentCollateralBalance = 0,
    currentAvaliableToBorrow = 0,
  } = data ?? {}

  const totalOutstanding = feesAmount + Number(borrowedAsset?.amtBorrowed)

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const assetName = getAssetName(borrowedAsset?.assetName ?? '')
  const canRepay = useMemo(() => totalOutstanding <= (borrowedAsset?.userBalance ?? 0), [borrowedAsset])
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')

  useEffect(() => {
    if (!show) {
      setShownScreen('initial')
    }
  }, [show])

  const continueBtnHandler = () => setShownScreen('confitmation')
  const backBtnHandler = () => setShownScreen('initial')

  const repayBtnHandler = async () => {
    if (vaultAddress) {
      await dispatch(repayFullAndCloseVaultAction(vaultAddress, totalOutstanding, closePopup))
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
                  <CommaNumber value={borrowedAsset?.amtBorrowed ?? 0} className="value" endingText={assetName} />
                  <CommaNumber
                    value={Number(borrowedAsset?.amtBorrowed) * Number(borrowedAsset?.assetRate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Fees Due</div>
                  <CommaNumber value={feesAmount} className="value" endingText={assetName} />
                  <CommaNumber
                    value={feesAmount * Number(borrowedAsset?.assetRate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="left-divider">
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={totalOutstanding} className="value" endingText={assetName} />
                  <CommaNumber
                    value={totalOutstanding * Number(borrowedAsset?.assetRate)}
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
                  endingText={assetName}
                />
              </ThreeLevelListItem>

              {canRepay ? (
                <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={continueBtnHandler} className="modal-manage-btn">
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              ) : (
                <>
                  <ConnectWalletInfoStyled className="info error">
                    <Icon id="info" />{' '}
                    <p>
                      To Repay in Full & Close Vault you need at least{' '}
                      {formatNumber({
                        showDecimal: true,
                        decimalsToShow: 2,
                        number: totalOutstanding - Number(borrowedAsset?.userBalance),
                      })}{' '}
                      {assetName} on your Ballance
                    </p>
                  </ConnectWalletInfoStyled>

                  <div className="block-name" style={{ marginTop: '30px' }}>
                    Vault Stats
                  </div>
                  <VaultModalOverview>
                    <ThreeLevelListItem className="collateral-diagram">
                      <div className={`percentage ${Number(154) / 100 > 2.5 ? 'up' : 'down'}`}>
                        Collateral Ratio: <CommaNumber value={154} endingText="%" />
                      </div>
                      <GradientDiagram
                        className="diagram"
                        colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                        currentPersentage={50}
                      />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Collateral Value</div>
                      <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Borrow Capacity</div>
                      <CommaNumber value={currentAvaliableToBorrow} className="value" beginningText="$" />
                    </ThreeLevelListItem>
                  </VaultModalOverview>
                  <NewButton kind={TRANSPARENT_WITH_BORDER} className="modal-manage-btn" disabled>
                    <Icon id="close" />
                    Repay And Close
                  </NewButton>
                </>
              )}
            </>
          ) : (
            <>
              <div className="lending-stats" style={{ marginBottom: '25px' }}>
                <ThreeLevelListItem>
                  <div className="name">Asset</div>
                  <div className="value">{assetName}</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount</div>
                  <CommaNumber value={totalOutstanding} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="right">
                  <div className="name">USD Value</div>
                  <CommaNumber
                    value={totalOutstanding * Number(borrowedAsset?.assetRate)}
                    className="value"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vault Stats</div>
              <VaultModalOverview>
                <ThreeLevelListItem className="collateral-diagram">
                  <div className={`percentage ${Number(154) / 100 > 2.5 ? 'up' : 'down'}`}>
                    Collateral Ratio: <CommaNumber value={154} endingText="%" />
                  </div>
                  <GradientDiagram
                    className="diagram"
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={50}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available To Borrow</div>
                  <CommaNumber value={currentAvaliableToBorrow} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              <div className="buttons-wrapper">
                <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={backBtnHandler} className="modal-manage-btn">
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton
                  kind={ACTION_PRIMARY}
                  onClick={repayBtnHandler}
                  disabled={isActionLoading}
                  className="modal-manage-btn"
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
