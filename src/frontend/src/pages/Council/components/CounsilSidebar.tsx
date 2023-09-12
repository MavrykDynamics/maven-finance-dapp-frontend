import { useMemo } from 'react'
import { Link } from 'react-router-dom'

// consts
import { ALL_PAST_COUNSIL_TAB, ALL_PENDING_COUNSIL_TAB } from '../helpers/commonCouncil.utils'
import { BUTTON_WIDE, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'

// types
import { CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { ReviewCard } from '../Council.style'
import { CouncilMemberView } from './CouncilMember/CouncilMember.view'

type Props = {
  membersTitle: string
  counsilMembers: CouncilMembersType
  openUpdateMemberProfilePopup: () => void
  showNavButtons: boolean
  pagePathname: string
}

export const CounsilSidebar = ({
  pagePathname,
  openUpdateMemberProfilePopup,
  membersTitle,
  counsilMembers,
  showNavButtons,
}: Props) => {
  const { userAddress } = useUserContext()

  const { sortedCounsils, isUserCounsil } = useMemo(() => {
    const indexOfMember = counsilMembers.findIndex((item) => item.userId === userAddress)

    const sortedCounsils =
      indexOfMember === -1
        ? counsilMembers
        : [counsilMembers[indexOfMember]].concat(counsilMembers.filter(({ userId }) => userId !== userAddress))

    return {
      isUserCounsil: indexOfMember !== -1,
      sortedCounsils,
    }
  }, [counsilMembers])

  return (
    <div className="right-block">
      {showNavButtons && (
        <ReviewCard>
          <Link to={`${pagePathname}/${ALL_PAST_COUNSIL_TAB}`}>
            <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
              Review Past Actions
            </NewButton>
          </Link>

          <Link to={`${pagePathname}/${ALL_PENDING_COUNSIL_TAB}`}>
            <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
              Review Pending Actions
            </NewButton>
          </Link>
        </ReviewCard>
      )}

      {sortedCounsils.length ? (
        <>
          <h1>{membersTitle}</h1>

          <div>
            {sortedCounsils.map((item) => (
              <CouncilMemberView
                key={item.id}
                image={item.image}
                name={item.name}
                userId={item.userId}
                openModal={openUpdateMemberProfilePopup}
                showUpdateInfo={isUserCounsil}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
