import { useMemo } from 'react'

// consts
import { ALL_PAST_COUNCIL_TAB, ALL_PENDING_COUNCIL_TAB } from '../helpers/council.consts'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

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
  councilMembers: CouncilMembersType
  openUpdateMemberProfilePopup: () => void
  pagePathname: string
  selectedTab: CouncilTabsType
}

export const CouncilSidebar = ({
  pagePathname,
  openUpdateMemberProfilePopup,
  membersTitle,
  councilMembers,
  selectedTab,
}: Props) => {
  const { userAddress } = useUserContext()

  const { sortedCouncils, isUserCouncil } = useMemo(() => {
    const indexOfMember = councilMembers.findIndex((item) => item.memberAddress === userAddress)

    const sortedCouncils =
      indexOfMember === -1
        ? councilMembers
        : [councilMembers[indexOfMember]].concat(
            councilMembers.filter(({ memberAddress }) => memberAddress !== userAddress),
          )

    return {
      isUserCouncil: indexOfMember !== -1,
      sortedCouncils: sortedCouncils,
    }
  }, [councilMembers, userAddress])

  return (
    <div className="right-block">
      <CouncilSidebarNav>
        <CustomLink
          to={`${pagePathname}/:tabId`}
          params={{ tabId: ALL_PAST_COUNCIL_TAB }}
          disabled={selectedTab === ALL_PAST_COUNCIL_TAB}
        >
          <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY} disabled={selectedTab === ALL_PAST_COUNCIL_TAB}>
            Review Past Actions
          </NewButton>
        </CustomLink>

        <CustomLink
          to={`${pagePathname}/:tabId`}
          params={{ tabId: ALL_PENDING_COUNCIL_TAB }}
          disabled={selectedTab === ALL_PENDING_COUNCIL_TAB}
        >
          <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY} disabled={selectedTab === ALL_PENDING_COUNCIL_TAB}>
            Review Pending Actions
          </NewButton>
        </CustomLink>
      </CouncilSidebarNav>

      <H2Title>{membersTitle}</H2Title>

      {sortedCouncils.length ? (
        <div>
          {sortedCouncils.map((item) => (
            <CouncilMemberView
              key={item.id}
              image={item.image}
              name={item.name}
              isMemberSatellite={item.isMemberSatellite}
              memberAddress={item.memberAddress}
              openModal={openUpdateMemberProfilePopup}
              showUpdateInfo={isUserCouncil}
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
