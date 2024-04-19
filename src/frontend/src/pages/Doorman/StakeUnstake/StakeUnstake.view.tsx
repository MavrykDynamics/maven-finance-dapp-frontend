import { Link, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo } from 'react'

// context
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { stakeMVN } from 'providers/DoormanProvider/actions/doorman.actions'
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
  mvnExchangeRate: number
  inputData: typeof DEFAULT_STAKE_UNSTAKE_INPUT
  setInputData: (data: typeof DEFAULT_STAKE_UNSTAKE_INPUT) => void
}

export const StakeUnstakeView = ({
  openExitFeePopup,
  mvnExchangeRate,
  inputData,
  setInputData,
}: StakeUnstakeViewProps) => {
  const navigate = useNavigate()
  const { userTokensBalances, userAddress, satelliteMvnIsDelegatedTo, isSatellite } = useUserContext()
  const { availableDoormanRewards, availableSatellitesRewards, availableFarmRewards } = useUserRewards()
  const {
    contractAddresses: { mvnTokenAddress, doormanAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { bug } = useToasterContext()

  const { satelliteMapper, setSatelliteAddressToSubscribe } = useSatellitesContext()

  useEffect(() => {
    if (satelliteMvnIsDelegatedTo) {
      setSatelliteAddressToSubscribe(satelliteMvnIsDelegatedTo)
    }
    return () => setSatelliteAddressToSubscribe(null)
  }, [satelliteMvnIsDelegatedTo])

  const delegatedUser = satelliteMvnIsDelegatedTo ? satelliteMapper[satelliteMvnIsDelegatedTo] : null
  const mySMvnTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }),
    myMvnTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvnTokenAddress })

  const mySMvnBalanceIsZero = mySMvnTokenBalance === 0
  const exchangeValue = mvnExchangeRate && inputData.amount ? Number(inputData.amount) * mvnExchangeRate : 0
  // TODO: @Sam-M-Israel check whether include farms & satellite rewards, cuz compound btn claims only doorman rewards here
  const rewardsToClaim =
    availableDoormanRewards +
    availableSatellitesRewards +
    Object.values(availableFarmRewards).reduce((acc, farmReward) => (acc += farmReward), 0)
  const showDelegateBtn = !isSatellite && !satelliteMvnIsDelegatedTo

  const onUseMaxBalance = (balance: 'smvn' | 'mvn') => () => {
    handleInputData(String(mathRoundTwoDigit(balance === 'mvn' ? myMvnTokenBalance : mySMvnTokenBalance)))
  }

  const onInputChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    handleInputData(value)
  }

  const handleInputData = (value: string) => {
    const validationStatus = stakingInputValidation({
      amount: Number(value),
      myMvnTokenBalance,
      mySMvnTokenBalance,
      userAddress,
    })

    setInputData({ ...inputData, amount: value, validation: validationStatus })
  }

  // Stake actions
  const handleStakeAll = async () => {
    if (!myMvnTokenBalance) return

    setInputData({
      ...inputData,
      amount: String(mathRoundTwoDigit(myMvnTokenBalance)),
      validation: INPUT_STATUS_SUCCESS,
    })

    await handleStake()
  }

  const handleUnstakeAll = () => {
    if (!mySMvnTokenBalance) return

    setInputData({
      ...inputData,
      amount: String(mathRoundTwoDigit(mySMvnTokenBalance)),
      validation: INPUT_STATUS_SUCCESS,
    })
    openExitFeePopup()
  }

  // stake action -------------------------

  const stakeAction = useCallback(
    async (stakeAmount: number) => {
      const canStakeAmount = stakeAmount <= Number(myMvnTokenBalance)

      if (!canStakeAmount) {
        setInputData({
          ...inputData,
          errorMessage: "You don't have enough MVN to stake",
        })

        return null
      }

      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!doormanAddress || !mvnTokenAddress) {
        bug('Wrong doorman or mvnToken address was provided')
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

      return await stakeMVN(stakeAmount, userAddress, doormanAddress, mvnTokenAddress)
    },
    [bug, doormanAddress, inputData, mvnTokenAddress, myMvnTokenBalance, setInputData, userAddress],
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
    navigate(
      satelliteMvnIsDelegatedTo ? `/satellites/satellite-details/${satelliteMvnIsDelegatedTo}` : '/satellite-nodes',
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
                <CommaNumber value={myMvnTokenBalance} className="amount" />
                {Boolean(myMvnTokenBalance) && (
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
                <CommaNumber value={mySMvnTokenBalance} className="amount" />
                {Boolean(mySMvnTokenBalance) && (
                  <NewButton onClick={handleUnstakeAll} kind={BUTTON_SIMPLE} disabled={isActionActive}>
                    Unstake All
                  </NewButton>
                )}
              </div>
            </div>
          </StakeUnstakeBalance>

          <StakeUnstakeRightPart>
            {mySMvnBalanceIsZero && myMvnTokenBalance > 0 && <StakeLabel>Not Staking</StakeLabel>}

            {!mySMvnBalanceIsZero && showDelegateBtn && (
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

            {!mySMvnBalanceIsZero && delegatedUser && (
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
                    The amount of pending sMVN you have earned but not yet claimed. Claim your rewards in the Personal
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
            {/*      ? `Compounds your pending exit fee rewards and converts them to sMVN. You currently, do not have any pending exit fee rewards amounting to at least 2 sMVN.`*/}
            {/*      : `Compounds your pending exit fee rewards and converts them to sMVN.`}*/}
            {/*  </Tooltip.Content>*/}
            {/*</Tooltip>*/}
          </StakeUnstakeRightPart>
        </StakeUnstakeCard>
      </StakeUnstakeCards>

      <StakeUnstakeActionCard>
        <StakeUnstakeInputColumn>
          <StakeUnstakeInputLabels>
            <div className="minAmount">Min 1 MVN</div>

            <StakeUnstakeAmount onClick={onUseMaxBalance('smvn')}>
              <span>Staked Amount:</span>
              &nbsp;
              <CommaNumber value={mySMvnTokenBalance} endingText={'MVN'} />
            </StakeUnstakeAmount>
          </StakeUnstakeInputLabels>

          <StakeUnstakeInputWithCoin>
            <Input
              className={`input-with-rate transparent-child-wrap`}
              children={'MVN'}
              inputProps={inputProps}
              settings={{
                inputStatus: inputData.validation,
                convertedValue: exchangeValue,
                balance: myMvnTokenBalance,
                balanceAsset: 'MVN',
                balanceName: 'Wallet Balance',
                inputSize: INPUT_LARGE,
                balanceHandler: onUseMaxBalance('mvn'),
                validationFns: [[validateInputLength, ERR_MSG_TOAST]],
              }}
            />
          </StakeUnstakeInputWithCoin>
          {inputData.errorMessage && (
            <InputErrorMessage className="errorMessage">{inputData.errorMessage}</InputErrorMessage>
          )}
        </StakeUnstakeInputColumn>

        <StakeUnstakeRate>
          <span>1 MVN =</span>
          &nbsp;
          <CommaNumber value={mvnExchangeRate} beginningText={'$'} />
        </StakeUnstakeRate>

        <StakeUnstakeButtonGrid>
          <NewButton
            kind={BUTTON_PRIMARY}
            onClick={handleStake}
            form={BUTTON_WIDE}
            disabled={isActionActive || Number(inputData.amount) > myMvnTokenBalance}
          >
            <Icon id="in" /> Stake
          </NewButton>

          <NewButton
            kind={BUTTON_SECONDARY}
            onClick={openExitFeePopup}
            form={BUTTON_WIDE}
            disabled={isActionActive || Number(inputData.amount) > mySMvnTokenBalance}
          >
            <Icon id="out" /> Unstake
          </NewButton>
        </StakeUnstakeButtonGrid>
      </StakeUnstakeActionCard>
    </StakeUnstakeStyled>
  )
}
