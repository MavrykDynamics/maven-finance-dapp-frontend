import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { useState } from 'react'
import { silverColor } from 'styles'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A238846&t=Sx2aEpp3ifrGxBtQ-0
export const RemoveAssetsFromLending = ({ closePopup }: { closePopup: () => void }) => {
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const [inputAmount, setInputAmount] = useState('0')

  const continueBtnHandler = () => {
    setShownScreen('confitmation')
  }

  const backBtnHandler = () => {
    setShownScreen('initial')
  }

  return (
    <LoansModalBase>
      <button onClick={closePopup} className="close-modal" />

      <GovRightContainerTitleArea>
        <h2>Withdraw Assets</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Select the amount you wish to withdraw from lending. You cannot withdraw more than you have deposited.
      </div>

      {screenShown === 'initial' ? (
        <>
          <div className="lending-stats" style={{ marginBottom: '25px' }}>
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

          <div className="block-name">Select amount to remove</div>
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

          <NewButton kind={ACTION_PRIMARY} onClick={continueBtnHandler} className="modal-manage-btn">
            Continue
            <Icon id="arrowRight" />
          </NewButton>
        </>
      ) : (
        <>
          <div className="loans-confirmation-info">
            <div className="lending-stats">
              <ThreeLevelListItem>
                <div className="name">Amount Removed</div>
                <CommaNumber value={2412} className="value" endingText="XTZ" />
              </ThreeLevelListItem>
              <ThreeLevelListItem className="right">
                <div className="name">USD Value</div>
                <CommaNumber value={2412} className="value" beginningText="$" />
              </ThreeLevelListItem>
            </div>
            <hr />
            <div className="lending-stats">
              <ThreeLevelListItem>
                <div className="name">New Lending Amount</div>
                <CommaNumber value={2412} className="value" endingText="XTZ" />
              </ThreeLevelListItem>
              <ThreeLevelListItem className="right">
                <div className="name">New USD Value</div>
                <CommaNumber value={2412} className="value" beginningText="$" />
              </ThreeLevelListItem>
            </div>
          </div>

          <div className="buttons-wrapper">
            <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={backBtnHandler} className="modal-manage-btn">
              <Icon id="arrowLeft" />
              Back
            </NewButton>
            <NewButton kind={ACTION_PRIMARY} onClick={continueBtnHandler} className="modal-manage-btn">
              <Icon id="minus" />
              Remove Asset
            </NewButton>
          </div>
        </>
      )}
    </LoansModalBase>
  )
}
