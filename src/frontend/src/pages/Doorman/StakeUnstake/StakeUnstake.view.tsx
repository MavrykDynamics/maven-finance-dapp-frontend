import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

// helpers, consts
import { State } from 'reducers'
import {
  BUTTON_PRIMARY,
  BUTTON_PULSE,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from '../../../app/App.components/Button/Button.constants'
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { rewardsCompound } from '../Doorman.actions'
import {
  InputStatusType,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  INPUT_LARGE,
} from 'app/App.components/Input/Input.constants'

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
      userRewardsToDate: { farmRewards, doormanRewards },
      myDoormanRewardsData: { myAvailableDoormanRewards },
      mySatelliteRewardsData: { myAvailableSatelliteRewards },
      satelliteMvkIsDelegatedTo,
      isSatellite,
    },
  } = useSelector((state: State) => state.wallet)

  const { satelliteMapper } = useSelector((state: State) => state.satellites)

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
  const earnedValue = farmRewards + doormanRewards
  const userHasRewards = myAvailableDoormanRewards + myAvailableSatelliteRewards > 2
  const showDelegateBtn = !isSatellite && !satelliteMvkIsDelegatedTo

  const onUseMaxClick = (actionType: string) => {
    switch (actionType) {
      case 'STAKE':
        setInputData({
          ...inputData,
          amount: String(mathRoundTwoDigit(myMvkTokenBalance)),
          validation: INPUT_STATUS_SUCCESS,
        })
        break
      case 'UNSTAKE':
      default:
        setInputData({
          ...inputData,
          amount: String(mathRoundTwoDigit(mySMvkTokenBalance)),
          validation: INPUT_STATUS_SUCCESS,
        })
        break
    }
  }

  const onInputChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    const validationStatus = isValidNumberValue(
      Number(value),
      1,
      accountPkh ? Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)) : undefined,
    )
      ? INPUT_STATUS_SUCCESS
      : INPUT_STATUS_ERROR

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

  const handleCompound = () => {
    if (accountPkh) {
      dispatch(rewardsCompound(accountPkh))
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

  const inputSettings = {
    inputStatus: inputData.validation,
    convertedValue: exchangeValue,
  }

  const handleDelegate = () => {
    history.push(
      satelliteMvkIsDelegatedTo ? `/satellites/satellite-details/${satelliteMvkIsDelegatedTo}` : '/satellite-nodes',
    )
  }

  const inputPinnedChild = <div>MVK</div>

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
                  <NewButton onClick={handleStakeAll} kind={BUTTON_SIMPLE}>
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
                  <NewButton onClick={handleUnstakeAll} kind={BUTTON_SIMPLE}>
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
                disabled={!accountPkh}
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
              <h3>Total MVK Earned</h3>
              <CommaNumber value={earnedValue} className="amount" />
            </div>
          </StakeUnstakeBalance>

          <StakeUnstakeRightPart>
            <NewButton kind={BUTTON_PRIMARY} isThin onClick={handleCompound} disabled={!userHasRewards}>
              <Icon id="compound" /> Compound
            </NewButton>
          </StakeUnstakeRightPart>
        </StakeUnstakeCard>
      </StakeUnstakeCards>

      <StakeUnstakeActionCard>
        <StakeUnstakeInputColumn>
          <StakeUnstakeInputLabels>
            <div className="minAmount">Min 1 MVK</div>

            <StakeUnstakeAmount>
              <span>Staked Amount:</span>
              &nbsp;
              <CommaNumber value={mySMvkTokenBalance} endingText={'MVK'} />
            </StakeUnstakeAmount>
          </StakeUnstakeInputLabels>

          <StakeUnstakeInputWithCoin>
            <ImageWithPlug imageLink={'/images/coin-gold.svg'} alt="coin" />
            <Input
              className={`${INPUT_LARGE} input-with-rate transparent-child-wrap text-child`}
              children={inputPinnedChild}
              inputProps={inputProps}
              settings={inputSettings}
            />
            {/* // TODO: add style for inputData.errorMessage */}
          </StakeUnstakeInputWithCoin>

          <StakeUnstakeInputLabels>
            <StakeUnstakeRate>
              <CommaNumber value={Number(exchangeValue ? inputData.amount : 1)} endingText={'MVK'} />
              <span>&nbsp;= $</span>
              <CommaNumber value={Number(exchangeValue || MVK_exchangeRate)} />
            </StakeUnstakeRate>

            <StakeUnstakeAmount>
              <span>Wallet Balance:</span>
              &nbsp;
              <CommaNumber value={myMvkTokenBalance} endingText={'MVK'} />
            </StakeUnstakeAmount>
          </StakeUnstakeInputLabels>
        </StakeUnstakeInputColumn>
        <StakeUnstakeButtonGrid>
          <NewButton kind={BUTTON_PRIMARY} onClick={handleStake} form={BUTTON_WIDE}>
            <Icon id="in" /> Stake
          </NewButton>

          <NewButton kind={BUTTON_SECONDARY} onClick={handleUnStake} form={BUTTON_WIDE}>
            <Icon id="out" /> Unstake
          </NewButton>
        </StakeUnstakeButtonGrid>
      </StakeUnstakeActionCard>
    </StakeUnstakeStyled>
  )
}
