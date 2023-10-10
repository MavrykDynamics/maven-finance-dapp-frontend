import { useMemo } from 'react'

// consts
import { ALL_PAST_COUNSIL_TAB, ALL_PENDING_COUNSIL_TAB } from '../helpers/council.consts'
import { BUTTON_WIDE, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'

// types
import { CouncilTabsType } from 'providers/CouncilProvider/helpers/council.types'
import { CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilSidebarNav } from '../Council.style'
import { CouncilMemberView } from './CouncilMember/CouncilMember.view'
import { EmptyContainer } from 'app/App.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import CustomLink from 'app/App.components/CustomLink/CustomLink'

type Props = {
  membersTitle: string
  counsilMembers: CouncilMembersType
  openUpdateMemberProfilePopup: () => void
  pagePathname: string
  selectedTab: CouncilTabsType
}

export const CounsilSidebar = ({
  pagePathname,
  openUpdateMemberProfilePopup,
  membersTitle,
  counsilMembers,
  selectedTab,
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
  }, [counsilMembers, userAddress])

  return (
    <div className="right-block">
      <CouncilSidebarNav>
        <CustomLink
          to={`${pagePathname}/:tabId`}
          params={{ tabId: ALL_PAST_COUNSIL_TAB }}
          disabled={selectedTab === ALL_PAST_COUNSIL_TAB}
        >
          <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY} disabled={selectedTab === ALL_PAST_COUNSIL_TAB}>
            Review Past Actions
          </NewButton>
        </CustomLink>

        <CustomLink
          to={`${pagePathname}/:tabId`}
          params={{ tabId: ALL_PENDING_COUNSIL_TAB }}
          disabled={selectedTab === ALL_PENDING_COUNSIL_TAB}
        >
          <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY} disabled={selectedTab === ALL_PENDING_COUNSIL_TAB}>
            Review Pending Actions
          </NewButton>
        </CustomLink>
      </CouncilSidebarNav>

      <H2Title>{membersTitle}</H2Title>

      {sortedCounsils.length ? (
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
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No members to show" />
          <figcaption> No members to show</figcaption>
        </EmptyContainer>
      )}
    </div>
  )
}
