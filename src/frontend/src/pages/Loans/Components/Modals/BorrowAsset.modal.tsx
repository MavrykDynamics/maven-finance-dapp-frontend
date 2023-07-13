import { useLockBodyScroll } from 'react-use'
import { useEffect, useState } from 'react'

// consts
import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { BORROW_VAULT_ASSET_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'

// types
import { TezosWalletErrorPayload } from 'errors/error.type'
import { BorrowPopupDataType } from 'providers/LoansProvider/helpers/LoansModals.types'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

// actions & helpers
import { borrowVaultAssetAction } from 'providers/VaultsProvider/actions/vaults.actions'
import { getCollateralRatioByPersentage, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { checkNan } from 'utils/checkNan'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { sleep } from 'utils/api/sleep'
import { unknownToError } from 'errors/error'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'

// styles
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { silverColor } from 'styles'
import { StatusMessageStyled } from '../LoansComponents.style'
import colors from 'styles/colors'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A240058&t=Sx2aEpp3ifrGxBtQ-0
export const BorrowAsset = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: BorrowPopupDataType
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const { bug, info, loading } = useToasterContext()

  const {
    preferences: { themeSelected },
    contractAddresses: { lendingControllerAddress },
    toggleActionCompletion,
    toggleActionFullScreenLoader,
    setAction,
  } = useDappConfigContext()

  useLockBodyScroll(show)

  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')

  useEffect(() => {
    if (!show) {
      setInputData({
        amount: '0',
        validationStatus: INPUT_STATUS_DEFAULT,
      })
      setShownScreen('initial')
    }
  }, [show])

  const borrowedToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  if (!data || !borrowedToken || !borrowedToken.rate) return null

  const {
    vaultId,
    borrowedAmount,
    borrowCapacity,
    collateralRatio,
    collateralBalance,
    scrollToCurrentVault,
    borrowAPR,
    DAOFee,
  } = data

  const { symbol, decimals, icon, rate } = borrowedToken
  const userAssetBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: borrowedToken.address })

  const convertedBorrowedAmount = convertNumberForClient({ number: borrowedAmount, grade: decimals }),
    inputAmount = checkNan(parseFloat(inputData.amount))

  const futureCollateralRatio = getVaultCollateralRatio(
    collateralBalance,
    (convertedBorrowedAmount + inputAmount) * rate,
  )
  const futureBorrowCapacity = borrowCapacity - inputAmount * rate

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount,
      options: {
        byDecimalPlaces: decimals,
      },
    })

    setInputData({
      ...inputData,
      amount: newInputAmount,
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

  const continueBtnHandler = () => setShownScreen('confitmation')
  const backBtnHandler = () => setShownScreen('initial')

  const borrowAsserHandler = async () => {
    if (vaultId && checkWhetherTokenIsLoanToken(borrowedToken)) {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return
      }
      if (!lendingControllerAddress) {
        bug('Wrong lending address')
        return
      }

      try {
        const actionResult = await borrowVaultAssetAction(
          lendingControllerAddress,
          vaultId,
          inputAmount,
          borrowedToken,
          () => {
            closePopup()
            scrollToCurrentVault()
          },
        )

        if (checkIfActionSuccess(actionResult)) {
          const { operation } = actionResult
          toggleActionFullScreenLoader(true)
          toggleActionCompletion(true)

          info(
            TOASTER_ACTIONS_TEXTS[BORROW_VAULT_ASSET_ACTION]['start']['message'],
            TOASTER_ACTIONS_TEXTS[BORROW_VAULT_ASSET_ACTION]['start']['title'],
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

          setAction({ actionName: BORROW_VAULT_ASSET_ACTION, toasterId, operationLvl })
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
      }
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          {screenShown === 'initial' ? (
            <>
              <GovRightContainerTitleArea>
                {convertedBorrowedAmount > 0 ? <h2>Borrow Additional {symbol}</h2> : <h2>Borrow {symbol}</h2>}
              </GovRightContainerTitleArea>
              <div className="modalDescr">
                Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
              </div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">Borrow Capacity</div>
                  <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Utilization</div>
                  {convertedBorrowedAmount > 0 ? (
                    <CommaNumber value={collateralRatio} className="value" endingText="%" />
                  ) : (
                    <div className="value">Not Relevant</div>
                  )}
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Borrow APR</div>
                  <CommaNumber value={borrowAPR} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    DAO Fee{' '}
                    <CustomTooltip
                      iconId="info"
                      defaultStrokeColor={colors[themeSelected].textColor}
                      text={`Amount paid to the DAO as the origination fee for borrowing. Each time you borrow, a fee is paid.`}
                      className="tooltip"
                    />
                  </div>
                  <CommaNumber value={DAOFee} className="value" endingText="%" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Select the amount to borrow</div>
              <Input
                className={`input-with-rate pinned-dropdown mb-45`}
                inputProps={{
                  value: inputData.amount,
                  type: 'number',
                  onBlur: inputOnBlurHandle,
                  onFocus: onFocusHandler,
                  onChange: (e) => inputOnChangeHandle(e.target.value, borrowCapacity / rate),
                }}
                settings={{
                  balance: userAssetBalance,
                  balanceAsset: symbol,
                  useMaxHandler: () =>
                    inputOnChangeHandle(getLoansInputMaxAmount(borrowCapacity / rate, decimals), borrowCapacity / rate),
                  inputStatus: inputData.validationStatus,
                  convertedValue: inputAmount * rate,
                  inputSize: INPUT_LARGE,
                }}
              >
                <InputPinnedTokenInfo>
                  <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
                </InputPinnedTokenInfo>
              </Input>

              <div className="block-name">New Vault Stats</div>
              <VaultModalOverview>
                <ThreeLevelListItem
                  className="collateral-diagram"
                  customColor={getCollateralRationPersent(futureCollateralRatio)}
                >
                  <div className={`percentage`}>
                    Collateral Ratio:{' '}
                    <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
                  </div>
                  <GradientDiagram
                    className="diagram"
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={getCollateralRatioByPersentage(futureCollateralRatio)}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={collateralBalance} className="value" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available To Borrow</div>
                  <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              {inputAmount > borrowCapacity / rate || futureCollateralRatio < 200 ? (
                <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE} borrow-message`}>
                  <Icon id="error-triangle" />
                  {futureCollateralRatio < 200
                    ? 'The amount you wish to borrow would under-collateralize your vault. Please enter a different amount to borrow so your vault will not be under-collateralized when you borrow.'
                    : 'Select the amount you would like to borrow. You cannot borrow more than your borrow capacity.'}
                </StatusMessageStyled>
              ) : null}

              <div className="manage-btn">
                <NewButton
                  kind={BUTTON_PRIMARY}
                  onClick={continueBtnHandler}
                  form={BUTTON_WIDE}
                  disabled={inputData.validationStatus !== INPUT_STATUS_SUCCESS || futureCollateralRatio < 200}
                >
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              </div>
            </>
          ) : (
            <>
              <GovRightContainerTitleArea>
                <h2>Confirm Borrow {symbol}</h2>
              </GovRightContainerTitleArea>
              <div className="modalDescr">Please confirm the following details.</div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">
                    Total Amount
                    <CustomTooltip
                      iconId="info"
                      defaultStrokeColor={silverColor}
                      text={`Total amount you are borrowing, a portion of which is paid to the treasury as the DAO fee. The amount you will actually receive is the Total Amount minus the DAO fee.`}
                      className="tooltip"
                    />
                  </div>
                  <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount Received</div>
                  <CommaNumber
                    value={inputAmount - inputAmount * (DAOFee / 100)}
                    decimalsToShow={assetDecimalsToShow}
                    className="value"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    DAO Fee
                    <CustomTooltip
                      iconId="info"
                      defaultStrokeColor={silverColor}
                      text={`Amount paid to the DAO as the origination fee for borrowing. Each time you borrow, a fee is paid.`}
                      className="tooltip"
                    />
                  </div>
                  <CommaNumber
                    value={inputAmount * (DAOFee / 100)}
                    decimalsToShow={assetDecimalsToShow}
                    className="value"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">USD Value</div>
                  <CommaNumber
                    value={(inputAmount - inputAmount * (DAOFee / 100)) * rate}
                    className="value"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vault Stats</div>
              <VaultModalOverview>
                <ThreeLevelListItem
                  className="collateral-diagram"
                  customColor={getCollateralRationPersent(futureCollateralRatio)}
                >
                  <div className={`percentage`}>
                    Collateral Ratio:{' '}
                    <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
                  </div>
                  <GradientDiagram
                    className="diagram"
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={getCollateralRatioByPersentage(futureCollateralRatio)}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={collateralBalance} className="value" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available To Borrow</div>
                  <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              <div className="buttons-wrapper">
                <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backBtnHandler}>
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={borrowAsserHandler}>
                  <Icon id="coin-loan" />
                  Borrow {symbol}
                </NewButton>
              </div>
            </>
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
