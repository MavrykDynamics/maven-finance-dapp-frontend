import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { MyRewardsStyled } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

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
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  return (
    <MyRewardsStyled>
      <H2Title>My MVK Earnings</H2Title>
      <div className="claim-rewards">
        <Button
          disabled={rewardsToClaim === 0 || isActionActive || !accountPkh}
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
