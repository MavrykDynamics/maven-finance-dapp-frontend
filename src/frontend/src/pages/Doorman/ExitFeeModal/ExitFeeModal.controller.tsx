import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// helpers
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { unstake } from '../Doorman.actions'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../app/App.components/Button/Button.constants'

// components
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { DoormanList } from '../DoormanStats/DoormanStats.style'
import { ExitFeeModalButtons, ExitFeeModalContent } from './ExitFeeModal.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import NewButton from 'app/App.components/Button/NewButton'
import { containerColor } from 'styles'

type ExitFeeModalPropsType = {
  closePopup: () => void
  show: boolean
  data: {
    amount: number
    mySMvkTokenBalance: number
    myMvkTokenBalance: number
    totalStakedMvk: number
    accountPkh?: string
  }
}

export const ExitFeeModal = ({
  closePopup,
  show,
  data: { amount, mySMvkTokenBalance, myMvkTokenBalance, totalStakedMvk, accountPkh },
}: ExitFeeModalPropsType) => {
  const dispatch = useDispatch()

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType }>({
    amount: '0',
    validation: '',
  })

  const unstakeCallback = (amount: number) => dispatch(unstake(amount))

  const mli = calcMLI(totalStakedMvk, totalStakedMvk)
  const fee = calcExitFee(totalStakedMvk, totalStakedMvk)

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
              <NewButton
                kind={BUTTON_PRIMARY}
                disabled={inputData.validation !== INPUT_STATUS_SUCCESS}
                onClick={() => {
                  unstakeCallback(Number(inputData.amount))
                  closePopup()
                }}
              >
                <Icon id="success-fill" fill={containerColor} /> Proceed
              </NewButton>

              <NewButton kind={BUTTON_SECONDARY} onClick={closePopup}>
                <Icon id="navigation-menu_close" /> Cancel
              </NewButton>
            </ExitFeeModalButtons>
          </ExitFeeModalContent>
        </div>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
