import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// helpers
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { unstake } from '../Doorman.actions'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import {
  InputStatusType,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  INPUT_LARGE,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from '../../../app/App.components/Button/Button.constants'

// components
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { ExitFeeModalButtons, ExitFeeModalContent, ExitFeeModalStats } from './ExitFeeModal.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import NewButton from 'app/App.components/Button/NewButton'
import { containerColor } from 'styles'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { CustomTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'

type ExitFeeModalPropsType = {
  closePopup: () => void
  show: boolean
  data: {
    amount: number
    mvkExchangeRate: number
    mySMvkTokenBalance: number
    myMvkTokenBalance: number
    totalStakedMvk: number
    totalMVKSupply: number
    accountPkh?: string
  }
}

export const ExitFeeModal = ({
  closePopup,
  show,
  data: { amount, mvkExchangeRate, mySMvkTokenBalance, myMvkTokenBalance, totalStakedMvk, accountPkh, totalMVKSupply },
}: ExitFeeModalPropsType) => {
  const dispatch = useDispatch()

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType }>({
    amount: '0',
    validation: '',
  })

  const inputAmount = Number(inputData.amount).toFixed(2)
  const convertedValue = mvkExchangeRate && inputData.amount ? Number(inputData.amount) * mvkExchangeRate : 0

  const mli = calcMLI(totalMVKSupply, totalStakedMvk)
  const fee = calcExitFee(totalMVKSupply, totalStakedMvk)

  const unstakeCallback = (amount: number) => dispatch(unstake(amount))

  // Validating initial amount came from props
  useEffect(() => {
    setInputData({
      amount: String(amount),
      validation: isValidNumberValue(
        amount,
        1,
        accountPkh ? Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)) : undefined,
      )
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR,
    })

    return () => {
      setInputData({
        amount: '0',
        validation: '',
      })
    }
  }, [show])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = mathRoundTwoDigit(e.target.value)
    setInputData({
      amount: String(amount),
      validation: isValidNumberValue(
        +value,
        1,
        accountPkh ? Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)) : undefined,
      )
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR,
    })
  }

  const handleFocus = () => {
    if (inputData.amount === '0') {
      setInputData({ ...inputData, amount: '' })
    }
  }

  const handleBlur = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    if (inputData.amount === '') {
      setInputData({ ...inputData, amount: '0' })
    }
  }

  const inputProps = {
    type: 'number',
    value: inputAmount,
    onBlur: handleBlur,
    onFocus: handleFocus,
    onChange: onInputChange,
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="exitFee">
        <div onClick={closePopup} className="close-modal">
          +
        </div>
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
                  href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
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
                  href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
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
              disabled={inputData.validation !== INPUT_STATUS_SUCCESS}
              onClick={() => {
                unstakeCallback(Number(inputData.amount))
                closePopup()
              }}
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
