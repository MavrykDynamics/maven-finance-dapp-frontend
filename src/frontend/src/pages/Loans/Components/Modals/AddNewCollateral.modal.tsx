import { useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'
import { State } from 'reducers'
import { useDispatch, useSelector } from 'react-redux'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DDItemId, DropDown, DropDownItemType, DropdownInputCustomChild } from 'app/App.components/DropDown/NewDropdown'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'

import {
  calcCollateralRatio,
  getCollateralRatioByPersentage,
  getLoansInputMaxAmount,
  loansInputValidation,
} from 'pages/Loans/Loans.helpers'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { depositCollateralsAction } from 'pages/Loans/Actions/vaultCollateral.actions'
import { AddNewCollateralDataProps } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'

import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { silverColor } from 'styles'
import { checkNan } from 'utils/checkNan'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
  isTezosAsset,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import useXtzBakersForDD from 'providers/DAPPConfig/helpers/useDDXtzBakers'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239633&t=Sx2aEpp3ifrGxBtQ-0
// TODO: redo it
export const AddNewCollateral = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: AddNewCollateralDataProps
}) => {
  const { tokensMetadata, tokensPrices, collateralTokens } = useTokensContext()

  const { bakers, choosenBaker, setChoosenBaker } = useXtzBakersForDD()

  useLockBodyScroll(show)
  const dispatch = useDispatch()

  const { userTokens } = useSelector((state: State) => state.wallet.user)

  const [selectedCollateral, setSelectedCollateral] = useState<TokenAddressType | undefined>()
  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: '',
  })

  // resetting popup state, when toggling it off
  useEffect(() => {
    if (!show) {
      setInputData({
        amount: '0',
        validationStatus: '',
      })
    }
  }, [show])

  const mappedAvaliableCollaterals = useMemo(() => {
    if (!data) return {}

    const { collateralData } = data

    let firstNotDisabledCollateralAddress: string | null = null

    const reducedCollaterals = collateralTokens.reduce<
      Record<DDItemId, DropDownItemType & { tokenAddress: TokenAddressType }>
    >((acc, collateralTokenAddress) => {
      const collateral = getTokenDataByAddress({ tokenAddress: collateralTokenAddress, tokensMetadata, tokensPrices })

      if (collateral && checkWhetherTokenIsCollateralToken(collateral)) {
        const { address, icon, symbol } = collateral

        const isCollateralDisabled = Boolean(
          collateral.loanData.isProtectedCollateral ||
            collateralData?.find(({ tokenAddress }) => address === tokenAddress) ||
            selectedCollateral === collateralTokenAddress,
        )

        if (!isCollateralDisabled && !firstNotDisabledCollateralAddress)
          firstNotDisabledCollateralAddress = collateralTokenAddress

        acc[address] = {
          id: address,
          tokenAddress: address,
          content: <DropdownInputCustomChild iconSrc={icon} symbol={symbol} />,
          disabled: isCollateralDisabled,
        }
      }
      return acc
    }, {})

    if (!selectedCollateral && firstNotDisabledCollateralAddress) {
      if (firstNotDisabledCollateralAddress) {
        reducedCollaterals[firstNotDisabledCollateralAddress].disabled = true
        setSelectedCollateral(firstNotDisabledCollateralAddress)
      }
    }

    return reducedCollaterals
  }, [collateralTokens, data, selectedCollateral, tokensMetadata, tokensPrices])

  if (!data) return null

  const {
    collateralBalance = 0,
    vaultAddress,
    collateralRatio = 0,
    borrowedAmount = 0,
    borrowedTokenRate = 0,
    availableLiquidity = 0,
    borrowCapacity = 0,
  } = data

  const collateralToken = getTokenDataByAddress({ tokenAddress: selectedCollateral, tokensMetadata, tokensPrices })

  if (!collateralToken || !collateralToken.rate) return null

  const { symbol, decimals, rate } = collateralToken

  // TODO: handle user balance
  const userCollateralBalance = 0 //userTokens[balanceSymbol]?.balance ?? 0
  const inputAmount = checkNan(parseFloat(inputData.amount))
  const futureCollateralRatio = calcCollateralRatio(collateralBalance + inputAmount, borrowedAmount, borrowedTokenRate)
  const futureCollateralBalance = collateralBalance + inputAmount * rate
  const futureBorrowCapacity = Math.min(
    Math.max(availableLiquidity, 0),
    futureCollateralBalance / 2 - borrowedAmount * borrowedTokenRate,
  )

  const depositCollateralHandler = () => {
    if (vaultAddress && checkWhetherTokenIsCollateralToken(collateralToken)) {
      dispatch(
        depositCollateralsAction(
          vaultAddress,
          [
            {
              collateralName: collateralToken.loanData.indexerName,
              address: collateralToken.address,
              id: collateralToken.id,
              type: collateralToken.type,
              amount: convertNumberForContractCall({
                number: Number(inputData.amount),
                grade: collateralToken.decimals,
              }),
            },
          ],
          closePopup,
          choosenBaker?.bakerAddress,
        ),
      )
    }
  }

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, userAssetBalance: number) => {
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount: userAssetBalance,
      options: {
        byDecimalPlaces: decimals,
      },
    })

    if (inputData) {
      setInputData({
        ...inputData,
        amount: newInputAmount,
        validationStatus: validationStatus,
      })
    }
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

  // TODO: test it
  const clickOnInputDDItem = (id: DDItemId) => (typeof id === 'string' ? setSelectedCollateral(id) : null)

  const isDepositBtnDisabled =
    (isTezosAsset(selectedCollateral) && !choosenBaker) || inputData.validationStatus === INPUT_STATUS_ERROR

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Add More Assets As Collateral</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Select an assets to add as collateral to an existing vault.</div>

          <VaultModalOverview style={{ marginBottom: '45px' }}>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(collateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio: <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={getCollateralRatioByPersentage(collateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={collateralBalance} beginningText="$" className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Available to Borrow{' '}
                <CustomTooltip
                  text="The available to borrow metric takes 2 separate values into account. The borrow capacity of your vault AND the availableLiquidity of the asset pool your vault is borrowing from. The equation used is: min(availableLiquidityuidity, vaultCollateralValue / 2 - borrowedAmount)"
                  iconId="info"
                  defaultStrokeColor={silverColor}
                />
              </div>
              <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          {inputData ? (
            <>
              <Input
                className={`${rate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
                inputProps={{
                  value: inputData.amount,
                  type: 'number',
                  onBlur: inputOnBlurHandle,
                  onFocus: onFocusHandler,
                  onChange: (e) => inputOnChangeHandle(e.target.value, userCollateralBalance),
                }}
                settings={{
                  balance: userCollateralBalance,
                  balanceAsset: symbol,
                  useMaxHandler: () =>
                    setInputData({
                      ...inputData,
                      amount: getLoansInputMaxAmount(userCollateralBalance, decimals),
                      validationStatus: INPUT_STATUS_SUCCESS,
                    }),
                  inputSize: INPUT_LARGE,
                  inputStatus: inputData.validationStatus,
                  convertedValue: Number(inputData.amount) * rate,
                }}
              >
                <InputPinnedDropDown>
                  <DropDown
                    placeholder="Select Bakery"
                    activeItem={selectedCollateral ? mappedAvaliableCollaterals[selectedCollateral] : undefined}
                    items={Object.values(mappedAvaliableCollaterals)}
                    clickItem={clickOnInputDDItem}
                    className="input-dropdown not-capitalized"
                  />
                </InputPinnedDropDown>
              </Input>

              {isTezosAsset(selectedCollateral) ? (
                <>
                  <div className="block-name">Select Baker</div>
                  <DropDown
                    placeholder="Select Bakery"
                    activeItem={choosenBaker}
                    items={bakers}
                    clickItem={(bakerAddress: DDItemId) =>
                      typeof bakerAddress === 'string' ? setChoosenBaker(bakerAddress) : null
                    }
                  />
                  <div className="lending-stats" style={{ margin: '30px 0' }}>
                    <ThreeLevelListItem>
                      <div className="name">Bakery Address</div>
                      {choosenBaker?.bakerAddress ? (
                        <TzAddress className="value" tzAddress={choosenBaker.bakerAddress} type={BLUE} />
                      ) : (
                        <div className="value">-</div>
                      )}
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Yield</div>
                      {choosenBaker?.bakerYield ? (
                        <CommaNumber value={choosenBaker.bakerYield} className="value" endingText="%" />
                      ) : (
                        <div className="value">-</div>
                      )}
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Free Capacity</div>
                      {choosenBaker?.bakerFreeSpace ? (
                        <CommaNumber value={choosenBaker.bakerFreeSpace} className="value" endingText="XTZ" />
                      ) : (
                        <div className="value">-</div>
                      )}
                    </ThreeLevelListItem>
                  </div>
                </>
              ) : null}
            </>
          ) : null}

          <div className="block-name">New Vault Status</div>
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
              <CommaNumber value={futureCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Available to Borrow{' '}
                <CustomTooltip
                  text="The available to borrow metric takes 2 separate values into account. The borrow capacity of your vault AND the availableLiquidity of the asset pool your vault is borrowing from. The equation used is: min(availableLiquidityuidity, vaultCollateralValue / 2 - borrowedAmount)"
                  iconId="info"
                  defaultStrokeColor={silverColor}
                />
              </div>
              <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <div className="manage-btn">
            <NewButton
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              onClick={depositCollateralHandler}
              disabled={isDepositBtnDisabled}
            >
              <Icon id="plus" />
              Deposit
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
