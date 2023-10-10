// consts
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

// view
import { TzAddress } from '../../../../app/App.components/TzAddress/TzAddress.view'
import NewButton from 'app/App.components/Button/NewButton'
import { AvatarStyle } from '../../../../app/App.components/Avatar/Avatar.style'
import Icon from 'app/App.components/Icon/Icon.view'
import { CouncilMemberStyled } from './CouncilMember.style'
import CustomLink from 'app/App.components/CustomLink/CustomLink'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type Props = {
  image: string
  name: string
  memberAddress: string
  openModal: () => void
  showUpdateInfo?: boolean
}

export const CouncilMemberView = (props: Props) => {
  const { userAddress, isSatellite } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { image, name, memberAddress, openModal, showUpdateInfo = true } = props

  const isMe = memberAddress === userAddress

  const memberContent = (
    <CouncilMemberStyled>
      <div className="inner">
        <AvatarStyle>
          <img
            src={image}
            alt={name}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.style.opacity = '0'
            }}
          />
        </AvatarStyle>
        <figcaption>
          <h4>{name}</h4>
          {memberAddress ? <TzAddress type={PRIMARY_TZ_ADDRESS_COLOR} tzAddress={memberAddress} hasIcon /> : null}
        </figcaption>
      </div>
      {isMe && showUpdateInfo ? (
        <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={openModal} disabled={isActionActive}>
          <Icon id="update" />
          Update Info
        </NewButton>
      ) : null}
    </CouncilMemberStyled>
  )

  if (isMe) return memberContent

  return isSatellite ? (
    <CustomLink to={`/satellites/satellite-details/:satelliteId`} params={{ satelliteId: memberAddress }}>
      {memberContent}
    </CustomLink>
  ) : (
    <CustomLink to={`${process.env.REACT_APP_TZKT_LINK}/${memberAddress}/operations/`}>{memberContent}</CustomLink>
  )
}
