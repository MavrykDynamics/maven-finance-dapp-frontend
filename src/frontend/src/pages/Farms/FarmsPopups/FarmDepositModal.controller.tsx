import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from '../../../app/App.components/Input/Input.controller'
import {
  InputStatusType,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../app/App.components/Input/Input.constants'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'

// actions
import { deposit } from '../Farms.actions'

// styles
import { ModalCard, ModalCardContent } from '../../../styles'
import {
  FarmCardContentSection,
  FarmCardTopSection,
  FarmTitleSection,
  FarmInputSection,
} from '../FarmCard/FarmCard.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { getUserBalanceByAddress } from 'pages/Farms/Farms.helpers'
import { FarmDepositPopupDataType } from 'pages/Farms/Farms.const'
import { useLockBodyScroll } from 'react-use'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

export const FarmDepositModal = ({
  closeHandler,
  show,
  data,
}: {
  closeHandler: () => void
  show: boolean
  data: FarmDepositPopupDataType
}) => {
  const { selectedFarmAddress = '' } = data ?? {}
  useLockBodyScroll(show)

  const dispatch = useDispatch()

  const { farms } = useSelector((state: State) => state.farm)
  const farm = farms.find(({ address }) => selectedFarmAddress === address)

  const [userBalance, setUserBalance] = useState(0)
  const [amount, setAmount] = useState<number | string>(0)
  const [status, setStatus] = useState<InputStatusType>('')

  const checkInputIsOk = (value: number | '') => {
    setStatus(value && value <= userBalance && value >= 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR)
  }

  const getUserBalance = async () => {
    try {
      const userBalanceFetched = Number(await getUserBalanceByAddress(farm?.lpTokenAddress))
      setUserBalance(userBalanceFetched)
    } catch (e) {
      console.error('getUserBalance farms depositModal error:', e)
    }
  }

  useEffect(() => {
    getUserBalance()
  }, [])

  useEffect(() => {
    checkInputIsOk(Number(amount))
  }, [amount])

  const disabled = !amount || !selectedFarmAddress || status === INPUT_STATUS_ERROR

  const tokesnNames =
    farm && farm.lpToken1.symbol && farm.lpToken2.symbol && `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}`

  const handleBlur = () => {
    if (amount === '') {
      setAmount(0)
    }
  }

  const handleFocus = () => {
    if (amount === 0) {
      setAmount('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.setCustomValidity('')
    setAmount(e.target.value)

    if (Number(e.target.value) > userBalance) {
      e.target.setCustomValidity('Not enough balance')
      e.target.reportValidity()
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!disabled) {
      dispatch(deposit(selectedFarmAddress, Number(amount)))
    }
  }

  const useMaxHandler = () => {
    setAmount(+userBalance)
  }

  return (
    <PopupContainer onClick={closeHandler} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <ModalCardContent className="farm-modal">
          <FarmCardTopSection>
            <FarmCardContentSection>
              <CoinsIcons />
              <FarmTitleSection>
                <h3>Stake {tokesnNames} LP Tokens</h3>
              </FarmTitleSection>
            </FarmCardContentSection>
          </FarmCardTopSection>

          <FarmInputSection onSubmit={handleSubmit}>
            <div className="input-info">
              <div />
              <button type="button" onClick={useMaxHandler}>
                Use Max
              </button>
            </div>
            <Input
              type={'number'}
              placeholder={String(amount)}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              value={amount}
              pinnedText={`${tokesnNames} LP`}
              inputStatus={status}
              className="farm-modal-input"
            />
            <div className="input-info">
              <p>{tokesnNames} LP Balance</p>
              <p>
                <CommaNumber value={userBalance} />
              </p>
            </div>
            <Button
              className="farm-button"
              text="Stake LP"
              kind="actionPrimary"
              icon="in"
              type="submit"
              disabled={disabled}
            />
          </FarmInputSection>
        </ModalCardContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
