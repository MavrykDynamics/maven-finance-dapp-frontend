// view
import { Button } from 'app/App.components/Button/Button.controller'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useHistory } from 'react-router-dom'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../app/App.components/Button/Button.constants'
import { Input } from '../../../app/App.components/Input/Input.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
// helpers
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'

// style
import {
  StakeLabel,
  StakeUnstakeActionCard,
  StakeUnstakeBalance,
  StakeUnstakeButtonGrid,
  StakeUnstakeCard,
  StakeUnstakeInputColumn,
  StakeUnstakeInputGrid,
  StakeUnstakeInputLabels,
  StakeUnstakeMax,
  StakeUnstakeMin,
  StakeUnstakeRate,
  StakeUnstakeStyled,
  StakeUnstakeCards,
} from './StakeUnstake.style'
import { rewardsCompound } from '../Doorman.actions'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

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

  const [inputData, setInputData] = useState<{ amount: string; validation: InputStatusType; errorMessage: string }>({
    amount: '0',
    validation: '',
    errorMessage: '',
  })

  const exchangeValue = MVK_exchangeRate && inputData.amount ? Number(inputData.amount) * MVK_exchangeRate : 0
  const earnedValue = farmRewards + doormanRewards
  const userHasRewards = myAvailableDoormanRewards + myAvailableSatelliteRewards > 2
  const showDelegateBtn = accountPkh && !isSatellite && !satelliteMvkIsDelegatedTo

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

    if (validationStatus === INPUT_STATUS_ERROR && value !== '') return

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

  const handleDelegate = () => {
    if (mySMvkTokenBalance === 0) {
      dispatch(showToaster(ERROR, 'Failed to delegate', 'You need to stake MVK'))
      return
    }

    history.push('/satellite-nodes')
  }

  return (
    <StakeUnstakeStyled>
      <StakeUnstakeActionCard>
        <StakeUnstakeInputGrid>
          <img src="/images/coin-gold.svg" alt="coin" />
          <StakeUnstakeInputColumn>
            <StakeUnstakeInputLabels>
              <StakeUnstakeMin>Min 1 MVK</StakeUnstakeMin>
              {accountPkh && (
                <>
                  <StakeUnstakeMax onClick={() => onUseMaxClick('STAKE')}>Max Stake</StakeUnstakeMax>
                  <StakeUnstakeMax onClick={() => onUseMaxClick('UNSTAKE')}>Max Unstake</StakeUnstakeMax>
                </>
              )}
            </StakeUnstakeInputLabels>
            <Input
              type={'number'}
              placeholder={inputData.amount}
              onChange={onInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              value={inputData.amount}
              pinnedText={'MVK'}
              inputStatus={inputData.validation}
              errorMessage={inputData.errorMessage}
            />
            <StakeUnstakeRate>
              <CommaNumber value={Number(exchangeValue ? inputData.amount : 1)} endingText={'MVK'} />
              <span>&nbsp;= $</span>
              <CommaNumber value={Number(exchangeValue || MVK_exchangeRate)} endingText={''} />
            </StakeUnstakeRate>
          </StakeUnstakeInputColumn>
        </StakeUnstakeInputGrid>
        <StakeUnstakeButtonGrid className={`${userHasRewards ? 'compound' : ''}`}>
          <Button text="Stake" kind={ACTION_PRIMARY} icon="in" onClick={handleStake} />
          <Button text="Unstake" icon="out" kind={ACTION_SECONDARY} onClick={handleUnStake} />
          {userHasRewards ? (
            <Button text="Compound" className="fill" kind={ACTION_PRIMARY} icon="compound" onClick={handleCompound} />
          ) : null}
        </StakeUnstakeButtonGrid>
        {userHasRewards ? (
          <p className="compound-info">
            Compounds the satellite rewards along with the exit fee{' '}
            <a className="info-link" href="https://mavryk.finance/litepaper#abstract" target="_blank" rel="noreferrer">
              <Icon id="question" />
            </a>
          </p>
        ) : null}
      </StakeUnstakeActionCard>

      <StakeUnstakeCards>
        <div className="grid-group">
          <StakeUnstakeCard>
            <StakeUnstakeBalance>
              <img src="/images/coin-gold.svg" alt="coin" />
              <h3>My MVK Balance</h3>
              <CommaNumber value={myMvkTokenBalance} />
              {myMvkTokenBalance === 0 ? <StakeLabel>Not Staking</StakeLabel> : null}
            </StakeUnstakeBalance>
          </StakeUnstakeCard>
          <StakeUnstakeCard>
            <StakeUnstakeBalance>
              <img src="/images/coin-silver.svg" alt="coin" />
              <h3>Total MVK Staked</h3>
              <CommaNumber value={mySMvkTokenBalance} />
            </StakeUnstakeBalance>
          </StakeUnstakeCard>
          <StakeUnstakeCard>
            <StakeUnstakeBalance>
              <img src="/images/coin-bronze.svg" alt="coin" />
              <h3>Total MVK Earned</h3>
              <CommaNumber value={earnedValue} />
            </StakeUnstakeBalance>
          </StakeUnstakeCard>
        </div>

        {showDelegateBtn && (
          <div className="centering-wrapper">
            <NewButton className='pulse' onClick={handleDelegate}>
              <Icon id="satellites" />
              Delegate
            </NewButton>
          </div>
        )}
      </StakeUnstakeCards>
    </StakeUnstakeStyled>
  )
}
