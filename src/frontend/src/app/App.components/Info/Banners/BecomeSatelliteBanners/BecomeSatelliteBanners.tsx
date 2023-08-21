import { Link } from 'react-router-dom'

// consts
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Info } from '../../Info.view'
import { INFO_ERROR } from '../../info.constants'

// styles & components
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { NotStakingBannerStyled } from './BecomeSatelliteBanners.style'

export const BecomeSatelliteBanners = ({
  mvkBalance,
  smvkBalance,
  requiredSmvkAmount,
  userAddress,
}: {
  mvkBalance: number
  smvkBalance: number
  requiredSmvkAmount: number
  userAddress: string | null
}) => {
  if (smvkBalance >= requiredSmvkAmount) return null

  const amountToHitRequired = requiredSmvkAmount - smvkBalance

  // if user can't stake all his mvk and get required amount of smvk show buy mvk banner
  if (amountToHitRequired < mvkBalance) {
    return (
      <NotStakingBannerStyled>
        {userAddress ? (
          <Info
            text={`To become a satellite you need to stake ${requiredSmvkAmount} MVK, please buy ${amountToHitRequired} more MVK and stake it`}
            type={INFO_ERROR}
          >
            <Link to="/staking">
              <NewButton kind={BUTTON_PRIMARY}>
                <Icon id="loans" />
                Buy MVK
              </NewButton>
            </Link>
          </Info>
        ) : null}
      </NotStakingBannerStyled>
    )
  } else {
    return (
      <NotStakingBannerStyled>
        {userAddress ? (
          <Info
            text={`To become a satellite you need to stake ${requiredSmvkAmount} MVK, please stake ${amountToHitRequired} more mvk`}
            type={INFO_ERROR}
          >
            <Link to="/staking">
              <NewButton kind={BUTTON_PRIMARY}>
                <Icon id="staking" />
                Staking
              </NewButton>
            </Link>
          </Info>
        ) : null}
      </NotStakingBannerStyled>
    )
  }
}
