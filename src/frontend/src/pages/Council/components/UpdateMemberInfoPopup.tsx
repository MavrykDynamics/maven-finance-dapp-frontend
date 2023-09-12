import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { FormUpdateCouncilMemberView } from 'pages/Council/BreakGlassCouncilForms/FormUpdateCouncilMember.view'
import { CouncilFormUpdateCouncilMemberInfo } from '../CouncilForms/CouncilFormUpdateCouncilMemberInfo.view'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type PropsType = {
  isBreakGlassCounsil: boolean
  closePopup: () => void
  show: boolean
}

export const UpdateMemberInfoPopup = ({ closePopup, show, isBreakGlassCounsil }: PropsType) => {
  const {
    maxLengths: { council },
  } = useDappConfigContext()

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council">
        {isBreakGlassCounsil ? (
          <FormUpdateCouncilMemberView maxLength={council} callback={closePopup} />
        ) : (
          <CouncilFormUpdateCouncilMemberInfo maxLength={council} callback={closePopup} />
        )}
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
