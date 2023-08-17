import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import dayjs from 'dayjs'

// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Button from 'app/App.components/Button/NewButton'

// styles
import { VestingTabStyled } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// types
import { State } from 'reducers'

// consts
import { CLAIM_VESTING_REWARD_ACTION } from 'providers/UserProvider/helpers/user.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { UserActionHistory } from './UserOperationsHistory'

// utils
import { parseDate } from 'utils/time'
import { PORTFOLIO_TAB_ID } from '../DashboardPersonal.utils'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useVestingContext } from 'providers/VestingProvider/vesting.provider'

// actions
import { claimVestingReward } from 'providers/UserProvider/actions/user.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

const VestingTab = () => {
  const { vesteesMapper } = useVestingContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { vestingAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const vesteeRecord = vesteesMapper[userAddress ?? '']

  // vesting action
  const vestingAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!vestingAddress) {
      bug('Wrong vesting address')
      return null
    }

    return await claimVestingReward(vestingAddress)
  }, [userAddress, bug, vestingAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CLAIM_VESTING_REWARD_ACTION,
      actionFn: vestingAction,
    }),
    [vestingAction],
  )

  const { action: handleClaimVestingReward } = useContractAction(contractActionProps)

  if (!vesteeRecord) return <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`} />
  const { vestingMonth, totalAllocated, totalRemainded, rewardPerMonth, nextRewardDate, lastClaimDate } = vesteeRecord

  const lastClaimTime = dayjs(lastClaimDate),
    nextClaimTime = dayjs(nextRewardDate),
    hasRewardsFor = Math.max(0, nextClaimTime.diff(lastClaimTime, 'month')),
    isClaimBtnDisabled = rewardPerMonth === 0 || hasRewardsFor === 0 || isActionActive

  return (
    <>
      <VestingTabStyled>
        <H2Title>My Vesting</H2Title>

        <div className="vesting-data">
          <div className="column">
            <div className="name">Vesting Period</div>
            <div className="value">
              <CommaNumber value={vestingMonth} endingText="mos." />
            </div>
          </div>

          <div className="column">
            <div className="name">Total Vesting Amount</div>
            <div className="value">
              <CommaNumber value={totalAllocated} endingText="MVK" />
            </div>
          </div>

          <div className="column">
            <div className="name">Amount Left to Vest</div>
            <div className="value">
              <CommaNumber value={totalRemainded} endingText="MVK" />
            </div>
          </div>

          <div className="column">
            <div className="name">Ready to Claim</div>
            <div className="value">
              <CommaNumber value={rewardPerMonth * hasRewardsFor} endingText="MVK" />
            </div>
          </div>

          <div className="column">
            <div className="name">Next Claim</div>
            <div className="value">{parseDate({ time: nextRewardDate, timeFormat: 'MMM Do, YYYY' })}</div>
          </div>

          <Button
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            disabled={isClaimBtnDisabled}
            onClick={handleClaimVestingReward}
          >
            Claim
          </Button>
        </div>
      </VestingTabStyled>

      <UserActionHistory />
    </>
  )
}

export default VestingTab
