import { useEffect, useState } from 'react'
import { useLockBodyScroll } from 'react-use'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

// consts
import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'
import { DEPOSIT_LENDING_ASSET_ACTION } from 'providers/LoansProvider/helpers/loans.const'

// types
import { AddLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { TezosWalletErrorPayload } from 'errors/error.type'

// helpers
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { sleep } from 'utils/api/sleep'
import { unknownToError } from 'errors/error'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'

// styles
import { silverColor } from 'styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'

// actions
import { depositLendingAssetAction } from 'providers/LoansProvider/actions/loans.actions'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

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
  const {
    contractAddresses: { lendingControllerAddress },
    toggleActionFullScreenLoader,
    toggleActionCompletion,
    setAction,
  } = useDappConfigContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const { bug, info, loading } = useToasterContext()

  useLockBodyScroll(show)

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

  const depositHandler = async () => {
    if (checkWhetherTokenIsLoanToken(loanToken)) {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return
      }

      if (!lendingControllerAddress) {
        bug('Wrong lending address')
        return
      }

      try {
        const actionResult = await depositLendingAssetAction(
          userAddress,
          loanToken,
          Number(inputData.amount),
          lendingControllerAddress,
          closePopup,
        )

        if (checkIfActionSuccess(actionResult)) {
          const { operation } = actionResult
          toggleActionFullScreenLoader(true)
          toggleActionCompletion(true)

          info(
            TOASTER_ACTIONS_TEXTS[DEPOSIT_LENDING_ASSET_ACTION]['start']['message'],
            TOASTER_ACTIONS_TEXTS[DEPOSIT_LENDING_ASSET_ACTION]['start']['title'],
          )

          await sleep(5000)

          // show toaster loader after 5000ms after operation started
          const toasterId = loading(
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          )

          toggleActionFullScreenLoader(false)

          const operationConfirm = await operation.confirmation()
          const operationLvl = operationConfirm.block.header.level

          setAction({ actionName: DEPOSIT_LENDING_ASSET_ACTION, toasterId, operationLvl })
        } else if (isContractErrorPayload(actionResult.error)) {
          const { message, description } = actionResult.error as TezosWalletErrorPayload
          bug(description, message)
        } else {
          throw new Error(actionResult.error.message)
        }
      } catch (e) {
        setAction(null)
        const parsedError = unknownToError(e)
        bug(parsedError.message)
      } finally {
        // setInputData({ ...inputData, amount: '0' })
        toggleActionCompletion(false)
      }
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
