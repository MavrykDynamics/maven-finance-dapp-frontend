import { useState } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ThreeLevelListItem, FillBlock } from 'pages/Loans/Loans.style'
import { TzAddress } from 'pages/Treasury/Treasury.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239476&t=Sx2aEpp3ifrGxBtQ-0
export const AddCollateral = ({ closePopup, show }: { closePopup: () => void; show: boolean }) => {
  const addCollateralHandler = () => {}

  const [inputAmount, setInputAmount] = useState('0')
  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />
          <GovRightContainerTitleArea>
            <h2>Add Collateral To Vault</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Select one or multiple assets to add as collateral to the vault.</div>

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
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={0} className="value" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <hr />

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

          <div className="block-name">New Vault Status</div>
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
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={0} className="value" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <NewButton kind={ACTION_PRIMARY} onClick={addCollateralHandler} className="modal-manage-btn">
            <Icon id="minus" />
            Remove
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
