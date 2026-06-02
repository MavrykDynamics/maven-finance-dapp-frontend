import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'

// consts
import { BUTTON_SECONDARY } from '../../app/App.components/Button/Button.constants'
import {
  calculateSlicePositions,
  COUNCIL_ALL_PAST_ACTIONS_LIST_NAME,
  COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME,
  COUNCIL_MY_PAST_ACTIONS_LIST_NAME,
  COUNCIL_MY_PENDING_ACTIONS_LIST_NAME,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'
import {
  ALL_PAST_COUNCIL_TAB,
  ALL_PENDING_COUNCIL_TAB,
  BgCouncilDdForms,
  BgCouncilPageTitles,
  COUNCIL_FORMS_NAMES_MAPPER,
  MavenCouncilDdForms,
  MavenCouncilPageTitles,
  MY_PAST_COUNCIL_TAB,
  MY_PENDING_COUNCIL_TAB,
} from './helpers/council.consts'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'
import {
  DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION,
  DROP_MAVEN_COUNCIL_REQUEST_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'

// types
import { CouncilActionType, CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'
import { CouncilTabsType } from 'providers/CouncilProvider/helpers/council.types'
import {
  SlidingTabButtons,
  SlidingTabButtonType,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'

// utils
import { dropBreakGlassCouncilAction } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { dropMavenCouncilAction } from 'providers/CouncilProvider/actions/mavenCouncil.actions'

// view
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import { CouncilForms } from './CouncilForms/CouncilForms.controller'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'
import { AvailableActions, CouncilPageWrapper, CouncilStyled } from './Council.style'
import { UpdateUserCouncilProfileInfoPopup } from './components/popups/UpdateUserCouncilProfileInfoPopup'
import { CouncilSidebar } from './components/CouncilSidebar'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { H2SimpleTitle, H2Title } from 'styles/generalStyledComponents/Titles.style'
import { CouncilAction } from './components/CouncilAction/CouncilAction'
import { CouncilActionsToSign } from './components/CouncilActionsToSign/CouncilActionsToSign'

type Props = {
  selectedTab: CouncilTabsType
  isBreakGlassCouncil?: boolean

  allPendingActions: number[]
  actionsToSign: number[]
  myPendingActions: number[]
  allPastActions: number[]
  myPastActions: number[]
  actionsMapper: Record<number, CouncilActionType>
  members: CouncilMembersType
}

type ActionsDDItemType = {
  content: JSX.Element
  value: string
  id: number
  disabled?: boolean
}

export const CouncilView = memo(({
  selectedTab,
  isBreakGlassCouncil = false,

  allPendingActions,
  actionsToSign,
  myPendingActions,
  allPastActions,
  myPastActions,
  actionsMapper,
  members,
}: Props) => {
  const navigate = useNavigate()
  const { search } = useLocation()

  const {
    maxLengths: { council: councilMaxLengths },
    contractAddresses: { councilAddress, breakGlassAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const {
    userAddress,
    isBreakGlassCouncil: isUserBreakGlassCouncilMember,
    isMavenCouncil: isUserMavenCouncilMember,
    isLoading: isUserLoading,
  } = useUserContext()

  const isUserCouncil = isBreakGlassCouncil ? isUserBreakGlassCouncilMember : isUserMavenCouncilMember

  const { pagePathname, dropDownItems, titles } = useMemo(() => {
    return {
      titles: isBreakGlassCouncil ? BgCouncilPageTitles : MavenCouncilPageTitles,
      pagePathname: isBreakGlassCouncil ? '/break-glass-council' : '/maven-council',
      dropDownItems: Object.values(isBreakGlassCouncil ? BgCouncilDdForms : MavenCouncilDdForms).map<ActionsDDItemType>(
        (formId, index) => ({
          content: <DropdownTruncateOption text={COUNCIL_FORMS_NAMES_MAPPER[formId]} />,
          value: formId,
          id: index,
        }),
      ),
    }
  }, [isBreakGlassCouncil])

  const {
    currentListName,
    councilTabsList,
    isMyPendingTab,
    isMyPastTab,
    isAllPendingTab,
    isAllPastTab,
    listItemsAmount,
    paginatedList,
  } = useMemo(() => {
    const isMyPendingTab = selectedTab === MY_PENDING_COUNCIL_TAB
    const isMyPastTab = selectedTab === MY_PAST_COUNCIL_TAB
    const isAllPendingTab = selectedTab === ALL_PENDING_COUNCIL_TAB
    const isAllPastTab = selectedTab === ALL_PAST_COUNCIL_TAB

    const councilTabsList: SlidingTabButtonType[] = [
      {
        text: 'My Ongoing Actions',
        id: 1,
        active: isMyPendingTab,
      },
      {
        text: 'My Past Actions',
        id: 2,
        active: isMyPastTab,
      },
    ]

    const currentListName = isMyPendingTab
      ? COUNCIL_MY_PENDING_ACTIONS_LIST_NAME
      : isMyPastTab
      ? COUNCIL_MY_PAST_ACTIONS_LIST_NAME
      : isAllPendingTab
      ? COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME
      : COUNCIL_ALL_PAST_ACTIONS_LIST_NAME

    const currentPage = getPageNumber(search, currentListName)

    const listToPaginate = isMyPendingTab
      ? myPendingActions
      : isMyPastTab
      ? myPastActions
      : isAllPendingTab
      ? allPendingActions
      : allPastActions

    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_MY_PAST_ACTIONS_LIST_NAME)
    const paginatedList = listToPaginate.slice(from, to)

    return {
      currentListName,
      councilTabsList,
      isMyPendingTab,
      isMyPastTab,
      isAllPendingTab,
      isAllPastTab,
      paginatedList,
      listItemsAmount: listToPaginate.length,
    }
  }, [selectedTab, search, myPendingActions, myPastActions, allPendingActions, allPastActions])

  const isMyActionsTabs = isMyPastTab || isMyPendingTab

  // redirect to review past actions page when member changes or when current user is not council and user is on my request page
  useEffect(() => {
    if (isMyActionsTabs && !isUserLoading && (!userAddress || !isUserCouncil))
      navigate(`${pagePathname}/${ALL_PAST_COUNCIL_TAB}`, { replace: true })
  }, [userAddress, isUserCouncil, isUserLoading, isMyActionsTabs, pagePathname, navigate])

  // update member popup
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const openPopup = useCallback(() => setIsUpdateCouncilMemberInfo(true), [])
  const closePopup = useCallback(() => setIsUpdateCouncilMemberInfo(false), [])

  const displayPendingSignature = Boolean(isMyActionsTabs && isUserCouncil && actionsToSign.length)

  const [chosenDdItem, setChosenDdItem] = useState<ActionsDDItemType | undefined>()

  const handleClickDropdownItem = useCallback(
    (itemId: DDItemId) => {
      const foundItem = dropDownItems.find((item) => item.id === itemId)
      if (foundItem) setChosenDdItem(foundItem)
    },
    [dropDownItems],
  )

  const handleChangeTabs = useCallback(
    (tabId?: number) => {
      navigate(
        `${pagePathname}${tabId === 1 ? MY_PENDING_COUNCIL_TAB : `/${MY_PAST_COUNCIL_TAB}`}${
          search ? `?${search}` : ''
        }`,
        { replace: true },
      )
    },
    [pagePathname, search, navigate],
  )

  // drop action
  const dropActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: isBreakGlassCouncil ? DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION : DROP_MAVEN_COUNCIL_REQUEST_ACTION,
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
          return await dropBreakGlassCouncilAction(actionId, breakGlassAddress)
        } else {
          return await dropMavenCouncilAction(actionId, councilAddress)
        }
      },
    }),
    [councilAddress, breakGlassAddress, isBreakGlassCouncil, userAddress],
  )

  const { actionWithArgs: handleDropAction } = useContractAction(dropActionProps)

  return (
    <CouncilPageWrapper>
      {displayPendingSignature ? <H2Title className="pending-signature-title">Pending Signature</H2Title> : null}

      <CouncilStyled>
        <div className="left-block">
          {(isAllPastTab || isAllPendingTab) && isUserCouncil && (
            <CustomLink to={pagePathname}>
              <NewButton kind={BUTTON_SECONDARY}>
                <Icon id="full-arrow-left" />
                Go Back
              </NewButton>
            </CustomLink>
          )}

          {displayPendingSignature ? (
            <>
              <CouncilActionsToSign
                isBreakGlassCouncil={isBreakGlassCouncil}
                actionstoSign={actionsToSign}
                actionsMapper={actionsMapper}
              />
            </>
          ) : null}

          {isMyActionsTabs ? (
            <>
              <AvailableActions>
                <div className="top-bar">
                  <H2SimpleTitle>Available Actions</H2SimpleTitle>

                  <div className="dropdown">
                    <DropDown
                      placeholder="Choose action"
                      activeItem={chosenDdItem}
                      items={dropDownItems}
                      clickItem={handleClickDropdownItem}
                    />
                  </div>
                </div>

                <CouncilForms
                  selectedAction={chosenDdItem?.value}
                  councilMaxLengths={councilMaxLengths}
                  members={members}
                />
              </AvailableActions>

              <SlidingTabButtons
                kind={SECONDARY_SLIDING_TAB_BUTTONS}
                tabItems={councilTabsList}
                onClick={handleChangeTabs}
              />
            </>
          ) : (
            <H2Title>{isAllPastTab ? titles.allPastActions : isAllPendingTab ? titles.allPending : null}</H2Title>
          )}

          <div className="actions-list">
            {paginatedList.length ? (
              paginatedList.map((item) => {
                const councilAction = actionsMapper[item]

                if (!councilAction) return null

                return (
                  <CouncilAction
                    key={councilAction.id}
                    isBreakGlassCouncil={isBreakGlassCouncil}
                    handleDropAction={handleDropAction}
                    councilAction={councilAction}
                    isMyActionsTabs={isMyActionsTabs}
                  />
                )
              })
            ) : (
              <EmptyContainer>
                <img src="/images/not-found.svg" alt=" No council actions to show" />
                <figcaption> No council actions to show</figcaption>
              </EmptyContainer>
            )}
          </div>

          {listItemsAmount ? <Pagination itemsCount={listItemsAmount} listName={currentListName} /> : null}
        </div>

        <CouncilSidebar
          membersTitle={titles.membersName}
          councilMembers={members}
          openUpdateMemberProfilePopup={openPopup}
          selectedTab={selectedTab}
          pagePathname={pagePathname}
        />
      </CouncilStyled>

      <UpdateUserCouncilProfileInfoPopup
        show={isUpdateCouncilMemberInfo}
        closePopup={closePopup}
        isBreakGlassCouncil={isBreakGlassCouncil}
        memberProfile={members.find((item) => item.memberAddress === userAddress)}
      />
    </CouncilPageWrapper>
  )
})
CouncilView.displayName = 'CouncilView'
