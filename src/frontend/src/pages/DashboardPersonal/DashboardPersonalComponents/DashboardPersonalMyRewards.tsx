// view
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { MyRewardsStyled } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// consts
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

type DashboardPersonalMyRewardsProps = {
  earnedRewards: number
  rewardsToClaim: number
  claimRewardsHandler: () => void
}

const DashboardPersonalMyRewards = ({
  earnedRewards,
  rewardsToClaim,
  claimRewardsHandler,
}: DashboardPersonalMyRewardsProps) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  return (
    <MyRewardsStyled>
      <H2Title>My MVK Earnings</H2Title>
      <div className="claim-rewards">
        <Button
          disabled={rewardsToClaim === 0 || isActionActive || !userAddress}
          onClick={claimRewardsHandler}
          kind={BUTTON_PRIMARY}
        >
          Claim Rewards
        </Button>
      </div>
      <div className="stat-block">
        <div className="name">Earned to Date</div>
        <div className="value">
          <CommaNumber value={earnedRewards} endingText="sMVK" />
        </div>
      </div>
      <div className="stat-block">
        <div className="name">Claimable Rewards</div>
        <div className="value">
          <CommaNumber value={rewardsToClaim} endingText="sMVK" />
        </div>
      </div>
    </MyRewardsStyled>
  )
}

export default DashboardPersonalMyRewards
