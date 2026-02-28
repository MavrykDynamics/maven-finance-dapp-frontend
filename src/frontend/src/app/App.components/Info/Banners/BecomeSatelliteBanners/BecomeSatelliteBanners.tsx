import { Link } from 'react-router'

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
  mvnBalance,
  smvnBalance,
  requiredSmvnAmount,
  userAddress,
  isSatellite,
}: {
  mvnBalance: number
  smvnBalance: number
  requiredSmvnAmount: number
  userAddress: string | null
  isSatellite: boolean
}) => {
  if (smvnBalance >= requiredSmvnAmount || isSatellite) return null

  // amount of mvn tokens, that user need to stake to be able to become a satellite
  const smvnAmountToHitRequired = requiredSmvnAmount - smvnBalance

  // amount of mvn tokens, that user need to buy, to be able to stake required amount of smvn to be able to become a satellite
  const mvnAmountToHitRequired = requiredSmvnAmount - smvnBalance - mvnBalance

  // if user can't stake all his mvn and get required amount of smvn show buy mvn banner
  if (smvnAmountToHitRequired > mvnBalance) {
    return (
      <NotStakingBannerStyled>
        {userAddress ? (
          <Info
            text={
              <>
                You are currently don’t have enough MVN to start staking, please buy &nbsp;
                <CommaNumber value={mvnAmountToHitRequired} endingText="MVN" className="value" />
              </>
            }
            type={INFO_ERROR}
          >
            <div className="link-btn">
              <Link to="/staking">
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="loans" />
                  Buy MVN
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
                <CommaNumber value={requiredSmvnAmount} endingText="MVN" className="value" /> , left to stake: &nbsp;
                <CommaNumber value={smvnAmountToHitRequired} endingText="MVN" className="value" />
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
