import { useState } from 'react'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TRANSPARENT_WITH_BORDER, ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { ConnectWalletInfoStyled } from 'app/App.components/ConnectWallet/ConnectWallet.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FillBlock, ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17953%3A224221&t=Sx2aEpp3ifrGxBtQ-0
export const RepayAndCloseVault = ({ closePopup, show }: { closePopup: () => void; show: boolean }) => {
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const canRepay = false

  const continueBtnHandler = () => {
    setShownScreen('confitmation')
  }

  const backBtnHandler = () => {
    setShownScreen('initial')
  }

  const closeVaultHandler = () => {}

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
                  <CommaNumber value={2412} className="value" endingText="mXTZ" />
                  <CommaNumber value={2412} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Fees Due</div>
                  <CommaNumber value={2.13} className="value" endingText="%" />
                  <CommaNumber value={2412} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="left-divider">
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={2412} className="value" beginningText="$" />
                  <CommaNumber value={2412} className="rate" beginningText="$" />
                </ThreeLevelListItem>
              </div>

              <ThreeLevelListItem>
                <div className="name">My Balance</div>
                <CommaNumber value={2412} className="value" beginningText="$" />
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
                    <p>To Repay in Full & Close Vault you need at least 1389.84 XTZ on your Ballance</p>
                  </ConnectWalletInfoStyled>

                  <div className="block-name" style={{ marginTop: '30px' }}>
                    Vault Stats
                  </div>
                  <VaultModalOverview>
                    <ThreeLevelListItem className="collateral-diagram">
                      <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
                      <FillBlock width={75} className={'diagram'}>
                        <div className="colored"></div>
                      </FillBlock>
                      <div className="info-tip">
                        Collateral Utilization:
                        <span>
                          <CommaNumber value={0} endingText="%" />
                        </span>
                      </div>
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Collateral Value</div>
                      <CommaNumber value={0} className="value" />
                      {false ? <CommaNumber value={0} beginningText="$" className="rate" /> : null}
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Available To Borrow</div>
                      <CommaNumber value={0} className="value" />
                    </ThreeLevelListItem>
                  </VaultModalOverview>
                  <NewButton
                    kind={TRANSPARENT_WITH_BORDER}
                    onClick={closeVaultHandler}
                    className="modal-manage-btn"
                    disabled
                  >
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
                  <div className="name">Borrowed</div>
                  <CommaNumber value={2412} className="value" endingText="mXTZ" />
                  <CommaNumber value={2412} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Fees Due</div>
                  <CommaNumber value={2.13} className="value" endingText="%" />
                  <CommaNumber value={2412} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={2412} className="value" beginningText="$" />
                  <CommaNumber value={2412} className="rate" beginningText="$" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vault Stats</div>
              <VaultModalOverview>
                <ThreeLevelListItem className="collateral-diagram">
                  <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
                  <FillBlock width={75} className={'diagram'}>
                    <div className="colored"></div>
                  </FillBlock>
                  <div className="info-tip">
                    Collateral Utilization:
                    <span>
                      <CommaNumber value={0} endingText="%" />
                    </span>
                  </div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={0} className="value" />
                  {false ? <CommaNumber value={0} beginningText="$" className="rate" /> : null}
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available To Borrow</div>
                  <CommaNumber value={0} className="value" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              <div className="buttons-wrapper">
                <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={backBtnHandler} className="modal-manage-btn">
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton kind={ACTION_PRIMARY} onClick={closeVaultHandler} className="modal-manage-btn">
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
