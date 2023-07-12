import { useDispatch } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useState } from 'react'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { AddLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { silverColor } from 'styles'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { depositLendingAssetAction } from 'pages/Loans/Actions/lendingAsset.actions'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

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
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userTokensBalances } = useUserContext()

  useLockBodyScroll(show)

  const dispatch = useDispatch()
  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })

  useEffect(() => {
    if (!show) {
      setInputData({
        amount: '0',
        validationStatus: INPUT_STATUS_DEFAULT,
      })
    }
  }, [show])

  const loanToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  if (!data || !loanToken || !loanToken.rate) return null

  const { mBalance, lendingAPY, tokenAddress } = data
  const { symbol, icon, decimals, rate } = loanToken
  const tokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: tokenAddress })

  const isDepositDisabled = inputData.validationStatus !== INPUT_STATUS_SUCCESS

  // TODO: handle user balances

  const onChangeHandler = (inputAmount: string, userBalance: number) => {
    const validationStatus = loansInputValidation({
      inputAmount,
      maxAmount: userBalance,
      options: {
        byDecimalPlaces: loanToken.decimals || assetDecimalsToShow,
      },
    })

    setInputData({
      ...inputData,
      amount: inputAmount,
      validationStatus: validationStatus,
    })
  }

  const inputOnBlurHandle = () =>
    setInputData({
      ...inputData,
      amount: getOnBlurValue(inputData.amount),
    })

  const onFocusHandler = () =>
    setInputData({
      ...inputData,
      amount: getOnFocusValue(inputData.amount),
    })

  const depositHandler = () => {
    if (checkWhetherTokenIsLoanToken(loanToken)) {
      dispatch(depositLendingAssetAction(loanToken, Number(inputData.amount), closePopup))
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Supply Assets to Earn</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Earn yield by depositing assets to Mavryk’s lending pools. Loans are secured by 200% collateral. Supplied
            XTZ is automatically delegated to the Mavryk Finance DAO Bakery.
          </div>

          <Input
            className={`input-with-tokenRate pinned-dropdown`}
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onChange: (e) => onChangeHandler(e.target.value, tokenBalance),
              onBlur: inputOnBlurHandle,
              onFocus: onFocusHandler,
            }}
            settings={{
              balance: tokenBalance,
              balanceAsset: symbol,
              useMaxHandler: () => onChangeHandler(getLoansInputMaxAmount(tokenBalance, decimals), tokenBalance),
              inputStatus: inputData.validationStatus,
              inputSize: INPUT_LARGE,
              convertedValue: rate * Number(inputData.amount),
            }}
          >
            <InputPinnedTokenInfo>
              <ImageWithPlug imageLink={icon} alt={`${loanToken.symbol} icon`} />
              {symbol}
            </InputPinnedTokenInfo>
          </Input>

          <div className="lending-stats" style={{ marginTop: '45px' }}>
            <ThreeLevelListItem>
              <div className="name">
                Earn APY{' '}
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

          <div className="manage-btn">
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={depositHandler} disabled={isDepositDisabled}>
              <Icon id="plus" />
              Deposit
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
