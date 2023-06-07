import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { Input } from '../../../app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'

// actions
import { FarmDepositPopupDataType } from 'pages/Farms/Farms.const'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { withdraw } from '../Farms.actions'
import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../app/App.components/Input/Input.constants'

// styles
import { useLockBodyScroll } from 'react-use'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { FarmLpActionsPopupsContent } from '../Farms.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { farm } from 'reducers/farm'

export const FarmWithdrawModal = ({
  closeHandler,
  show,
  data,
}: {
  closeHandler: () => void
  show: boolean
  data: FarmDepositPopupDataType
}) => {
  const { selectedFarmAddress = '' } = data ?? {}

  const dispatch = useDispatch()
  useLockBodyScroll(show)

  const { farms } = useSelector((state: State) => state.farm)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    lpTokenUserBalance = 0,
    lpToken1: { symbol: lpTokenOneSymbol = '' } = {},
    lpToken2: { symbol: lpTokenTwoSymbol = '' } = {},
    farmAccounts = [],
  } = farms.find(({ address }) => selectedFarmAddress === address) ?? {}

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType }>({
    amount: '0',
    validation: '',
  })

  const farmDepositedAmountByUser = useMemo(() => {
    return Number(farmAccounts.find(({ user: { address } }) => accountPkh === address))
  }, [farmAccounts, accountPkh])

  const tokensNames = `${lpTokenOneSymbol}/${lpTokenTwoSymbol}`

  const handleBlur = () => {
    if (inputData.amount === '') {
      setInputData({ ...inputData, amount: '0' })
    }
  }

  const handleFocus = () => {
    if (inputData.amount === '0') {
      setInputData({ ...inputData, amount: '' })
    }
  }

  const handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    const validationStatus =
      +value && +value <= farmDepositedAmountByUser && +value >= 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

    setInputData({ ...inputData, amount: value, validation: validationStatus })
  }

  const handleClick = () => {
    if (selectedFarmAddress && inputData.validation === INPUT_STATUS_SUCCESS) {
      dispatch(withdraw(selectedFarmAddress, Number(inputData.amount)))
    }
  }

  return (
    <PopupContainer onClick={closeHandler} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <button onClick={closeHandler} className="close-modal" />
        <FarmLpActionsPopupsContent>
          <div className="popup-header">
            <CoinsIcons />
            <div className="token-names">Unstake {tokensNames} LP Tokens</div>
          </div>

          <Input
            className={`pinned-dropdown mb-45`}
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onBlur: handleBlur,
              onFocus: handleFocus,
              onChange: handleChange,
            }}
            settings={{
              balance: lpTokenUserBalance,
              balanceAsset: tokensNames,
              useMaxHandler: () => setInputData({ ...inputData, amount: String(lpTokenUserBalance) }),
              inputStatus: inputData.validation,
              inputSize: INPUT_LARGE,
            }}
          >
            <InputPinnedTokenInfo>{tokensNames}</InputPinnedTokenInfo>
          </Input>

          <NewButton
            disabled={inputData.validation !== INPUT_STATUS_SUCCESS}
            kind={BUTTON_PRIMARY}
            onClick={handleClick}
          >
            <Icon id="out" />
            Unstake LP
          </NewButton>
        </FarmLpActionsPopupsContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
