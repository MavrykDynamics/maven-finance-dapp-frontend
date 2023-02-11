import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// helpers
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { unstake } from '../Doorman.actions'
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../app/App.components/Button/Button.constants'

// components
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import {
  StakeUnstakeForm,
  StakeUnstakeFormInputStatus,
  ValidStakeUnstakeForm,
} from '../../../utils/TypesAndInterfaces/Forms'
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

  const [inputAmount, setInputAmount] = useState<StakeUnstakeForm>({ amount: 0 })
  const [stakeUnstakeValueOK, setStakeUnstakeValueOK] = useState<ValidStakeUnstakeForm>({ amount: false })
  const [stakeUnstakeInputStatus, setStakeUnstakeInputStatus] = useState<StakeUnstakeFormInputStatus>({ amount: '' })
  const [stakeUnstakeValueError, setStakeUnstakeValueError] = useState('')

  const unstakeCallback = (amount: number) => dispatch(unstake(amount))

  const mli = calcMLI(maximumTotalSupply, totalStakedMvk)
  const fee = calcExitFee(maximumTotalSupply, totalStakedMvk)
  const inputAmountValue = +inputAmount.amount

  useEffect(() => {
    checkInputIsOk(amount)
    setInputAmount({ amount })
  }, [amount])

  const checkInputIsOk = (value: number) => {
    let validityCheckResult = false
    setStakeUnstakeValueError('')
    if (accountPkh) {
      validityCheckResult = isValidNumberValue(
        value,
        1,
        Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)),
      )
    } else {
      validityCheckResult = isValidNumberValue(value, 1)
    }
    setStakeUnstakeValueOK({ amount: validityCheckResult })
    setStakeUnstakeInputStatus({ amount: validityCheckResult ? 'success' : 'error' })
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = mathRoundTwoDigit(e.target.value)
    checkInputIsOk(+value)
    setInputAmount({ amount: value })
  }

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (+value === 0) {
      setInputAmount({ amount: '' })
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
              onBlur={() => checkInputIsOk(inputAmountValue)}
              value={inputAmount.amount}
              onFocus={handleFocus}
              pinnedText={'MVK'}
              inputStatus={stakeUnstakeInputStatus.amount}
              errorMessage={stakeUnstakeValueError}
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
                disabled={!stakeUnstakeValueOK.amount}
                kind={ACTION_PRIMARY}
                onClick={() => {
                  unstakeCallback(inputAmountValue)
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
