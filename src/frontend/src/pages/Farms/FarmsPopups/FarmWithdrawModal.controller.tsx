import { useEffect, useState } from 'react'
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
import { withdraw } from '../Farms.actions'

// styles
import {
  FarmCardContentSection,
  FarmCardTopSection,
  FarmTitleSection,
  FarmInputSection,
} from '../FarmCard/FarmCard.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { getUserBalanceByAddress } from 'pages/Farms/Farms.helpers'
import { FarmWithdrawPopupDataType } from 'pages/Farms/Farms.const'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// TODO: redo markup, move balance fetching to normalizing phase, redo in the loans popup way
export const FarmWithdrawModal = ({
  closeHandler,
  show,
  data,
}: {
  closeHandler: () => void
  show: boolean
  data: FarmWithdrawPopupDataType
}) => {
  const { selectedFarmAddress = '' } = data ?? {}

  const dispatch = useDispatch()

  const { farms } = useSelector((state: State) => state.farm)
  const farm = farms.find(({ address }) => selectedFarmAddress === address)

  const [userBalance, setUserBalance] = useState(0)
  const [amount, setAmount] = useState<number | string>(0)
  const [status, setStatus] = useState<InputStatusType>('')

  const checkInputIsOk = (value: number | '') => {
    setStatus(value && value <= userBalance && value >= 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR)
  }

  // TODO: move it to already calculated field in redux
  const getUserBalance = async () => {
    try {
      const userBalanceFetched = Number(await getUserBalanceByAddress(farm?.lpTokenAddress))
      setUserBalance(userBalanceFetched)
    } catch (e) {
      console.error('getUserBalance farms withdrawModal error:', e)
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
      dispatch(withdraw(selectedFarmAddress, Number(amount)))
    }
  }

  const useMaxHandler = () => {
    setAmount(+userBalance)
  }

  return (
    <PopupContainer onClick={closeHandler} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <FarmCardTopSection>
          <FarmCardContentSection>
            <CoinsIcons />
            <FarmTitleSection>
              <h3>Unstake {tokesnNames} LP Tokens</h3>
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
          {/* <div className="input-info">
            <p>Withdrawal Fee</p>
            <p>
              <CommaNumber value={1.4} endingText="%" />
            </p>
          </div> */}
          <Button
            className="farm-button"
            text="Withdraw"
            kind="actionSecondary"
            icon="out"
            type="submit"
            disabled={disabled}
          />
        </FarmInputSection>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
