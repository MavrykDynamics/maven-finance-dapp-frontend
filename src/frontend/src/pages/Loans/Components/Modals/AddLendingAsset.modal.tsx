import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { State } from 'reducers'
import { AddLendingAssetDataType, DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from './Modals.helpers'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { silverColor } from 'styles'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { depositLendingAssetAction } from 'pages/Loans/Actions/lendingAsset.actions'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239981&t=Sx2aEpp3ifrGxBtQ-0
export const AddLendingAsset = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: AddLendingAssetDataType
}) => {
  const {
    userBalance = 0,
    mBalance = 0,
    rate = 0,
    decimals = 0,
    symbol = '',
    address = '',
    lendingAPY = 0,
    icon = '',
    gqlName = '',
    tokenType = '',
    id = 0,
  } = data ?? {}
  useLockBodyScroll(show)

  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const onChangeHandler = (inputAmount: string, userBalance: number) => {
    const validationStatus =
      Number(inputAmount) > 0 && Number(inputAmount) <= userBalance ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

    if (validationStatus === INPUT_STATUS_ERROR && inputAmount !== '' && inputAmount !== '0') return

    setInputData({
      ...inputData,
      amount: inputAmount,
      validationStatus: validationStatus,
    })
  }

  const inputOnBlurHandle = () => {
    setInputData({
      ...inputData,
      amount: getOnBlurValue(inputData.amount),
    })
  }

  const onFocusHandler = () => {
    setInputData({
      ...inputData,
      amount: getOnFocusValue(inputData.amount),
    })
  }

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
    }
  }, [show])
  const isDepositDisabled = useMemo(() => {
    return inputData.validationStatus !== INPUT_STATUS_SUCCESS || isActionLoading
  }, [inputData.validationStatus, isActionLoading])

  const depositHandler = () => {
    if (tokenType && address) {
      dispatch(
        depositLendingAssetAction(
          gqlName,
          Number(inputData.amount) * 10 ** decimals,
          address,
          id,
          tokenType,
          closePopup,
        ),
      )
    }
  }

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
            className={`${rate ? 'input-with-rate' : ''} large-input pinned-dropdown`}
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onChange: (e) => onChangeHandler(e.target.value, userBalance),
              onBlur: inputOnBlurHandle,
              onFocus: onFocusHandler,
            }}
            settings={{
              balance: userBalance,
              balanceAsset: symbol,
              useMaxHandler: () => onChangeHandler(String(userBalance), userBalance),
              inputStatus: inputData.validationStatus,
              ...(rate ? { convertedValue: rate * Number(inputData.amount) } : {}),
            }}
          >
            <InputPinnedTokenInfo>
              {icon ? (
                <div className="image-wrapper">
                  <img src={icon} alt={`${symbol}-logo`} />
                </div>
              ) : (
                <Icon id="noImage" />
              )}
              {symbol}
            </InputPinnedTokenInfo>
          </Input>

          <div className="lending-stats" style={{ marginTop: '45px' }}>
            <ThreeLevelListItem>
              <div className="name">
                Lending APY{' '}
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={silverColor}
                  text={`You will receive m${symbol} instead of your ${symbol}`}
                  className="tooltip"
                />
              </div>
              <CommaNumber value={lendingAPY} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">m{symbol} Received</div>
              <CommaNumber value={Number(inputData.amount)} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">New m{symbol} Balance</div>
              <CommaNumber value={mBalance + Number(inputData.amount)} className="value" />
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
