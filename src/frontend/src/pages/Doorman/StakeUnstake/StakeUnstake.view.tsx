import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { InputErrorMessage, InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'

// helpers, consts
import { State } from 'reducers'
import {
  BUTTON_PRIMARY,
  BUTTON_PULSE,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from '../../../app/App.components/Button/Button.constants'
import { mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { rewardsCompound } from '../Doorman.actions'
import { InputStatusType, INPUT_STATUS_SUCCESS, INPUT_LARGE } from 'app/App.components/Input/Input.constants'
import { stakingInputValidation } from '../Doorman.converter'

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
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import colors from 'styles/colors'

type StakeUnstakeViewProps = {
  stakeCallback: (amount: number) => void
  unstakeCallback: (amount: number) => void
  MVK_exchangeRate: number
}

export const StakeUnstakeView = ({ stakeCallback, unstakeCallback, MVK_exchangeRate }: StakeUnstakeViewProps) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    accountPkh,
    user: {
      myMvkTokenBalance,
      mySMvkTokenBalance,
      availableDoormanRewards: { myAvailableDoormanRewards },
      availableSatellitesRewards: { myAvailableSatelliteRewards },
      availableFarmRewards,
      satelliteMvkIsDelegatedTo,
      isSatellite,
    },
  } = useSelector((state: State) => state.wallet)

  const { satelliteMapper } = useSelector((state: State) => state.satellites)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const delegatedUser = satelliteMapper[satelliteMvkIsDelegatedTo]

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType; errorMessage: string }>({
    amount: '0',
    validation: '',
    errorMessage: '',
  })

  useEffect(() => {
    setInputData({
      amount: '0',
      validation: '',
      errorMessage: '',
    })
  }, [myMvkTokenBalance, mySMvkTokenBalance])

  const mySMvkBalanceIsZero = mySMvkTokenBalance === 0
  const exchangeValue = MVK_exchangeRate && inputData.amount ? Number(inputData.amount) * MVK_exchangeRate : 0
  const rewardsToClaim =
    myAvailableDoormanRewards +
    myAvailableSatelliteRewards +
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

  const handleStake = () => {
    const canStakeAmount = Number(inputData.amount) <= Number(myMvkTokenBalance)

    if (canStakeAmount) {
      setInputData({
        ...inputData,
        errorMessage: '',
      })
      stakeCallback(Number(inputData.amount))
    } else {
      setInputData({
        ...inputData,
        errorMessage: "You don't have enought MVK to stake",
      })
    }
  }

  const handleUnStake = () => {
    const canUnstakeAmount = Number(inputData.amount) <= Number(mySMvkTokenBalance)

    if (canUnstakeAmount) {
      setInputData({
        ...inputData,
        errorMessage: '',
      })
      unstakeCallback(Number(inputData.amount))
    } else {
      setInputData({
        ...inputData,
        errorMessage: "You don't have enought sMVK to unstake",
      })
    }
  }

  const handleStakeAll = () => {
    if (!myMvkTokenBalance) return

    setInputData({
      ...inputData,
      amount: String(mathRoundTwoDigit(myMvkTokenBalance)),
      validation: INPUT_STATUS_SUCCESS,
    })

    stakeCallback(myMvkTokenBalance)
  }

  const handleUnstakeAll = () => {
    if (!mySMvkTokenBalance) return

    setInputData({
      ...inputData,
      amount: String(mathRoundTwoDigit(mySMvkTokenBalance)),
      validation: INPUT_STATUS_SUCCESS,
    })

    unstakeCallback(mySMvkTokenBalance)
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

  const inputProps = {
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
          <CommaNumber value={MVK_exchangeRate} beginningText={'$'} />
        </StakeUnstakeRate>

        <StakeUnstakeButtonGrid>
          <NewButton kind={BUTTON_PRIMARY} onClick={handleStake} form={BUTTON_WIDE} disabled={isActionActive}>
            <Icon id="in" /> Stake
          </NewButton>

          <NewButton kind={BUTTON_SECONDARY} onClick={handleUnStake} form={BUTTON_WIDE} disabled={isActionActive}>
            <Icon id="out" /> Unstake
          </NewButton>
        </StakeUnstakeButtonGrid>
      </StakeUnstakeActionCard>
    </StakeUnstakeStyled>
  )
}
