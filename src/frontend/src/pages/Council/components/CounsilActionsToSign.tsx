import { useMemo } from 'react'

// view
import Carousel from 'app/App.components/Carousel/Carousel.view'
import { CouncilPending } from './CouncilPending/CouncilPending.controller'

// types
import { CouncilActionType, CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// utils
import { signBreakGlassAction } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { signMavrykAction } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'

// consts
import {
  SIGN_MAVRYK_COUNCIL_ACTION,
  SIGN_BREAK_GLASS_COUNCIL_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'

type PropsType = {
  isBreakGlassAction: boolean
  counsilAddress?: string
  actionstoSign: number[]
  actionsMapper: Record<number, CouncilActionType>
  members: CouncilMembersType
}

export const CounsilActionsToSign = ({
  isBreakGlassAction,
  counsilAddress,
  actionstoSign,
  members,
  actionsMapper,
}: PropsType) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  // Sign request action
  const signActionContractActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: isBreakGlassAction ? SIGN_BREAK_GLASS_COUNCIL_ACTION : SIGN_MAVRYK_COUNCIL_ACTION,
      actionFn: async (actionId: number) => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!counsilAddress) {
          bug('Wrong counsil address')
          return null
        }

        if (isBreakGlassAction) {
          return await signBreakGlassAction(actionId, counsilAddress)
        } else {
          return await signMavrykAction(actionId, counsilAddress)
        }
      },
    }),
    [counsilAddress, isBreakGlassAction, userAddress],
  )

  const { actionWithArgs: handleSignAction } = useContractAction(signActionContractActionProps)

  return (
    <article className="pending">
      <div className="pending-items">
        <Carousel itemLength={actionstoSign.length}>
          {actionstoSign.map((item, index) => {
            const action = actionsMapper[item]

            return (
              <CouncilPending
                {...action}
                key={action.id}
                numCouncilMembers={members.length}
                councilPendingActionsLength={actionstoSign.length}
                index={index}
                handleSignAction={handleSignAction}
              />
            )
          })}
        </Carousel>
      </div>
    </article>
  )
}
