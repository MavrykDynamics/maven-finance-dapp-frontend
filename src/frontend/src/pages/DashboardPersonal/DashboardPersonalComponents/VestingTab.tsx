import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import dayjs from 'dayjs'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { VestingTabStyled } from './DashboardPersonalComponents.style'

import { State } from 'reducers'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { PORTFOLIO_TAB_ID } from '../DashboardPersonal.utils'
import { UserActionHistory } from './UserOperationsHistory'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { claimVestingReward } from 'providers/UserProvider/actions/user.actions'
import { sleep } from 'utils/api/sleep'
import { CLAIM_VESTING_REWARD_ACTION } from 'providers/UserProvider/helpers/user.consts'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { TezosWalletErrorPayload } from 'errors/error.type'
import { unknownToError } from 'errors/error'

const VestingTab = () => {
  const { vesteesMapper } = useSelector((state: State) => state.vesting)
  const { accountPkh = '' } = useSelector((state: State) => state.wallet)

  const { bug, info, loading } = useToasterContext()
  const {
    setAction,
    toggleActionCompletion,
    toggleActionFullScreenLoader,
    contractAddresses: { vestingAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const vesteeRecord = vesteesMapper[accountPkh]

  if (!vesteeRecord) return <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`} />

  // TODO: test claim vestee reward action
  const handleClaimVestingReward = async () => {
    if (!accountPkh) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }
    if (!vestingAddress) {
      bug('Wrong vesting address')
      return
    }

    try {
      const actionResult = await claimVestingReward(vestingAddress)

      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult
        toggleActionFullScreenLoader(true)
        toggleActionCompletion(true)

        info(
          TOASTER_ACTIONS_TEXTS[CLAIM_VESTING_REWARD_ACTION]['start']['message'],
          TOASTER_ACTIONS_TEXTS[CLAIM_VESTING_REWARD_ACTION]['start']['title'],
        )

        await sleep(5000)

        // show toaster loader after 5000ms after operation started
        const toasterId = loading(
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        )

        toggleActionFullScreenLoader(false)

        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level

        setAction({ actionName: CLAIM_VESTING_REWARD_ACTION, toasterId, operationLvl })
      } else if (isContractErrorPayload(actionResult.error)) {
        const { message, description } = actionResult.error as TezosWalletErrorPayload
        bug(description, message)
      } else {
        throw new Error(actionResult.error?.message)
      }
    } catch (e) {
      setAction(null)
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }

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
