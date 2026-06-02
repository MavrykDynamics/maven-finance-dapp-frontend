// helpers
import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'
import {
  ERR_MSG_TOAST,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from '../../../app/App.components/Button/Button.constants'
import { stakingInputValidation } from '../helpers/validators'
import { UNSTAKE_ACTION } from 'providers/DoormanProvider/helpers/doorman.consts'
import { DEFAULT_STAKE_UNSTAKE_INPUT } from '../Doorman.controller'
import colors from 'styles/colors'

// components
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { ExitFeeModalButtons, ExitFeeModalContent, ExitFeeModalStats } from './ExitFeeModal.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import NewButton from 'app/App.components/Button/NewButton'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { InputProps } from 'app/App.components/Input/newInput.type'
import { unstakeMVN } from 'providers/DoormanProvider/actions/doorman.actions'
import { useCallback, useMemo } from 'react'
import { validateInputLength } from 'app/App.utils/input/validateInput'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

type ExitFeeModalPropsType = {
  closePopup: () => void
  show: boolean
  data: {
    mvnExchangeRate: number
    mySMvnTokenBalance: number
    myMvnTokenBalance: number
    totalStakedMvn: number
    totalMVNSupply: number
    userAddress: string | null
  }
  inputData: typeof DEFAULT_STAKE_UNSTAKE_INPUT
  setInputData: (data: typeof DEFAULT_STAKE_UNSTAKE_INPUT) => void
}

export const ExitFeeModal = ({
  closePopup,
  show,
  data: { mvnExchangeRate, mySMvnTokenBalance, myMvnTokenBalance, totalStakedMvn, userAddress, totalMVNSupply },
  inputData,
  setInputData,
}: ExitFeeModalPropsType) => {
  const {
    contractAddresses: { doormanAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const {
    globalLoadingState: { isActionActive },
    preferences: { themeSelected },
  } = useDappConfigContext()

  const parsedInputAmount = Number(inputData.amount)
  const convertedValue = mvnExchangeRate ? parsedInputAmount * mvnExchangeRate : 0

  const mli = calcMLI(totalMVNSupply, totalStakedMvn)
  const fee = calcExitFee(totalMVNSupply, totalStakedMvn)

  const unstakeAction = useCallback(
    async (unstakeAmount: number) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }

      if (!doormanAddress) {
        bug('Wrong doorman address')
        return null
      }

      if (unstakeAmount <= 0) {
        bug('Please enter an amount superior to zero', 'Incorrect amount')
        return null
      }

      return await unstakeMVN(unstakeAmount, doormanAddress)
    },
    [bug, doormanAddress, userAddress],
  )

  const dappActionCallback = useCallback(() => {
    setInputData({ ...inputData, amount: '0', validation: INPUT_STATUS_DEFAULT })
  }, [inputData, setInputData])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UNSTAKE_ACTION,
      actionFn: unstakeAction.bind(null, Number(inputData.amount)),
      dappActionCallback: dappActionCallback,
      afterActionCallback: closePopup,
    }),
    [unstakeAction, inputData.amount, dappActionCallback, closePopup],
  )

  const { action: handleUnstake } = useContractAction(contractActionProps)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    const validationStatus = stakingInputValidation({
      amount: Number(value),
      myMvnTokenBalance: myMvnTokenBalance,
      mySMvnTokenBalance: mySMvnTokenBalance,
      userAddress,
    })

    const errorMessage = Number(value) > Number(mySMvnTokenBalance) ? "You don't have enought sMVN to unstake" : ''

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
    <PopupContainer onClick={closePopup} $show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="exitFee">
        <button onClick={closePopup} className="close-modal" />
        <h1>Unstake your MVN</h1>

        <ExitFeeModalContent>
          <label>Amount to Unstake:</label>
          <Input
            className={`input-with-rate transparent-child-wrap`}
            children={<InputPinnedTokenInfo>MVN</InputPinnedTokenInfo>}
            inputProps={inputProps}
            settings={{
              inputStatus: inputData.validation,
              convertedValue,
              inputSize: INPUT_LARGE,
              validationFns: [[validateInputLength, ERR_MSG_TOAST]],
            }}
          />
          <ExitFeeModalStats>
            <div>
              <h4>
                Maven Loyalty Index
                <CustomLink to="https://docs.mavenfinance.io/maven-finance/staking/benefits-and-fees-of-staking#exit-fee">
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon id="info" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      The Maven Loyalty Index (MLI) is a metric that balances MVN & sMVN. The more MVN is staked v.s.
                      MVN, the higher the MLI, and the lower the exit fee is. The less MVN staked v.s. MVN, the lower
                      the MLI, and the exit fee will rise. Click to read more.
                    </Tooltip.Content>
                  </Tooltip>
                </CustomLink>
              </h4>
              <var>
                <CommaNumber value={mli} endingText={' '} />
              </var>
            </div>

            <div>
              <h4>
                Exit Fee
                <CustomLink to="https://docs.mavenfinance.io/maven-finance/staking/benefits-and-fees-of-staking#exit-fee">
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon id="info" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      The Exit Fee is dynamic, adjusts according to the MLI, and may modified by governance vote. Exit
                      fees are paid directly to sMVN stakeholders for remaining active participants in securing the
                      network. Click to read more.
                    </Tooltip.Content>
                  </Tooltip>
                </CustomLink>
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
              onClick={handleUnstake}
            >
              <Icon id="doubleCheckmark" fill={colors[themeSelected].cards} /> Proceed
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
