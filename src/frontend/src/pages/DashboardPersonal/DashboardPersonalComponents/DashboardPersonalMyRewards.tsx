import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { MyRewardsStyled } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

type DashboardPersonalMyRewardsProps = {
  earnedRewards: number
  rewardsToClaim: number
  isActionActive: boolean
  claimRewardsHandler: () => void
}

const DashboardPersonalMyRewards = ({
  earnedRewards,
  rewardsToClaim,
  isActionActive,
  claimRewardsHandler,
}: DashboardPersonalMyRewardsProps) => {
  return (
    <MyRewardsStyled>
      <H2Title>My MVK Earnings</H2Title>
      <div className="claim-rewards">
        <Button disabled={rewardsToClaim === 0 || isActionActive} onClick={claimRewardsHandler} kind={BUTTON_PRIMARY}>
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
