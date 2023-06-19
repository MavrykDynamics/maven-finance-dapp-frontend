import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// context
import { useStakeContext } from 'providers/StakeProvider/stake.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { InputErrorMessage, InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// helpers
import { mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { rewardsCompound } from '../Doorman.actions'
import { stakingInputValidation } from '../Doorman.converter'
import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { unknownToError } from 'errors/error'
import { sleep } from 'utils/api/sleep'

// consts
import {
  BUTTON_PRIMARY,
  BUTTON_PULSE,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from '../../../app/App.components/Button/Button.constants'
import { STAKE_ACTION } from 'providers/StakeProvider/helpers/stake.consts'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { InputStatusType, INPUT_STATUS_SUCCESS, INPUT_LARGE } from 'app/App.components/Input/Input.constants'
import { SMVK_TOKEN_ADDRESS, MVK_TOKEN_SYMBOL } from 'utils/constants'
import { DEFAULT_STAKE_UNSTAKE_INPUT } from '../Doorman.controller'
import colors from 'styles/colors'

// style
import {
  StakeLabel,
  StakeUnstakeActionCard,
  StakeUnstakeBalance,
  StakeUnstakeButtonGrid,
  StakeUnstakeCard,
  StakeUnstakeInputColumn,
  StakeUnstakeInputWithCoin,
  StakeUnstakeInputLabels,
  StakeUnstakeRate,
  StakeUnstakeStyled,
  StakeUnstakeCards,
  StakeUnstakeRightPart,
  StakeDelegatedUser,
  StakeUnstakeAmount,
} from './StakeUnstake.style'

// types
import { State } from 'reducers'
import { InputProps } from 'app/App.components/Input/newInput.type'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

type StakeUnstakeViewProps = {
  openExitFeePopup: () => void
  mvkExchangeRate: number
  inputData: typeof DEFAULT_STAKE_UNSTAKE_INPUT
  setInputData: (data: typeof DEFAULT_STAKE_UNSTAKE_INPUT) => void
}

export const StakeUnstakeView = ({
  openExitFeePopup,
  mvkExchangeRate,
  inputData,
  setInputData,
}: StakeUnstakeViewProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { stakeMVK, updateStakeActionContext, updateStakeLoadingToasterId, loadingToasterId } = useStakeContext()
  const { info, loading, hideToasterMessage, bug } = useToasterContext()
  const { userTokensBalances } = useUserContext()

  const {
    accountPkh,
    user: {
      availableDoormanRewards,
      availableSatellitesRewards,
      availableFarmRewards,
      satelliteMvkIsDelegatedTo,
      isSatellite,
    },
  } = useSelector((state: State) => state.wallet)

  const { satelliteMapper } = useSelector((state: State) => state.satellites)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const {
    doormanAddress: { address: doormanAddress },
    mvkTokenAddress: { address: mvkTokenAddress },
  } = useSelector((state: State) => state.contractAddresses)

  const delegatedUser = satelliteMapper[satelliteMvkIsDelegatedTo]
  const mySMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }),
    myMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress })

  const mySMvkBalanceIsZero = mySMvkTokenBalance === 0
  const exchangeValue = mvkExchangeRate && inputData.amount ? Number(inputData.amount) * mvkExchangeRate : 0
  const rewardsToClaim =
    availableDoormanRewards +
    availableSatellitesRewards +
    Object.values(availableFarmRewards).reduce((acc, { myAvailableFarmRewards }) => (acc += myAvailableFarmRewards), 0)
  const showDelegateBtn = !isSatellite && !satelliteMvkIsDelegatedTo

  const onUseMaxBalance = (balance: 'smvk' | 'mvk') => () => {
    handleInputData(String(mathRoundTwoDigit(balance === 'mvk' ? myMvkTokenBalance : mySMvkTokenBalance)))
  }

  const onInputChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    handleInputData(value)
  }

  const handleInputData = (value: string) => {
    const validationStatus = stakingInputValidation({
      amount: Number(value),
      myMvkTokenBalance,
      mySMvkTokenBalance,
      accountPkh,
    })

    setInputData({ ...inputData, amount: value, validation: validationStatus })
  }

  // Stake actions
  const handleStakeAll = async () => {
    if (!myMvkTokenBalance) return

    setInputData({
      ...inputData,
      amount: String(mathRoundTwoDigit(myMvkTokenBalance)),
      validation: INPUT_STATUS_SUCCESS,
    })

    await handleStake(myMvkTokenBalance)
  }

  const handleStake = async (stakeAmount: number) => {
    const canStakeAmount = stakeAmount <= Number(myMvkTokenBalance)

    if (!canStakeAmount) {
      setInputData({
        ...inputData,
        errorMessage: "You don't have enought MVK to stake",
      })
    }

    if (!accountPkh) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }

    if (stakeAmount <= 0) {
      bug('Please enter an amount superior to zero', 'Incorrect amount')
      return
    }

    setInputData({
      ...inputData,
      errorMessage: '',
    })

    const { actionSuccess, error } = await stakeMVK(stakeAmount, accountPkh, doormanAddress, mvkTokenAddress)

    if (actionSuccess && !error) {
      updateStakeActionContext(STAKE_ACTION)
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))

      info(
        TOASTER_ACTIONS_TEXTS[STAKE_ACTION]['start']['message'],
        TOASTER_ACTIONS_TEXTS[STAKE_ACTION]['start']['title'],
      )

      await sleep(5000)

      // show toaster loader after 5000ms after operation started
      const loadingToasterId = loading(
        TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
      )
      updateStakeLoadingToasterId(loadingToasterId)
    } else {
      if (loadingToasterId) hideToasterMessage(loadingToasterId)
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
      const parsedError = unknownToError(error)
      bug(parsedError.message)
    }
  }

  const handleUnstakeAll = () => {
    if (!mySMvkTokenBalance) return

    setInputData({
      ...inputData,
      amount: String(mathRoundTwoDigit(mySMvkTokenBalance)),
      validation: INPUT_STATUS_SUCCESS,
    })
    openExitFeePopup()
  }

  const handleCompound = async () => {
    if (accountPkh) {
      await dispatch(rewardsCompound(accountPkh))
    }
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

  const handleDelegate = () => {
    history.push(
      satelliteMvkIsDelegatedTo ? `/satellites/satellite-details/${satelliteMvkIsDelegatedTo}` : '/satellite-nodes',
    )
  }

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeCards>
        <StakeUnstakeCard>
          <StakeUnstakeBalance>
            <ImageWithPlug imageLink={'/images/coin-gold.svg'} alt="coin" />
            <div>
              <h3>My MVK Balance</h3>
              <div className="balance-btn-group">
                <CommaNumber value={myMvkTokenBalance} className="amount" />
                {Boolean(myMvkTokenBalance) && (
                  <NewButton onClick={handleStakeAll} kind={BUTTON_SIMPLE} disabled={isActionActive}>
                    Stake All
                  </NewButton>
                )}
              </div>
            </div>
          </StakeUnstakeBalance>
        </StakeUnstakeCard>

        <StakeUnstakeCard>
          <StakeUnstakeBalance>
            <ImageWithPlug imageLink={'/images/coin-silver.svg'} alt="coin" />
            <div>
              <h3>Total MVK Staked</h3>
              <div className="balance-btn-group">
                <CommaNumber value={mySMvkTokenBalance} className="amount" />
                {Boolean(mySMvkTokenBalance) && (
                  <NewButton onClick={handleUnstakeAll} kind={BUTTON_SIMPLE} disabled={isActionActive}>
                    Unstake All
                  </NewButton>
                )}
              </div>
            </div>
          </StakeUnstakeBalance>

          <StakeUnstakeRightPart>
            {mySMvkBalanceIsZero && myMvkTokenBalance > 0 && <StakeLabel>Not Staking</StakeLabel>}

            {!mySMvkBalanceIsZero && showDelegateBtn && (
              <NewButton
                onClick={handleDelegate}
                kind={BUTTON_PRIMARY}
                form={BUTTON_WIDE}
                disabled={!accountPkh || isActionActive}
                isThin
                animation={accountPkh ? BUTTON_PULSE : null}
              >
                <Icon id="satellites" />
                Delegate
              </NewButton>
            )}

            {!mySMvkBalanceIsZero && delegatedUser && (
              <StakeDelegatedUser>
                <ImageWithPlug className="userImage" imageLink={delegatedUser.image} alt="user image" />

                <div>
                  <h3>Delegated to</h3>
                  <span>{delegatedUser.name}</span>
                </div>
              </StakeDelegatedUser>
            )}
          </StakeUnstakeRightPart>
        </StakeUnstakeCard>

        <StakeUnstakeCard>
          <StakeUnstakeBalance>
            <ImageWithPlug imageLink={'/images/coin-bronze.svg'} alt="coin" />
            <div>
              <h3>
                Pending MVK Rewards{' '}
                <CustomTooltip
                  text="Amount of MVK you have earned and not yet claimed. This resets every time you stake, unstake, or compound as doing one of those actions will automatically credit your staked MVK balance with any unclaimed rewards."
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                />
              </h3>
              <CommaNumber value={rewardsToClaim} className="amount" />
            </div>
          </StakeUnstakeBalance>

          <StakeUnstakeRightPart>
            <NewButton
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              isThin
              onClick={handleCompound}
              disabled={rewardsToClaim < 2 || isActionActive}
            >
              <Icon id="compound" /> Compound
            </NewButton>
            <CustomTooltip
              text={
                rewardsToClaim < 2 || isActionActive
                  ? `Compounds your pending exit fee rewards and converts them to sMVK. You currently, do not have any pending exit fee rewards amounting to at least 2 sMVK.`
                  : `Compounds your pending exit fee rewards and converts them to sMVK.`
              }
              iconId="info"
              className="tooltip"
              defaultStrokeColor={colors[themeSelected].textColor}
            />
          </StakeUnstakeRightPart>
        </StakeUnstakeCard>
      </StakeUnstakeCards>

      <StakeUnstakeActionCard>
        <StakeUnstakeInputColumn>
          <StakeUnstakeInputLabels>
            <div className="minAmount">Min 1 MVK</div>

            <StakeUnstakeAmount onClick={onUseMaxBalance('smvk')}>
              <span>Staked Amount:</span>
              &nbsp;
              <CommaNumber value={mySMvkTokenBalance} endingText={'MVK'} />
            </StakeUnstakeAmount>
          </StakeUnstakeInputLabels>

          <StakeUnstakeInputWithCoin>
            <ImageWithPlug imageLink={'/images/coin-gold.svg'} alt="coin" />
            <Input
              className={`input-with-rate transparent-child-wrap`}
              children={<InputPinnedTokenInfo>MVK</InputPinnedTokenInfo>}
              inputProps={inputProps}
              settings={{
                inputStatus: inputData.validation,
                convertedValue: exchangeValue,
                balance: myMvkTokenBalance,
                balanceAsset: 'MVK',
                balanceName: 'Wallet Balance',
                inputSize: INPUT_LARGE,
                balanceHandler: onUseMaxBalance('mvk'),
              }}
            />
          </StakeUnstakeInputWithCoin>
          {inputData.errorMessage && (
            <InputErrorMessage className="errorMessage">{inputData.errorMessage}</InputErrorMessage>
          )}
        </StakeUnstakeInputColumn>

        <StakeUnstakeRate onClick={onUseMaxBalance('smvk')}>
          <span>1 MVK =</span>
          &nbsp;
          <CommaNumber value={mvkExchangeRate} beginningText={'$'} />
        </StakeUnstakeRate>

        <StakeUnstakeButtonGrid>
          <NewButton
            kind={BUTTON_PRIMARY}
            onClick={() => handleStake(Number(inputData.amount))}
            form={BUTTON_WIDE}
            disabled={isActionActive}
          >
            <Icon id="in" /> Stake
          </NewButton>

          <NewButton kind={BUTTON_SECONDARY} onClick={openExitFeePopup} form={BUTTON_WIDE} disabled={isActionActive}>
            <Icon id="out" /> Unstake
          </NewButton>
        </StakeUnstakeButtonGrid>
      </StakeUnstakeActionCard>
    </StakeUnstakeStyled>
  )
}
