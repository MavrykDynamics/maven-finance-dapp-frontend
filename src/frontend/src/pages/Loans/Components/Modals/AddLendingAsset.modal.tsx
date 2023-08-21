import { useCallback, useEffect, useMemo } from 'react'
import { useLockBodyScroll } from 'react-use'

// components
import { MemoizedComponent } from 'app/App.HOC/MemoizedComponent'
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { XTZLimitInfoBanner } from './components/XTZLimitInfoBanner'

// consts
import {
  ERR_MSG_INPUT,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { DEPOSIT_LENDING_ASSET_ACTION } from 'providers/LoansProvider/helpers/loans.const'

// types
import { AddLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// helpers
import { validateInputLength } from 'app/App.utils/input/validateInput'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

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

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useCollateralInputData } from './hooks/Market/useCollateralInputData'

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
  } = useDappConfigContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const { bug } = useToasterContext()

  useLockBodyScroll(show)

  const {
    inputData,
    setInputData,
    inputOnBlurHandle,
    inputOnChangeHandle,
    willExceedXTZTheLimit,
    onFocusHandler,
    setSelectedCollateral,
    useMaxHandler,
  } = useCollateralInputData()

  useEffect(() => {
    if (!show) {
      setInputData({
        amount: '0',
        validationStatus: INPUT_STATUS_DEFAULT,
      })
    }
  }, [show])

  useEffect(() => {
    setSelectedCollateral(data?.tokenAddress)
  }, [data?.tokenAddress, setSelectedCollateral])

  const loanToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  const depositAction = useCallback(async () => {
    if ((loanToken && !checkWhetherTokenIsLoanToken(loanToken)) || !loanToken) {
      return null
    }

    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!lendingControllerAddress) {
      bug('Wrong lending address')
      return null
    }

    return await depositLendingAssetAction(
      userAddress,
      loanToken,
      Number(inputData.amount),
      lendingControllerAddress,
      closePopup,
    )
  }, [bug, closePopup, inputData.amount, lendingControllerAddress, loanToken, userAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DEPOSIT_LENDING_ASSET_ACTION,
      actionFn: depositAction,
    }),
    [depositAction],
  )

  const { action: depositHandler } = useContractAction(contractActionProps)

  if (!data || !loanToken || !loanToken.rate) return null

  const { mBalance, lendingAPY, tokenAddress } = data
  const { symbol, icon, rate } = loanToken
  const tokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: tokenAddress })

  const isDepositDisabled = inputData.validationStatus !== INPUT_STATUS_SUCCESS

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
            className="pinned-dropdown input-with-rate"
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onChange: (e) => inputOnChangeHandle(e.target.value, tokenBalance),
              onBlur: inputOnBlurHandle,
              onFocus: onFocusHandler,
            }}
            settings={{
              balance: tokenBalance,
              balanceAsset: symbol,
              useMaxHandler: () => useMaxHandler(tokenBalance),
              inputStatus: inputData.validationStatus,
              inputSize: INPUT_LARGE,
              convertedValue: rate * Number(inputData.amount),
              validationFns: [[validateInputLength, ERR_MSG_INPUT]],
            }}
          >
            <InputPinnedTokenInfo>
              <ImageWithPlug imageLink={icon} alt={`${loanToken.symbol} icon`} />
              {symbol}
            </InputPinnedTokenInfo>
          </Input>

          <MemoizedComponent returnMemoizedComponent={inputData.validationStatus === INPUT_STATUS_ERROR}>
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
          </MemoizedComponent>

          <XTZLimitInfoBanner show={willExceedXTZTheLimit} spaces="mt-20 mb-20" />

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
