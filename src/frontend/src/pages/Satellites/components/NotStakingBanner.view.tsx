import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { Link } from 'react-router-dom'

import { Info } from 'app/App.components/Info/Info.view'
import NewButton from 'app/App.components/Button/NewButton'
import { NotStakinkBannerStyled as NotStakingBannerStyled } from '../Satellites.style'
import Icon from 'app/App.components/Icon/Icon.view'

import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { INFO_WARNING } from 'app/App.components/Info/info.constants'

type Props = {
  text: string
  className?: string
}

export const NotStakingBanner = ({ text, className }: Props) => {
  const { accountPkh } = useSelector((state: State) => state.wallet)

  return (
    <NotStakingBannerStyled className={className}>
      {accountPkh ? (
        <Info text={text} type={INFO_WARNING}>
          <Link to="/">
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
