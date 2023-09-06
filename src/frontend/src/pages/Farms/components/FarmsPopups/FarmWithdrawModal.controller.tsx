import React, { useCallback, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'

// view
import Icon from 'app/App.components/Icon/Icon.view'
import Button from 'app/App.components/Button/NewButton'
import { Input } from '../../../../app/App.components/Input/NewInput'
import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../../app/App.components/Input/Input.constants'
import CoinsIcons from '../../../../app/App.components/Icon/CoinsIcons.view'

// types
import { FarmDepositPopupDataType } from 'providers/FarmsProvider/farms.provider.types'

// consts
import { WITHDRAW_FROM_FARM_ACTION } from 'providers/FarmsProvider/helpers/farms.const'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// utils
import { checkWhetherTokenIsFarmToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { withdrawFromFarm } from 'providers/FarmsProvider/actions/farms.actions'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useFarmsContext } from 'providers/FarmsProvider/farms.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// view
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { FarmLpActionsPopupsContent } from 'app/App.components/popup/bases/FarmsPopup.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'

export const FarmWithdrawModal = ({
  closeHandler,
  show,
  data,
}: {
  closeHandler: () => void
  show: boolean
  data: FarmDepositPopupDataType
}) => {
  const { tokensMetadata } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const { farmsMapper } = useFarmsContext()

  useLockBodyScroll(show)

  const { selectedFarmAddress } = data

  const selectedFarm = farmsMapper[selectedFarmAddress]
  const selectedFarmToken = getTokenDataByAddress({ tokenAddress: selectedFarm?.liquidityTokenAddress, tokensMetadata })

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType }>({
    amount: '0',
    validation: '',
  })

  // TODO: handle user balance
  const userTokenBalance = 0

  const depositedAmountByUser = useMemo(() => {
    return Number(selectedFarm?.farmDepositors?.find(({ address }) => userAddress === address)?.depositedAmount)
  }, [selectedFarm?.farmDepositors, userAddress])

  // input handlers
  const handleBlur = useCallback(
    () => (inputData.amount === '' ? setInputData({ ...inputData, amount: '0' }) : null),
    [inputData],
  )
  const handleFocus = useCallback(
    () => (inputData.amount === '' ? setInputData({ ...inputData, amount: '' }) : null),
    [inputData],
  )
  const handleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      const validationStatus =
        +value <= depositedAmountByUser && +value >= 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

      setInputData({ ...inputData, amount: value, validation: validationStatus })
    },
    [inputData, depositedAmountByUser],
  )

  // harvest rewards action ---------------------------
  const withdrawFromFarmAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!(selectedFarmToken && checkWhetherTokenIsFarmToken(selectedFarmToken))) {
      bug('Wrong farm token address', 'Please try to select another farm')
      return null
    }

    return await withdrawFromFarm(selectedFarmAddress, Number(inputData.amount), selectedFarmToken)
  }, [selectedFarmAddress, userAddress, inputData.amount])

  const withdrawFromFarmContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: WITHDRAW_FROM_FARM_ACTION,
      actionFn: withdrawFromFarmAction,
    }),
    [withdrawFromFarmAction],
  )

  const { action: handleWithdrawFromFarm } = useContractAction(withdrawFromFarmContractActionProps)

  if (!selectedFarm || !selectedFarmToken || !checkWhetherTokenIsFarmToken(selectedFarmToken)) return null

  const tokenName = selectedFarm.isMFarm
    ? selectedFarmToken.symbol
    : `${selectedFarmToken.farmLpData.token0?.symbol}-${selectedFarmToken.farmLpData.token1?.symbol}`

  return (
    <PopupContainer onClick={closeHandler} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <button onClick={closeHandler} className="close-modal" />
        <FarmLpActionsPopupsContent>
          <div className="popup-header">
            <CoinsIcons />
            <div>Unstake {tokenName} LP Tokens</div>
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
              balance: userTokenBalance,
              balanceAsset: tokenName,
              useMaxHandler: () => setInputData({ ...inputData, amount: String(userTokenBalance) }),
              inputStatus: inputData.validation,
              inputSize: INPUT_LARGE,
            }}
          >
            <InputPinnedTokenInfo>{tokenName}</InputPinnedTokenInfo>
          </Input>

          <div className="action-btn">
            <Button
              disabled={inputData.validation !== INPUT_STATUS_SUCCESS}
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              onClick={handleWithdrawFromFarm}
            >
              <Icon id="out" />
              Unstake LP
            </Button>
          </div>
        </FarmLpActionsPopupsContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
