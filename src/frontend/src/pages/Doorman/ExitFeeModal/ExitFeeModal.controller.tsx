import { useDispatch, useSelector } from 'react-redux'

// helpers
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import { INPUT_STATUS_SUCCESS, INPUT_LARGE, INPUT_STATUS_DEFAULT } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from '../../../app/App.components/Button/Button.constants'
import { stakingInputValidation } from '../Doorman.converter'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { unknownToError } from 'errors/error'
import { UNSTAKE_ACTION } from 'providers/StakeProvider/helpers/stake.consts'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'
import { sleep } from 'utils/api/sleep'
import { DEFAULT_STAKE_UNSTAKE_INPUT } from '../Doorman.controller'

// components
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { ExitFeeModalButtons, ExitFeeModalContent, ExitFeeModalStats } from './ExitFeeModal.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import NewButton from 'app/App.components/Button/NewButton'
import { containerColor } from 'styles'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { CustomTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'

// context
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { InputProps } from 'app/App.components/Input/newInput.type'
import { State } from 'reducers'
import { unstakeMVK } from 'providers/StakeProvider/actions/doorman.actions'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'

type ExitFeeModalPropsType = {
  closePopup: () => void
  show: boolean
  data: {
    mvkExchangeRate: number
    mySMvkTokenBalance: number
    myMvkTokenBalance: number
    totalStakedMvk: number
    totalMVKSupply: number
    userAddress: string | null
  }
  inputData: typeof DEFAULT_STAKE_UNSTAKE_INPUT
  setInputData: (data: typeof DEFAULT_STAKE_UNSTAKE_INPUT) => void
}

export const ExitFeeModal = ({
  closePopup,
  show,
  data: { mvkExchangeRate, mySMvkTokenBalance, myMvkTokenBalance, totalStakedMvk, userAddress, totalMVKSupply },
  inputData,
  setInputData,
}: ExitFeeModalPropsType) => {
  const dispatch = useDispatch()
  const { setAction } = useDappConfigContext()
  const { bug, info, loading } = useToasterContext()

  const {
    doormanAddress: { address: doormanAddress },
  } = useSelector((state: State) => state.contractAddresses)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const parsedInputAmount = Number(inputData.amount)
  const convertedValue = mvkExchangeRate ? parsedInputAmount * mvkExchangeRate : 0

  const mli = calcMLI(totalMVKSupply, totalStakedMvk)
  const fee = calcExitFee(totalMVKSupply, totalStakedMvk)

  const handleUnstake = async (unstakeAmount: number) => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }

    if (unstakeAmount <= 0) {
      bug('Please enter an amount superior to zero', 'Incorrect amount')
      return
    }

    const actionResult = await unstakeMVK(unstakeAmount, doormanAddress)
    closePopup()

    if (checkIfActionSuccess(actionResult)) {
      try {
        const { operation } = actionResult
        dispatch(toggleActionFullScreenLoader(true))
        dispatch(toggleActionCompletion(true))

        info(
          TOASTER_ACTIONS_TEXTS[UNSTAKE_ACTION]['start']['message'],
          TOASTER_ACTIONS_TEXTS[UNSTAKE_ACTION]['start']['title'],
        )

        await sleep(5000)

        // show toaster loader after 5000ms after operation started
        const toasterId = loading(
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        )

        dispatch(toggleActionFullScreenLoader(false))
        dispatch(toggleActionCompletion(false))

        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level

        setInputData({ ...inputData, amount: '0', validation: INPUT_STATUS_DEFAULT })
        setAction({ actionName: UNSTAKE_ACTION, toasterId, operationLvl })
      } catch (e) {}
    } else {
      setAction(null)
      const parsedError = unknownToError(actionResult.error)
      bug(parsedError.message)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    const validationStatus = stakingInputValidation({
      amount: Number(value),
      myMvkTokenBalance,
      mySMvkTokenBalance,
      userAddress,
    })

    const errorMessage = Number(value) > Number(mySMvkTokenBalance) ? "You don't have enought sMVK to unstake" : ''

    setInputData({ ...inputData, amount: value, validation: validationStatus, errorMessage })
  }
  const handleFocus = () => {
    if (inputData.amount === '0') {
      setInputData({ ...inputData, amount: '' })
    }
  }

  const handleBlur = () => {
    if (inputData.amount === '') {
      setInputData({ ...inputData, amount: '0' })
    }
  }

  const inputProps: InputProps = {
    type: 'number',
    value: inputData.amount,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onChange: onInputChange,
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="exitFee">
        <button onClick={closePopup} className="close-modal" />
        <h1>Unstake your MVK</h1>

        <ExitFeeModalContent>
          <label>Amount to Unstake:</label>
          <Input
            className={`input-with-rate transparent-child-wrap`}
            children={<InputPinnedTokenInfo>MVK</InputPinnedTokenInfo>}
            inputProps={inputProps}
            settings={{
              inputStatus: inputData.validation,
              convertedValue,
              inputSize: INPUT_LARGE,
            }}
          />
          <ExitFeeModalStats>
            <div>
              <h4>
                MVK Loyalty Index
                <a
                  href="https://mavryk.finance/litepaper#converting-smvk-back-to-mvk-exit-fees"
                  target="_blank"
                  rel="noreferrer"
                >
                  <CustomTooltip
                    text="The Mavryk Loyalty Index is a metric that balances MVK & sMVK. The more MVK is staked v.s. MVK, the higher the MLI, and the lower the exit fee is. The less MVK staked v.s. MVK, the lower the MLI, and the exit fee will rise. Click here to read more."
                    iconId={'info'}
                  />
                </a>
              </h4>
              <var>
                <CommaNumber value={mli} endingText={' '} />
              </var>
            </div>

            <div>
              <h4>
                Exit Fee
                <a
                  href="https://mavryk.finance/litepaper#converting-smvk-back-to-mvk-exit-fees"
                  target="_blank"
                  rel="noreferrer"
                >
                  <CustomTooltip
                    text="The Exit Fee is dynamic, adjusts according to the MLI, and may modified by governance vote. Exit fees are paid directly to sMVK stakeholders for remaining active participants in securing the network. Click to read more."
                    iconId={'info'}
                  />
                </a>
              </h4>
              <var>
                <CommaNumber value={fee} endingText={'%'} />
              </var>
            </div>
          </ExitFeeModalStats>

          <ExitFeeModalButtons>
            <NewButton
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              disabled={inputData.validation !== INPUT_STATUS_SUCCESS || isActionActive}
              onClick={() => handleUnstake(Number(inputData.amount))}
            >
              <Icon id="success-fill" fill={containerColor} /> Proceed
            </NewButton>

            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={closePopup}>
              <Icon id="navigation-menu_close" /> Cancel
            </NewButton>
          </ExitFeeModalButtons>
        </ExitFeeModalContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
