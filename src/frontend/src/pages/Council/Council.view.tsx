import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useParams } from 'react-router'
import qs from 'qs'

// consts
import { BgCounsilDdForms, BgCounsilPageTitles } from 'pages/Council/helpers/breakGlassCouncil.consts'
import { MavrykCounsilDdForms, MavrykCounsilPageTitles } from './helpers/mavrykCouncil.consts'
import { BUTTON_SECONDARY, BUTTON_WIDE } from '../../app/App.components/Button/Button.constants'
import {
  COUNCIL_ALL_PAST_ACTIONS_LIST_NAME,
  COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME,
  COUNCIL_MY_PENDING_ACTIONS_LIST_NAME,
  COUNCIL_MY_PAST_ACTIONS_LIST_NAME,
  calculateSlicePositions,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'

// types
import { CouncilActionType, CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'
import { SlidingTabButtonType } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// utils
import { getSeparateSnakeCase } from 'utils/parse'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'

// view
import { DropDown, DDItemId, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import { CouncilForm } from './CouncilForms/CouncilForm.controller'
import NewButton from 'app/App.components/Button/NewButton'
import { BreakGlassCouncilForm } from 'pages/Council/BreakGlassCouncilForms/BreakGlassCouncilForm.controller'
import { CouncilAction } from 'pages/Council/components/CouncilAction.view'
import { MyCouncilActions } from './components/MyCouncilActions.view'
import Icon from 'app/App.components/Icon/Icon.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'
import { CouncilStyled, ReviewCard, AvaliableActions, CounsilPageWrapper } from './Council.style'
import { CounsilActionsToSign } from './components/CounsilActionsToSign'
import { UpdateMemberInfoPopup } from './components/UpdateMemberInfoPopup'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { CounsilSidebar } from './components/CounsilSidebar'

export const councilEmptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No data to show</figcaption>
  </EmptyContainer>
)

export const councilTabsList: SlidingTabButtonType[] = [
  {
    text: 'My Ongoing Actions',
    id: 1,
    active: true,
  },
  {
    text: 'My Past Actions',
    id: 2,
    active: false,
  },
]

type Props = {
  isBreakGlassCounsil?: boolean

  allPendingActions: number[]
  notMyPendingActions: number[]
  myPendingActions: number[]

  allPastActions: number[]
  myPastActions: number[]

  actionsMapper: Record<number, CouncilActionType>
  members: CouncilMembersType
}

export function CouncilView({
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
  const { search, pathname } = useLocation()

  const { page, action } = qs.parse(search, { ignoreQueryPrefix: true })
  const { tabId } = useParams<{ tabId: string }>()

  const {
    maxLengths: { council: counsilMaxLenghts },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()

  const { queryParameters, dropDownItems, titles } = useMemo(() => {
    return {
      titles: isBreakGlassCounsil ? BgCounsilPageTitles : MavrykCounsilPageTitles,
      queryParameters: {
        pathname: isBreakGlassCounsil ? '/break-glass-council' : '/mavryk-council',
        pastActions: '/past-actions',
        pendingActions: '/pending-actions',
      },
      dropDownItems: Object.values(isBreakGlassCounsil ? BgCounsilDdForms : MavrykCounsilDdForms).map(
        (item, index) => ({
          content: <DropdownTruncateOption text={getSeparateSnakeCase(item)} />,
          value: item,
          id: index,
        }),
      ),
    }
  }, [isBreakGlassCounsil])

  const isCouncilMember = Boolean(members.find((item) => item.userId === userAddress)?.id)

  // choose action after reload page
  useEffect(() => {
    setChosenDdItem(dropDownItems.find((item) => item.value === action))
  }, [])

  // redirect to review page when member changes
  useEffect(() => {
    if (!userAddress) history.replace(`${queryParameters.pathname}${queryParameters.pastActions}`)
  }, [queryParameters.pathname, queryParameters.pastActions, userAddress, isCouncilMember])

  // check authorization when clicking on a review or a header in the menu
  useEffect(() => {
    if (!isCouncilMember) history.replace(`${queryParameters.pathname}${queryParameters.pastActions}`)
  }, [isCouncilMember, pathname, queryParameters.pathname, queryParameters.pastActions])

  // update member popup
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const openPopup = useCallback(() => setIsUpdateCouncilMemberInfo(true), [])
  const closePopup = useCallback(() => setIsUpdateCouncilMemberInfo(false), [])

  type DropDownItemType = (typeof dropDownItems)[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()
  const [activeActionTab, setActiveActionTab] = useState(councilTabsList[0].text)

  const isPastActionsTab = tabId === 'past-actions'
  const isPendingActionsTab = tabId === 'pending-actions'
  const isMyPendingActionsTab = activeActionTab === councilTabsList[0].text

  const displayPendingSignature = Boolean(!tabId && isCouncilMember && notMyPendingActions.length)

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return

    const newQueryParams = {
      page,
      action: foundItem.value,
    }

    const newPageLink = pathname + qs.stringify(newQueryParams, { addQueryPrefix: true })

    history.push(newPageLink)
    setChosenDdItem(foundItem)
  }

  const getCurrentListName = () => {
    if (isPastActionsTab) {
      return COUNCIL_ALL_PAST_ACTIONS_LIST_NAME
    } else if (isPendingActionsTab) {
      return COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME
    }

    return isMyPendingActionsTab ? COUNCIL_MY_PENDING_ACTIONS_LIST_NAME : COUNCIL_MY_PAST_ACTIONS_LIST_NAME
  }

  const currentPage = getPageNumber(search, getCurrentListName())

  const paginatedAllPendingActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME)
    return allPendingActions?.slice(from, to)
  }, [currentPage, allPendingActions])

  const paginatedAllPastActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_ALL_PAST_ACTIONS_LIST_NAME)
    return allPastActions?.slice(from, to)
  }, [currentPage, allPastActions])

  const paginatedMyPendingActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_MY_PENDING_ACTIONS_LIST_NAME)
    return myPendingActions?.slice(from, to)
  }, [currentPage, myPendingActions])

  const paginatedMyPastActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, COUNCIL_MY_PAST_ACTIONS_LIST_NAME)
    return myPastActions?.slice(from, to)
  }, [currentPage, myPastActions])

  return (
    <CounsilPageWrapper>
      {tabId && isCouncilMember && (
        <Link to={queryParameters.pathname}>
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

          {tabId ? (
            <>
              {isPastActionsTab ? (
                <>
                  <h1>{titles.allPastActions}</h1>

                  {paginatedAllPastActions.length ? (
                    <div>
                      {paginatedAllPastActions.map((item) => {
                        const action = actionsMapper[item]

                        return (
                          <CouncilAction
                            startDatetime={action.startDatetime}
                            key={action.id}
                            actionType={action.actionType}
                            signersCount={action.signersCount}
                            numCouncilMembers={action.councilSize}
                            councilId={action.counsilAddress}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    councilEmptyContainer
                  )}
                </>
              ) : null}

              {!isPastActionsTab ? (
                <>
                  <h1>Pending Signature Council Actions</h1>
                  {paginatedAllPendingActions.length ? (
                    <div>
                      {paginatedAllPendingActions.map((item) => {
                        const action = actionsMapper[item]

                        return (
                          <CouncilAction
                            startDatetime={action.startDatetime}
                            key={action.id}
                            actionType={action.actionType}
                            signersCount={action.signersCount}
                            numCouncilMembers={members.length}
                            councilId={action.counsilAddress}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    councilEmptyContainer
                  )}
                </>
              ) : null}

              <Pagination
                itemsCount={isPastActionsTab ? allPastActions.length : allPendingActions.length}
                listName={isPastActionsTab ? COUNCIL_ALL_PAST_ACTIONS_LIST_NAME : COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME}
              />
            </>
          ) : (
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

                {isBreakGlassCounsil ? (
                  <BreakGlassCouncilForm
                    selectedAction={action?.toString()}
                    councilMaxLengths={counsilMaxLenghts}
                    members={members}
                  />
                ) : (
                  <CouncilForm selectedAction={action?.toString()} councilMaxLengths={counsilMaxLenghts} />
                )}
              </AvaliableActions>

              <MyCouncilActions
                myPastCouncilAction={paginatedMyPastActions}
                myPastCouncilActionLength={myPastActions.length}
                actionPendingSignature={paginatedMyPendingActions}
                actionPendingSignatureLength={myPendingActions.length}
                actionsMapper={actionsMapper}
                numCouncilMembers={members.length}
                activeActionTab={activeActionTab}
                setActiveActionTab={setActiveActionTab}
                tabsList={councilTabsList}
                handleDropAction={handleDropAction}
                listNameMyPastActions={COUNCIL_MY_PAST_ACTIONS_LIST_NAME}
                listNameMyOngoingActions={COUNCIL_MY_PENDING_ACTIONS_LIST_NAME}
                cardIdName={titles.cardIdName}
              />
            </>
          )}
        </div>
      </CouncilStyled>

      <CounsilSidebar
        membersTitle={titles.membersName}
        counsilMembers={members}
        openUpdateMemberProfilePopup={openPopup}
        showNavButtons={!tabId}
        queryParameters={queryParameters}
      />

      <UpdateMemberInfoPopup
        show={isUpdateCouncilMemberInfo}
        closePopup={closePopup}
        isBreakGlassCounsil={isBreakGlassCounsil}
      />
    </CounsilPageWrapper>
  )
}
