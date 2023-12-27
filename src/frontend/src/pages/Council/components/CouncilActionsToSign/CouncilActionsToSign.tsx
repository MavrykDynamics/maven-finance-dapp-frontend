import { useMemo, useState } from 'react'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// utils
import { signBreakGlassAction } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { signMavenAction } from 'providers/CouncilProvider/actions/mavenCouncil.actions'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'

// consts
import {
  SIGN_BREAK_GLASS_COUNCIL_ACTION,
  SIGN_MAVEN_COUNCIL_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'

// view
import Carousel from 'app/App.components/Carousel/Carousel.view'
import { CouncilActionsToSignStyled } from './CouncilActionsToSign.styles'
import { CouncilActionToSign } from './CouncilActionToSign'
import { ActionReadMorePopup, ActionReadMorePopupDataType } from '../popups/CouncilActionReadMorePopupPopup'

type Props = {
  isBreakGlassCouncil: boolean
  actionstoSign: number[]
  actionsMapper: Record<number, CouncilActionType>
}

export const CouncilActionsToSign = ({ isBreakGlassCouncil, actionstoSign, actionsMapper }: Props) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { councilAddress, breakGlassAddress },
  } = useDappConfigContext()

  const [popupContentData, setPopupContentData] = useState<null | ActionReadMorePopupDataType>(null)
  const closePopup = () => setPopupContentData(null)
  const openReadMorePopup = (popupContentData: ActionReadMorePopupDataType) => setPopupContentData(popupContentData)

  // Sign request action
  const signActionContractActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: isBreakGlassCouncil ? SIGN_BREAK_GLASS_COUNCIL_ACTION : SIGN_MAVEN_COUNCIL_ACTION,
      actionFn: async (actionId: number) => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress || !breakGlassAddress) {
          bug('Wrong council address')
          return null
        }

        if (isBreakGlassCouncil) {
          return await signBreakGlassAction(actionId, breakGlassAddress)
        } else {
          return await signMavenAction(actionId, councilAddress)
        }
      },
    }),
    [councilAddress, breakGlassAddress, isBreakGlassCouncil, userAddress],
  )

  const { actionWithArgs: handleSignAction } = useContractAction(signActionContractActionProps)

  const actionsToSignAmount = actionstoSign.length

  return (
    <CouncilActionsToSignStyled>
      <Carousel itemLength={actionsToSignAmount}>
        {actionstoSign.map((item, index) => {
          const action = actionsMapper[item]
          if (!action) return null

          return (
            <CouncilActionToSign
              action={action}
              key={action.id}
              actionsToSignAmount={actionsToSignAmount}
              actionIndex={index}
              signActionHandler={handleSignAction}
              openReadMorePopup={openReadMorePopup}
            />
          )
        })}
      </Carousel>
      <ActionReadMorePopup closePopup={closePopup} popupContentData={popupContentData} />
    </CouncilActionsToSignStyled>
  )
}
