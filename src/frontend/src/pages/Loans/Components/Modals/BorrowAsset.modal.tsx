import { useState } from 'react'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FillBlock, ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A240058&t=Sx2aEpp3ifrGxBtQ-0
export const BorrowAsset = ({ closePopup, show }: { closePopup: () => void; show: boolean }) => {
  const [inputAmount, setInputAmount] = useState('0')
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const isBorrowedAlready = false

  const continueBtnHandler = () => {
    setShownScreen('confitmation')
  }

  const backBtnHandler = () => {
    setShownScreen('initial')
  }

  const borrowAsserHandler = () => {}

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          {screenShown === 'initial' ? (
            <>
              <GovRightContainerTitleArea>
                {isBorrowedAlready ? <h2>Borrow Additional Asset</h2> : <h2>Borrow Asset</h2>}
              </GovRightContainerTitleArea>
              <div className="modalDescr">
                Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
              </div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">Borrow Capacity</div>
                  <CommaNumber value={0} className="value" endingText="mXTZ" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Utilization</div>
                  <CommaNumber value={0} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Borrow APR</div>
                  <CommaNumber value={0} className="value" endingText="%" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Select asset and amount to borrow</div>
              <Input
                className="withdrawCollateralInput"
                inputProps={{
                  value: inputAmount,
                  type: 'number',
                  onChange: (e) => setInputAmount(e.target.value),
                }}
                settings={{
                  balance: 1,
                  balanceAsset: 'XTZ',
                  useMaxHandler: () => setInputAmount('1000'),
                  inputStatus: '',
                  convertedValue: 1,
                }}
              >
                <InputPinnedTokenInfo>
                  <Icon id="xtzTezos" /> XTZ
                </InputPinnedTokenInfo>
              </Input>

              {isBorrowedAlready ? (
                <NewButton kind={ACTION_PRIMARY} onClick={borrowAsserHandler} className="modal-manage-btn">
                  <Icon id="coin-loan" />
                  Borrow Asset
                </NewButton>
              ) : (
                <NewButton kind={ACTION_PRIMARY} onClick={continueBtnHandler} className="modal-manage-btn">
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              )}
            </>
          ) : (
            <>
              <GovRightContainerTitleArea>
                <h2>Confirm Borrow XTZ</h2>
              </GovRightContainerTitleArea>
              <div className="modalDescr">
                Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
              </div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">Asset</div>
                  <div className="value">XTZ</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount</div>
                  <CommaNumber value={2.13} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">USD Value</div>
                  <CommaNumber value={2412} className="value" beginningText="$" />
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
                <NewButton kind={ACTION_PRIMARY} onClick={borrowAsserHandler} className="modal-manage-btn">
                  <Icon id="coin-loan" />
                  Borrow XTZ
                </NewButton>
              </div>
            </>
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
