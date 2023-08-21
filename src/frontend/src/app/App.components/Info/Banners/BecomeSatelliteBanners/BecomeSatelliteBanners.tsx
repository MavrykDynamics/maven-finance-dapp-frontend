import { Link } from 'react-router-dom'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
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
  isSatellite,
}: {
  mvkBalance: number
  smvkBalance: number
  requiredSmvkAmount: number
  userAddress: string | null
  isSatellite: boolean
}) => {
  if (smvkBalance >= requiredSmvkAmount || isSatellite) return null

  // amount of mvk tokens, that user need to stake to be able to become a satellite
  const smvkAmountToHitRequired = requiredSmvkAmount - smvkBalance

  // amount of mvk tokens, that user need to buy, to be able to stake required amount of smvk to be able to become a satellite
  const mvkAmountToHitRequired = requiredSmvkAmount - smvkBalance - mvkBalance

  // if user can't stake all his mvk and get required amount of smvk show buy mvk banner
  if (smvkAmountToHitRequired > mvkBalance) {
    return (
      <NotStakingBannerStyled>
        {userAddress ? (
          <Info
            text={`To become a satellite you need to stake ${requiredSmvkAmount} MVK, please buy ${mvkAmountToHitRequired} more MVK and stake it`}
            type={INFO_ERROR}
          >
            <div className="link-btn">
              <Link to="/staking">
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="loans" />
                  Buy MVK
                </NewButton>
              </Link>
            </div>
          </Info>
        ) : null}
      </NotStakingBannerStyled>
    )
  } else {
    return (
      <NotStakingBannerStyled>
        {userAddress ? (
          <Info
            text={`To become a satellite you need to stake ${requiredSmvkAmount} MVK, please stake ${smvkAmountToHitRequired} more MVK`}
            type={INFO_ERROR}
          >
            <div className="link-btn">
              <Link to="/staking">
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="staking" />
                  Staking
                </NewButton>
              </Link>
            </div>
          </Info>
        ) : null}
      </NotStakingBannerStyled>
    )
  }
}
