import { useDispatch } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { depositLendingAssetAction } from 'pages/Loans/Loans.actions'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { silverColor } from 'styles'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

export type AddLendingAssetDataType = {
  userBalance: number
  mBalance: number
  lendingAPY: number
  assetRate: number | null
  assetName: string
  assetIcon?: string
}

type AddLendingAssetModalProps = { closePopup: () => void; show: boolean; modalData?: AddLendingAssetDataType }

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239981&t=Sx2aEpp3ifrGxBtQ-0
export const AddLendingAsset = ({ closePopup, show, modalData }: AddLendingAssetModalProps) => {
  const dispatch = useDispatch()
  const {
    userBalance = 0,
    mBalance = 0,
    assetRate = null,
    assetName = '',
    lendingAPY = 0,
    assetIcon = '',
  } = modalData ?? {}
  const [inputAmount, setInputAmount] = useState('0')
  const [inputValidationStatus, setInputValidationStatus] = useState<InputStatusType>('')

  const onBlurHandler = (inputAmount: string, userBalance: number) => {
    setInputValidationStatus(
      Number(inputAmount) > 0 && Number(inputAmount) <= userBalance ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
    )
    setInputAmount(inputAmount === '' ? '0' : inputAmount)
  }

  useEffect(() => {
    if (!show) {
      setInputValidationStatus('')
      setInputAmount('0')
    }
  }, [show])

  const isDepositDisabled = useMemo(() => {
    return inputValidationStatus !== INPUT_STATUS_SUCCESS
  }, [inputValidationStatus])

  const depositHandler = () => dispatch(depositLendingAssetAction(assetName, Number(inputAmount)))

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
            className={`${assetRate ? 'input-with-rate' : ''} large-input pinned-dropdown`}
            inputProps={{
              value: inputAmount,
              type: 'number',
              onChange: (e) => setInputAmount(e.target.value),
              onBlur: (e) => onBlurHandler(e.target.value, userBalance),
              onFocus: () => setInputAmount(inputAmount === '0' ? '' : inputAmount),
            }}
            settings={{
              balanceName: 'Lend Balance',
              balance: userBalance,
              balanceAsset: assetName,
              useMaxHandler: () => setInputAmount(String(userBalance)),
              inputStatus: inputValidationStatus,
              ...(assetRate ? { convertedValue: assetRate * Number(inputAmount) } : {}),
            }}
          >
            <InputPinnedTokenInfo>
              {assetIcon ? (
                <div className="image-wrapper">
                  <img src={assetIcon} alt={`${assetName}-logo`} />
                </div>
              ) : (
                <Icon id="xtzTezos" />
              )}
              {assetName}
            </InputPinnedTokenInfo>
          </Input>

          <div className="lending-stats" style={{ marginTop: '45px' }}>
            <ThreeLevelListItem>
              <div className="name">
                Lending APY{' '}
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={silverColor}
                  text={`You will receive m${assetName} instead of your ${assetName}`}
                  className="tooltip"
                />
              </div>
              <CommaNumber value={lendingAPY} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">m{assetName} Received</div>
              <CommaNumber value={Number(inputAmount)} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">New m{assetName} Balance</div>
              <CommaNumber value={mBalance + Number(inputAmount)} className="value" />
            </ThreeLevelListItem>
          </div>

          <NewButton
            kind={ACTION_PRIMARY}
            onClick={depositHandler}
            className="modal-manage-btn"
            disabled={isDepositDisabled}
          >
            <Icon id="plus" />
            Deposit
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
