import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'

// view
import Icon from 'app/App.components/Icon/Icon.view'
import Button from 'app/App.components/Button/NewButton'
import { Input } from '../../../../app/App.components/Input/NewInput'
import { PopupContainer } from 'app/App.components/popup/PopupMain.style'
import { FarmActionsPopupsContent } from 'app/App.components/popup/bases/FarmsPopup.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { FarmCardCoinIcons, FARM_CARD_COINS_LARGE } from '../FarmCard/cardParts/FarmCardCoinIcons'

// types
import { FarmDepositPopupDataType } from 'providers/FarmsProvider/farms.provider.types'

// consts
import { DEPOSIT_TO_FARM_ACTION } from 'providers/FarmsProvider/helpers/farms.const'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  INPUT_STATUS_DEFAULT,
} from '../../../../app/App.components/Input/Input.constants'

// utils
import { checkWhetherTokenIsFarmToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { depositToFarm } from 'providers/FarmsProvider/actions/farms.actions'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useFarmsContext } from 'providers/FarmsProvider/farms.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

export const FarmDepositModal = ({
  closeHandler,
  show,
  data,
}: {
  closeHandler: () => void
  show: boolean
  data: FarmDepositPopupDataType
}) => {
  const { tokensMetadata } = useTokensContext()
  const { userAddress, userTokensBalances } = useUserContext()
  const { bug } = useToasterContext()
  const { farmsMapper } = useFarmsContext()

  useLockBodyScroll(show)

  useEffect(() => {
    if (!show) {
      setInputData({
        amount: '0',
        validation: INPUT_STATUS_DEFAULT,
      })
    }
  }, [show])

  const { selectedFarmAddress } = data

  const selectedFarm = farmsMapper[selectedFarmAddress]
  const selectedFarmToken = getTokenDataByAddress({ tokenAddress: selectedFarm?.liquidityTokenAddress, tokensMetadata })

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType }>({
    amount: '0',
    validation: '',
  })

  const userTokenBalance = getUserTokenBalanceByAddress({
    userTokensBalances,
    tokenAddress: selectedFarm?.liquidityTokenAddress,
  })

  // input handlers
  const handleBlur = useCallback(
    () => (inputData.amount === '' ? setInputData({ ...inputData, amount: '0' }) : null),
    [inputData],
  )
  const handleFocus = useCallback(
    () => (inputData.amount === '0' ? setInputData({ ...inputData, amount: '' }) : null),
    [inputData],
  )
  const handleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      const numberOfDecimalPlaces = value.match(/\.(\d+)/)?.[1].length ?? 0
      const isValidDecimalsAmount = selectedFarmToken ? numberOfDecimalPlaces <= selectedFarmToken?.decimals : false
      const validationStatus =
        isValidDecimalsAmount && +value <= userTokenBalance && +value > 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

      setInputData({ ...inputData, amount: value, validation: validationStatus })
    },
    [inputData, selectedFarmToken, userTokenBalance],
  )

  // harvest rewards action ---------------------------
  const depositToFarmAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!(selectedFarmToken && checkWhetherTokenIsFarmToken(selectedFarmToken))) {
      bug('Wrong farm token address', 'Please try to select another farm')
      return null
    }

    return await depositToFarm(selectedFarmAddress, userAddress, Number(inputData.amount), selectedFarmToken)
  }, [selectedFarmAddress, userAddress, inputData.amount, selectedFarmToken])

  const depositToFarmContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DEPOSIT_TO_FARM_ACTION,
      actionFn: depositToFarmAction,
      afterActionCallback: closeHandler,
    }),
    [closeHandler, depositToFarmAction],
  )

  const { action: handleDepositToFarm } = useContractAction(depositToFarmContractActionProps)

  if (!selectedFarm || !selectedFarmToken || !checkWhetherTokenIsFarmToken(selectedFarmToken)) return null

  const tokenName = selectedFarm.isMFarm
    ? selectedFarmToken.symbol
    : `${selectedFarmToken.farmLpData.token0?.symbol}-${selectedFarmToken.farmLpData.token1?.symbol}`

  return (
    <PopupContainer onClick={closeHandler} $show={show}>
      <FarmActionsPopupsContent onClick={(e) => e.stopPropagation()}>
        <button onClick={closeHandler} className="close-modal" />
        <div className="popup-header">
          <FarmCardCoinIcons
            farmToken={selectedFarmToken}
            isMFarm={selectedFarm.isMFarm}
            size={FARM_CARD_COINS_LARGE}
          />
          <div>Stake {tokenName} LP Tokens</div>
        </div>

        <Input
          className={`pinned-dropdown`}
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
            useMaxHandler: () =>
              setInputData({
                ...inputData,
                amount: String(userTokenBalance),
                validation: userTokenBalance === 0 ? INPUT_STATUS_DEFAULT : INPUT_STATUS_SUCCESS,
              }),
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
            onClick={handleDepositToFarm}
          >
            <Icon id="in" />
            Stake LP
          </Button>
        </div>
      </FarmActionsPopupsContent>
    </PopupContainer>
  )
}
