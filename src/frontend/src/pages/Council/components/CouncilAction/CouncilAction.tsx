import dayjs from 'dayjs'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'

// view
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import Icon from 'app/App.components/Icon/Icon.view'
import { CouncilOngoingAction } from './CouncilOngoingAction'
import { CouncilActionStyled } from './CouncilAction.style'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'

// utils
import { parseDate } from 'utils/time'

type Props = {
  councilAction: CouncilActionType
  isBreakGlassCounsil: boolean
  isMyActionsTabs: boolean
  handleDropAction: (actionId: number) => void
}

export const CouncilAction = ({ councilAction, handleDropAction, isBreakGlassCounsil, isMyActionsTabs }: Props) => {
  const { userAddress } = useUserContext()

  const {
    actionName,
    councilSize,
    startDatetime,
    signersCount,
    counsilAddress,
    executed,
    expirationTime,
    initiatorAddress,
  } = councilAction

  const isUserActiveAction =
    !executed && dayjs().isBefore(expirationTime) && userAddress === initiatorAddress && isMyActionsTabs

  // view for user's created active action
  if (isUserActiveAction) {
    return (
      <CouncilOngoingAction
        councilAction={councilAction}
        handleDropAction={handleDropAction}
        isBreakGlassCounsil={isBreakGlassCounsil}
      />
    )
  }

  // default view for action
  return (
    <CouncilActionStyled>
      <div className="header">
        <div className="column">
          <div className="name">Date</div>
          <div className="value">{parseDate({ time: startDatetime, timeFormat: 'MMM Do, YYYY' })}</div>
        </div>
        <div className="column">
          <div className="name">Purpose</div>
          <div className="value">{actionName}</div>
        </div>

        <div className="column">
          <div className="name">Multisig Approval</div>
          {/* if signed more than half of members show green */}
          <div className={`value ${signersCount > councilSize / 2 ? 'is-green' : 'is-red'}`}>
            {signersCount}/{councilSize}
          </div>
        </div>
        <div className="open-action">
          <CustomLink to={`${process.env.REACT_APP_TZKT_LINK}/${counsilAddress}/operations/`}>
            <Icon id="send" />
          </CustomLink>
        </div>
      </div>
    </CouncilActionStyled>
  )
}
