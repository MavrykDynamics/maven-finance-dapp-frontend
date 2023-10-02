import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'

// consts
import { BUTTON_SECONDARY } from '../../app/App.components/Button/Button.constants'
import {
  COUNCIL_ALL_PAST_ACTIONS_LIST_NAME,
  COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME,
  COUNCIL_MY_PENDING_ACTIONS_LIST_NAME,
  COUNCIL_MY_PAST_ACTIONS_LIST_NAME,
  calculateSlicePositions,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'
import {
  ALL_PAST_COUNSIL_TAB,
  ALL_PENDING_COUNSIL_TAB,
  MY_PAST_COUNSIL_TAB,
  MY_PENDING_COUNSIL_TAB,
  councilTabsList,
  MavrykCounsilDdForms,
  MavrykCounsilPageTitles,
  BgCounsilDdForms,
  BgCounsilPageTitles,
} from './helpers/council.consts'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'

// types
import { CouncilActionType, CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'
import { CouncilTabsType } from 'providers/CouncilProvider/helpers/council.types'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// utils
import { getSeparateSnakeCase } from 'utils/parse'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// view
import { DropDown, DDItemId, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import { CouncilForms } from './components/CouncilForms.controller'
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilAction } from 'pages/Council/components/CouncilAction.view'
import Icon from 'app/App.components/Icon/Icon.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'
import { CouncilStyled, AvaliableActions, CounsilPageWrapper } from './Council.style'
import { CounsilActionsToSign } from './components/CounsilActionsToSign'
import { UpdateMemberInfoPopup } from './components/UpdateMemberInfoPopup'
import { CounsilSidebar } from './components/CounsilSidebar'
import { CouncilOngoingAction } from './components/CouncilOngoingAction.view'

type Props = {
  selectedTab: CouncilTabsType
  isBreakGlassCounsil?: boolean

  allPendingActions: number[]
  notMyPendingActions: number[]
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

export function CouncilView({
  selectedTab,
  isBreakGlassCounsil = false,

  allPendingActions,
  notMyPendingActions,
  myPendingActions,
  allPastActions,
  myPastActions,
  actionsMapper,
  members,
}: Props) {
  const history = useHistory()
  const { search } = useLocation()

  const {
    maxLengths: { council: counsilMaxLenghts },
  } = useDappConfigContext()
  const { userAddress, isBreakGlassCouncil, isMavrykCouncil } = useUserContext()

  const isUserCouncil = isBreakGlassCounsil ? isBreakGlassCouncil : isMavrykCouncil

  const { pagePathname, dropDownItems, titles } = useMemo(() => {
    return {
      titles: isBreakGlassCounsil ? BgCounsilPageTitles : MavrykCounsilPageTitles,
      pagePathname: isBreakGlassCounsil ? '/break-glass-council' : '/mavryk-council',
      dropDownItems: Object.values(
        isBreakGlassCounsil ? BgCounsilDdForms : MavrykCounsilDdForms,
      ).map<ActionsDDItemType>((item, index) => ({
        content: <DropdownTruncateOption text={getSeparateSnakeCase(item)} />,
        value: item,
        id: index,
      })),
    }
  }, [isBreakGlassCounsil])

  const {
    currentListName,
    isMyPendingTab,
    isMyPastTab,
    isAllPendingTab,
    isAllPastTab,
    listItemsAmount,
    paginatedList,
  } = useMemo(() => {
    const isMyPendingTab = selectedTab === MY_PENDING_COUNSIL_TAB
    const isMyPastTab = selectedTab === MY_PAST_COUNSIL_TAB
    const isAllPendingTab = selectedTab === ALL_PENDING_COUNSIL_TAB
    const isAllPastTab = selectedTab === ALL_PAST_COUNSIL_TAB

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
  // TODO: uncomment when we will have council to test
  // useEffect(() => {
  //   if (isMyActionsTabs && (!userAddress || !isUserCouncil)) history.replace(`${pagePathname}/${ALL_PAST_COUNSIL_TAB}`)
  // }, [userAddress, isUserCouncil])

  // update member popup
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const openPopup = useCallback(() => setIsUpdateCouncilMemberInfo(true), [])
  const closePopup = useCallback(() => setIsUpdateCouncilMemberInfo(false), [])

  const displayPendingSignature = Boolean(isMyActionsTabs && isUserCouncil && notMyPendingActions.length)

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
      history.replace(
        `${pagePathname}${tabId === 1 ? MY_PENDING_COUNSIL_TAB : `/${MY_PAST_COUNSIL_TAB}`}${
          search ? `?${search}` : ''
        }`,
      )
    },
    [pagePathname, search],
  )

  return (
    <CounsilPageWrapper>
      {(isAllPastTab || isAllPendingTab) && isUserCouncil && (
        <Link to={pagePathname}>
          <NewButton kind={BUTTON_SECONDARY}>
            <Icon id="full-arrow-left" />
            Back to Member Dashboard
          </NewButton>
        </Link>
      )}

      {displayPendingSignature && <h1>Pending Signature</h1>}

      <CouncilStyled>
        <div className="left-block">
          {displayPendingSignature ? (
            <CounsilActionsToSign
              isBreakGlassAction={isBreakGlassCounsil}
              actionstoSign={notMyPendingActions}
              actionsMapper={actionsMapper}
              members={members}
            />
          ) : null}

          {isMyActionsTabs ? (
            <>
              <AvaliableActions>
                <div className="top-bar">
                  <h1 className="top-bar-title">Available Actions</h1>

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
                  councilMaxLengths={counsilMaxLenghts}
                  members={members}
                />
              </AvaliableActions>

              <SlidingTabButtons
                kind={SECONDARY_SLIDING_TAB_BUTTONS}
                tabItems={councilTabsList}
                onClick={handleChangeTabs}
              />
            </>
          ) : (
            <h1>{isAllPastTab ? titles.allPastActions : isAllPendingTab ? titles.allPending : null}</h1>
          )}

          <div>
            {paginatedList.length ? (
              paginatedList.map((item) => {
                const { id, startDatetime, actionType, signersCount, councilSize, counsilAddress, parameters } =
                  actionsMapper[item]

                if (isMyPendingTab) {
                  return (
                    <CouncilOngoingAction
                      id={id}
                      key={id}
                      startDatetime={startDatetime}
                      actionType={actionType}
                      signersCount={signersCount}
                      numCouncilMembers={councilSize}
                      isBreakGlassCounsil={isBreakGlassCounsil}
                      cardIdName={titles.cardIdName}
                      counsilAddress={counsilAddress}
                      parameters={parameters}
                    />
                  )
                }

                return (
                  <CouncilAction
                    key={id}
                    startDatetime={startDatetime}
                    actionType={actionType}
                    signersCount={signersCount}
                    numCouncilMembers={councilSize}
                    councilId={counsilAddress}
                  />
                )
              })
            ) : (
              <EmptyContainer>
                <img src="/images/not-found.svg" alt=" No counsil actions to show" />
                <figcaption> No counsil actions to show</figcaption>
              </EmptyContainer>
            )}
          </div>

          {listItemsAmount ? <Pagination itemsCount={listItemsAmount} listName={currentListName} /> : null}
        </div>

        <CounsilSidebar
          membersTitle={titles.membersName}
          counsilMembers={members}
          openUpdateMemberProfilePopup={openPopup}
          selectedTab={selectedTab}
          pagePathname={pagePathname}
        />
      </CouncilStyled>

      <UpdateMemberInfoPopup
        show={isUpdateCouncilMemberInfo}
        closePopup={closePopup}
        isBreakGlassCounsil={isBreakGlassCounsil}
        memberProfile={members.find((item) => item.userId === userAddress)}
      />
    </CounsilPageWrapper>
  )
}
