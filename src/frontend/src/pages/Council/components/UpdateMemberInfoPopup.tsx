// view
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { FormUpdateCouncilMemberView } from 'pages/Council/BreakGlassCouncilForms/FormUpdateCouncilMember.view'
import { CouncilFormUpdateCouncilMemberInfo } from '../CouncilForms/CouncilFormUpdateCouncilMemberInfo.view'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// types
import { CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'

type PropsType = {
  isBreakGlassCounsil: boolean
  closePopup: () => void
  memberProfile?: CouncilMembersType[number]
  show: boolean
}

export const UpdateMemberInfoPopup = ({ closePopup, show, isBreakGlassCounsil, memberProfile }: PropsType) => {
  const {
    maxLengths: { council: councilMaxLengths },
  } = useDappConfigContext()

  return (
    <PopupContainer onClick={closePopup} show={show}>
      {/* TODO: do it like farms popups */}
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council">
        {isBreakGlassCounsil ? (
          <FormUpdateCouncilMemberView
            councilMaxLengths={councilMaxLengths}
            callback={closePopup}
            memberProfile={memberProfile}
          />
        ) : (
          <CouncilFormUpdateCouncilMemberInfo
            councilMaxLengths={councilMaxLengths}
            callback={closePopup}
            memberProfile={memberProfile}
          />
        )}
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
