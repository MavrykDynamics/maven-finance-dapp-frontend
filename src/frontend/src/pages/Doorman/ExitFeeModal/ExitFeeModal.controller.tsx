import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// helpers
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { unstake } from '../Doorman.actions'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../app/App.components/Button/Button.constants'

// components
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { DoormanList } from '../DoormanStats/DoormanStats.style'
import { ExitFeeModalButtons, ExitFeeModalContent } from './ExitFeeModal.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

type ExitFeeModalPropsType = {
  closePopup: () => void
  show: boolean
  data: {
    amount: number
    maximumTotalSupply: number
    mySMvkTokenBalance: number
    myMvkTokenBalance: number
    totalStakedMvk: number
    accountPkh?: string
  }
}

export const ExitFeeModal = ({
  closePopup,
  show,
  data: { amount, maximumTotalSupply, mySMvkTokenBalance, myMvkTokenBalance, totalStakedMvk, accountPkh },
}: ExitFeeModalPropsType) => {
  const dispatch = useDispatch()

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType }>({
    amount: '0',
    validation: '',
  })

  const unstakeCallback = (amount: number) => dispatch(unstake(amount))

  const validateInput = (value: number) => {
    const validityCheckResult = isValidNumberValue(
      value,
      1,
      accountPkh ? Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)) : undefined,
    )
      ? INPUT_STATUS_SUCCESS
      : INPUT_STATUS_ERROR

    setInputData({
      ...inputData,
      validation: validityCheckResult,
    })
  }

  const mli = calcMLI(maximumTotalSupply, totalStakedMvk)
  const fee = calcExitFee(maximumTotalSupply, totalStakedMvk)

  // Validating initial amount came from props
  useEffect(() => {
    validateInput(amount)
    setInputData({ ...inputData, amount: String(amount) })
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = mathRoundTwoDigit(e.target.value)
    validateInput(+value)
    setInputData({ ...inputData, amount: String(value) })
  }

  const handleFocus = () => {
    if (inputData.amount === '0') {
      setInputData({ ...inputData, amount: '' })
    }
  }

  const handleBlur = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    validateInput(+value)
    if (inputData.amount === '') {
      setInputData({ ...inputData, amount: '0' })
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="exitFee">
        <div onClick={closePopup} className="close_modal">
          +
        </div>
        <div>
          <h1>Unstake your MVK</h1>
          <ExitFeeModalContent>
            <label>Amount to Unstake:</label>
            <Input
              type={'number'}
              onChange={onInputChange}
              onBlur={handleBlur}
              value={inputData.amount}
              onFocus={handleFocus}
              pinnedText={'MVK'}
              inputStatus={inputData.validation}
            />
            <DoormanList>
              <div className="info-section">
                <h4>
                  MVK Loyalty Index
                  <a
                    href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon id="question" />
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
                    <Icon id="question" />
                  </a>
                </h4>
                <var>
                  <CommaNumber value={fee} endingText={'%'} />
                </var>
              </div>
            </DoormanList>

            <ExitFeeModalButtons>
              <Button
                text="Proceed"
                icon="success"
                disabled={inputData.validation !== INPUT_STATUS_SUCCESS}
                kind={ACTION_PRIMARY}
                onClick={() => {
                  unstakeCallback(Number(inputData.amount))
                  closePopup()
                }}
              />
              <Button text="Cancel" kind={ACTION_SECONDARY} icon="error" onClick={closePopup} />
            </ExitFeeModalButtons>
          </ExitFeeModalContent>
        </div>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
