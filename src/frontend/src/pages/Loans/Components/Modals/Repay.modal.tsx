import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { FillBlock, ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { useState } from 'react'
import { silverColor } from 'styles'
import { LoansModalBase, VaultModalOverview } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17953%3A224110&t=Sx2aEpp3ifrGxBtQ-0
export const Repay = ({ closePopup }: { closePopup: () => void }) => {
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

      {screenShown === 'initial' ? (
        <>
          <GovRightContainerTitleArea>
            <h2>Repay Borrowed Funds</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Repay the loan to withdraw your vault collateral.</div>
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

          <div className="block-name">Please enter how much you would like to repay</div>
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
          <GovRightContainerTitleArea>
            <h2>Confirm Repayment of Borrowed Funds</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Please confirm the following details.</div>

          <div className="lending-stats" style={{ marginBottom: '25px' }}>
            <ThreeLevelListItem>
              <div className="name">Asset</div>
              <CommaNumber value={2412} className="value" endingText="XTZ" />
            </ThreeLevelListItem>
            <ThreeLevelListItem className="right">
              <div className="name">Amount</div>
              <CommaNumber value={2412} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem className="right">
              <div className="name">USD Value</div>
              <CommaNumber value={2412} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>

          <div className="block-name">New Vaults Stats</div>
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

          <div className="buttons-wrapper" style={{ marginTop: '40px' }}>
            <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={backBtnHandler} className="modal-manage-btn">
              <Icon id="arrowLeft" />
              Back
            </NewButton>
            <NewButton kind={ACTION_PRIMARY} onClick={continueBtnHandler} className="modal-manage-btn">
              <Icon id="okIcon" />
              Repay
            </NewButton>
          </div>
        </>
      )}
    </LoansModalBase>
  )
}
