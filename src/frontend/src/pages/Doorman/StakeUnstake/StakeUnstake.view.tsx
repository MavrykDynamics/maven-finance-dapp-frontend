import { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// view
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from '../../../app/App.components/Input/Input.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers, consts
import { State } from 'reducers'
import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../../app/App.components/Button/Button.constants'
import { isValidNumberValue, mathRoundTwoDigit } from '../../../utils/validatorFunctions'
import { rewardsCompound } from '../Doorman.actions'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

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
  StakeUnstakeRightPart,
  StakeDelegatedUser,
} from './StakeUnstake.style'

// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

type StakeUnstakeViewProps = {
  stakeCallback: (amount: number) => void
  unstakeCallback: (amount: number) => void
  MVK_exchangeRate: number
  satellites: SatelliteRecord[]
}

export const StakeUnstakeView = ({
  stakeCallback,
  unstakeCallback,
  MVK_exchangeRate,
  satellites,
}: StakeUnstakeViewProps) => {
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

  const delegatedUser = useMemo(
    () => satellites.find((item) => item.address === satelliteMvkIsDelegatedTo),
    [satelliteMvkIsDelegatedTo, satellites],
  )

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
    stakeCallback(myMvkTokenBalance)
  }

  const handleUnstakeAll = () => {
    if (!mySMvkTokenBalance) return
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
            <img src="/images/coin-gold.svg" alt="coin" />
            <div>
              <h3>My MVK Balance</h3>
              <div className="balance-btn-group">
                <CommaNumber value={myMvkTokenBalance} />
                <button onClick={handleStakeAll}>Stake All</button>
              </div>
            </div>
          </StakeUnstakeBalance>
        </StakeUnstakeCard>

        <StakeUnstakeCard>
          <StakeUnstakeBalance>
            <img src="/images/coin-silver.svg" alt="coin" />
            <div>
              <h3>Total MVK Staked</h3>
              <div className="balance-btn-group">
                <CommaNumber value={mySMvkTokenBalance} />
                <button onClick={handleUnstakeAll}>Unstake All</button>
              </div>
            </div>
          </StakeUnstakeBalance>

          <StakeUnstakeRightPart>
            {mySMvkBalanceIsZero && accountPkh && <StakeLabel>Not Staking</StakeLabel>}

            {((!mySMvkBalanceIsZero && showDelegateBtn) || !accountPkh) && (
              <NewButton
                onClick={handleDelegate}
                kind={ACTION_PRIMARY}
                disabled={!accountPkh}
                className={!accountPkh ? '' : 'pulse'}
              >
                <Icon id="satellites" />
                Delegate
              </NewButton>
            )}

            {delegatedUser && (
              <StakeDelegatedUser>
                <img src={delegatedUser.image} alt="coin" />

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
            <img src="/images/coin-bronze.svg" alt="coin" />
            <div>
              <h3>Total MVK Earned</h3>
              <CommaNumber value={earnedValue} />
            </div>
          </StakeUnstakeBalance>

          <StakeUnstakeRightPart>
            <NewButton kind={ACTION_PRIMARY} onClick={handleCompound} disabled={!userHasRewards}>
              <Icon id="compound" /> Compound
            </NewButton>
          </StakeUnstakeRightPart>
        </StakeUnstakeCard>
      </StakeUnstakeCards>

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
          <NewButton kind={ACTION_PRIMARY} onClick={handleStake}>
            <Icon id="in" /> Stake
          </NewButton>

          <NewButton kind={ACTION_SECONDARY} onClick={handleUnStake}>
            <Icon id="out" /> Unstake
          </NewButton>

          {userHasRewards ? (
            <NewButton kind={ACTION_PRIMARY} onClick={handleCompound}>
              <Icon id="compound" /> Compound
            </NewButton>
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
    </StakeUnstakeStyled>
  )
}
