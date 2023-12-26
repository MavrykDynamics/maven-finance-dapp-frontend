import { Link, useHistory } from 'react-router-dom'
import { useCallback, useEffect, useMemo } from 'react'

// context
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { stakeMVK } from 'providers/DoormanProvider/actions/doorman.actions'
import { rewardsCompound } from 'providers/UserProvider/actions/user.actions'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { InputErrorMessage } from 'app/App.components/Input/Input.style'

// helpers
import { mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { stakingInputValidation } from '../helpers/validators'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { validateInputLength } from 'app/App.utils/input/validateInput'

// consts
import {
  BUTTON_PRIMARY,
  BUTTON_PULSE,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from '../../../app/App.components/Button/Button.constants'
import { STAKE_ACTION } from 'providers/DoormanProvider/helpers/doorman.consts'
import { REWARDS_COMPOUND_ACTION } from 'providers/UserProvider/helpers/user.consts'
import {
  ERR_MSG_TOAST,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { DEFAULT_STAKE_UNSTAKE_INPUT } from '../Doorman.controller'

// style
import {
  StakeDelegatedUser,
  StakeLabel,
  StakeUnstakeActionCard,
  StakeUnstakeAmount,
  StakeUnstakeBalance,
  StakeUnstakeButtonGrid,
  StakeUnstakeCard,
  StakeUnstakeCards,
  StakeUnstakeInputColumn,
  StakeUnstakeInputLabels,
  StakeUnstakeInputWithCoin,
  StakeUnstakeRate,
  StakeUnstakeRightPart,
  StakeUnstakeStyled,
} from './StakeUnstake.style'

// types
import { InputProps } from 'app/App.components/Input/newInput.type'

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
  const history = useHistory()
  const { userTokensBalances, userAddress, satelliteMvkIsDelegatedTo, isSatellite } = useUserContext()
  const { availableDoormanRewards, availableSatellitesRewards, availableFarmRewards } = useUserRewards()
  const {
    contractAddresses: { mvkTokenAddress, doormanAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { bug } = useToasterContext()

  const { satelliteMapper, setSatelliteAddressToSubsctibe } = useSatellitesContext()

  useEffect(() => {
    if (satelliteMvkIsDelegatedTo) {
      setSatelliteAddressToSubsctibe(satelliteMvkIsDelegatedTo)
    }
    return () => setSatelliteAddressToSubsctibe(null)
  }, [satelliteMvkIsDelegatedTo])

  const delegatedUser = satelliteMvkIsDelegatedTo ? satelliteMapper[satelliteMvkIsDelegatedTo] : null
  const mySMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }),
    myMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress })

  const mySMvkBalanceIsZero = mySMvkTokenBalance === 0
  const exchangeValue = mvkExchangeRate && inputData.amount ? Number(inputData.amount) * mvkExchangeRate : 0
  // TODO: @Sam-M-Israel check whether include farms & satellite rewards, cuz compound btn claims only doorman rewards here
  const rewardsToClaim =
    availableDoormanRewards +
    availableSatellitesRewards +
    Object.values(availableFarmRewards).reduce((acc, farmReward) => (acc += farmReward), 0)
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
      userAddress,
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

    await handleStake()
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

  // stake action -------------------------

  const stakeAction = useCallback(
    async (stakeAmount: number) => {
      const canStakeAmount = stakeAmount <= Number(myMvkTokenBalance)

      if (!canStakeAmount) {
        setInputData({
          ...inputData,
          errorMessage: "You don't have enought MVK to stake",
        })

        return null
      }

      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!doormanAddress || !mvkTokenAddress) {
        bug('Wrong doorman or mvkToken address was provided')
        return null
      }

      if (stakeAmount <= 0) {
        bug('Please enter an amount superior to zero', 'Incorrect amount')
        return null
      }

      setInputData({
        ...inputData,
        errorMessage: '',
      })

      return await stakeMVK(stakeAmount, userAddress, doormanAddress, mvkTokenAddress)
    },
    [bug, doormanAddress, inputData, mvkTokenAddress, myMvkTokenBalance, setInputData, userAddress],
  )

  const dappCallback = useCallback(() => {
    setInputData({ ...inputData, amount: '0', validation: INPUT_STATUS_DEFAULT })
  }, [inputData, setInputData])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: STAKE_ACTION,
      actionFn: stakeAction.bind(null, Number(inputData.amount)),
      dappActionCallback: dappCallback,
    }),
    [dappCallback, inputData.amount, stakeAction],
  )

  const { action: handleStake } = useContractAction(contractActionProps)

  // compound action ---------------------------

  const rewardsCompoundAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!doormanAddress) {
      bug('Wrong doorman address')
      return null
    }

    return await rewardsCompound(userAddress, doormanAddress)
  }, [bug, doormanAddress, userAddress])

  const compoundContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REWARDS_COMPOUND_ACTION,
      actionFn: rewardsCompoundAction,
    }),
    [rewardsCompoundAction],
  )

  const { action: handleCompound } = useContractAction(compoundContractActionProps)

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
              <h3>My MVN Balance</h3>
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
              <h3>My Staked MVN Balance</h3>
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
                disabled={!userAddress || isActionActive}
                isThin
                animation={userAddress ? BUTTON_PULSE : null}
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
                Pending sMVN Rewards
                <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    The amount of pending sMVK you have earned but not yet claimed. Claim your rewards in the Personal
                    Dashboard.
                  </Tooltip.Content>
                </Tooltip>
              </h3>
              <CommaNumber value={rewardsToClaim} className="amount" />
            </div>
          </StakeUnstakeBalance>

          <StakeUnstakeRightPart>
            {/*<NewButton*/}
            {/*  kind={BUTTON_PRIMARY}*/}
            {/*  form={BUTTON_WIDE}*/}
            {/*  isThin*/}
            {/*  onClick={handleCompound}*/}
            {/*  disabled={rewardsToClaim < 2 || isActionActive}*/}
            {/*>*/}
            {/*  <Icon id="compound" /> Compound*/}
            {/*</NewButton>*/}
            <Link to={`/dashboard-personal/portfolio/`}>Personal Dashboard</Link>
            {/*<Tooltip>*/}
            {/*  <Tooltip.Trigger className="tooltip-trigger">*/}
            {/*    <Icon id="info" />*/}
            {/*  </Tooltip.Trigger>*/}
            {/*  <Tooltip.Content>*/}
            {/*    {rewardsToClaim < 2 || isActionActive*/}
            {/*      ? `Compounds your pending exit fee rewards and converts them to sMVK. You currently, do not have any pending exit fee rewards amounting to at least 2 sMVK.`*/}
            {/*      : `Compounds your pending exit fee rewards and converts them to sMVK.`}*/}
            {/*  </Tooltip.Content>*/}
            {/*</Tooltip>*/}
          </StakeUnstakeRightPart>
        </StakeUnstakeCard>
      </StakeUnstakeCards>

      <StakeUnstakeActionCard>
        <StakeUnstakeInputColumn>
          <StakeUnstakeInputLabels>
            <div className="minAmount">Min 1 MVN</div>

            <StakeUnstakeAmount onClick={onUseMaxBalance('smvk')}>
              <span>Staked Amount:</span>
              &nbsp;
              <CommaNumber value={mySMvkTokenBalance} endingText={'MVN'} />
            </StakeUnstakeAmount>
          </StakeUnstakeInputLabels>

          <StakeUnstakeInputWithCoin>
            <Input
              className={`input-with-rate transparent-child-wrap`}
              children={'MVK'}
              inputProps={inputProps}
              settings={{
                inputStatus: inputData.validation,
                convertedValue: exchangeValue,
                balance: myMvkTokenBalance,
                balanceAsset: 'MVK',
                balanceName: 'Wallet Balance',
                inputSize: INPUT_LARGE,
                balanceHandler: onUseMaxBalance('mvk'),
                validationFns: [[validateInputLength, ERR_MSG_TOAST]],
              }}
            />
          </StakeUnstakeInputWithCoin>
          {inputData.errorMessage && (
            <InputErrorMessage className="errorMessage">{inputData.errorMessage}</InputErrorMessage>
          )}
        </StakeUnstakeInputColumn>

        <StakeUnstakeRate>
          <span>1 MVK =</span>
          &nbsp;
          <CommaNumber value={mvkExchangeRate} beginningText={'$'} />
        </StakeUnstakeRate>

        <StakeUnstakeButtonGrid>
          <NewButton
            kind={BUTTON_PRIMARY}
            onClick={handleStake}
            form={BUTTON_WIDE}
            disabled={isActionActive || Number(inputData.amount) > myMvkTokenBalance}
          >
            <Icon id="in" /> Stake
          </NewButton>

          <NewButton
            kind={BUTTON_SECONDARY}
            onClick={openExitFeePopup}
            form={BUTTON_WIDE}
            disabled={isActionActive || Number(inputData.amount) > mySMvkTokenBalance}
          >
            <Icon id="out" /> Unstake
          </NewButton>
        </StakeUnstakeButtonGrid>
      </StakeUnstakeActionCard>
    </StakeUnstakeStyled>
  )
}
