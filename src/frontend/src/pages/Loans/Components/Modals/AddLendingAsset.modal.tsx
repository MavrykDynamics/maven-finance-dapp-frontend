import { useState } from 'react'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { silverColor } from 'styles'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239981&t=Sx2aEpp3ifrGxBtQ-0
export const AddLendingAsset = ({ closePopup, show }: { closePopup: () => void; show: boolean }) => {
  const [inputAmount, setInputAmount] = useState('0')

  const continueBtnHandler = () => {}

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Supplying Assets to Lending</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Earn yield by depositing assets to Mavryk’s lending pools. Loans are secured by 200% collateral. Supplied
            XTZ is automatically delegated to the Mavryk Finance DAO Bakery.
          </div>

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

          <div className="lending-stats">
            <ThreeLevelListItem>
              <div className="name">mXTZ Balance</div>
              <CommaNumber value={2412} className="value" endingText="mXTZ" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Lending APY{' '}
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={silverColor}
                  text="gdfgdfgdfgdfg"
                  className="tooltip"
                />
              </div>
              <CommaNumber value={2.13} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Wallet Balance</div>
              <CommaNumber value={2412} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>

          <NewButton kind={ACTION_PRIMARY} onClick={continueBtnHandler} className="modal-manage-btn">
            <Icon id="plus" />
            Deposit
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
