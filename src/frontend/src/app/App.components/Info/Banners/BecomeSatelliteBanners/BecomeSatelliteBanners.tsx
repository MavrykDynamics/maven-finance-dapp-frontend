import { Link } from 'react-router-dom'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { Info } from '../../Info.view'
import { INFO_ERROR } from '../../info.constants'

// styles & components
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { NotStakingBannerStyled } from './BecomeSatelliteBanners.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

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
            text={
              <>
                You are currently don’t have enought MVK to start staking, please buy &nbsp;
                <CommaNumber value={mvkAmountToHitRequired} endingText="MVK" className="value" />
              </>
            }
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
            text={
              <>
                To become a satellite you need to stake &nbsp;
                <CommaNumber value={requiredSmvkAmount} endingText="MVK" className="value" /> , left to stake: &nbsp;
                <CommaNumber value={smvkAmountToHitRequired} endingText="MVK" className="value" />
              </>
            }
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
