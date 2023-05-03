import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useParams } from 'react-router'
import qs from 'qs'

// components
import { DropDown, DDItemId, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilAction } from 'pages/Council/CouncilActions/CouncilAction.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { CouncilMemberView } from 'pages/Council/CouncilMember/CouncilMember.view'
import { CouncilPending } from './CouncilPending/CouncilPending.controller'
import { MyCouncilActions } from './CouncilActions/MyCouncilActions.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'

// helpers
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from '../../app/App.components/Button/Button.constants'
import { getSeparateSnakeCase } from 'utils/parse'
import { memberIsFirstOfList } from 'pages/Council/Council.helpers'
import {
  COUNCIL_ALL_PAST_ACTIONS_LIST_NAME,
  COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME,
  COUNCIL_MY_PENDING_ACTIONS_LIST_NAME,
  COUNCIL_MY_PAST_ACTIONS_LIST_NAME,
  calculateSlicePositions,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'

// styles
import {
  CouncilStyled,
  ReviewCard,
  AvaliableActions,
  PropagateBreakGlassCouncilCard,
  CounsilPageWrapper,
} from './Council.style'

// types
import { CouncilMaxLength, CouncilActionType, CouncilMembers } from 'utils/TypesAndInterfaces/Council'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// actions
import { propagateBreakGlass } from '../BreakGlassCouncil/BreakGlassCouncil.actions'

export const councilEmptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No data to show</figcaption>
  </EmptyContainer>
)

export const councilTabsList: TabItem[] = [
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
  pathnameOfPage: string
  maxLength: CouncilMaxLength
  glassBroken?: boolean
  showPropagateBreakGlass?: boolean
  titles: {
    membersName: string
    cardIdName: string
    allPastActions: string
  }

  allPendingActions: number[]
  notMyPendingActions: number[]
  myPendingActions: number[]

  allPastActions: number[]
  myPastActions: number[]

  actionsMapper: Record<number, CouncilActionType>

  members: CouncilMembers
  dropdowndActions: Record<string, string>

  handleSignAction: (id: number) => void
  handleDropAction: (id: number) => void

  getFormComponent: () => React.ReactNode
  getFormUpdateMemberInfo: (maxLength: CouncilMaxLength, callback: () => void) => React.ReactNode
}

export function CouncilView({
  pathnameOfPage,
  maxLength,
  glassBroken,
  showPropagateBreakGlass,
  getFormComponent,
  getFormUpdateMemberInfo,
  titles,

  allPendingActions,
  notMyPendingActions,
  myPendingActions,

  allPastActions,
  myPastActions,

  actionsMapper,

  members,
  dropdowndActions,

  handleSignAction,
  handleDropAction,
}: Props) {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const queryParameters = {
    pathname: pathnameOfPage,
    pastActions: '/past-actions',
    pendingActions: '/pending-actions',
  }

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const dropDownItems = useMemo(
    () =>
      Object.values(dropdowndActions).map((item, index) => ({
        content: <DropdownTruncateOption text={getSeparateSnakeCase(item)} />,
        value: item,
        id: index,
      })),
    [dropdowndActions],
  )

  type DropDownItemType = (typeof dropDownItems)[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const [activeActionTab, setActiveActionTab] = useState(councilTabsList[0].text)
  const sortedCouncilMembers = memberIsFirstOfList(members, accountPkh)

  const { page, action } = qs.parse(search, { ignoreQueryPrefix: true })
  const { tabId } = useParams<{ tabId: string }>()

  const isPastActionsTab = tabId === 'past-actions'
  const isPendingActionsTab = tabId === 'pending-actions'
  const isMyPendingActionsTab = activeActionTab === councilTabsList[0].text

  const isCouncilMember = Boolean(members.find((item) => item.userId === accountPkh)?.id)
  const displayPendingSignature = Boolean(!tabId && isCouncilMember && notMyPendingActions.length)

  const handleOpenleModal = () => {
    setIsUpdateCouncilMemberInfo(true)
  }

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

  const closePopup = () => {
    setIsUpdateCouncilMemberInfo(false)
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

  const handleClickPropagateBreakGlass = () => {
    dispatch(propagateBreakGlass())
  }

  useEffect(() => {
    // choose action after reload page
    const foundAction = dropDownItems.find((item) => item.value === action)
    setChosenDdItem(foundAction)
  }, [])

  useEffect(() => {
    // redirect to review page when member changes
    if (!accountPkh) {
      history.replace(`${queryParameters.pathname}${queryParameters.pastActions}`)
    }
  }, [history, queryParameters.pathname, queryParameters.pastActions, accountPkh, isCouncilMember])

  useEffect(() => {
    // check authorization when clicking on a review or a header in the menu
    if (!isCouncilMember) {
      history.replace(`${queryParameters.pathname}${queryParameters.pastActions}`)
    }
  }, [history, isCouncilMember, pathname, queryParameters.pathname, queryParameters.pastActions])

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

      {!tabId && isCouncilMember && showPropagateBreakGlass && (
        <PropagateBreakGlassCouncilCard>
          <div>
            <h1>Propagate Break Glass</h1>
            <p>
              This action can only be taken to pause all contracts in the event of a successful emergency governance
              where a critical flaw has been detected in the Mavryk Smart Contracts.
            </p>
          </div>

          <NewButton kind={BUTTON_PRIMARY} onClick={handleClickPropagateBreakGlass} disabled={glassBroken}>
            <Icon id="plus" />
            Propagate Break Glass
          </NewButton>
        </PropagateBreakGlassCouncilCard>
      )}

      {displayPendingSignature && <h1>Pending Signature</h1>}

      <CouncilStyled>
        <div className="left-block">
          {displayPendingSignature && (
            <article className="pending">
              <div className="pending-items">
                <Carousel itemLength={notMyPendingActions.length}>
                  {notMyPendingActions.map((item, index) => {
                    const action = actionsMapper[item]

                    return (
                      <CouncilPending
                        {...action}
                        key={action.id}
                        numCouncilMembers={members.length}
                        councilPendingActionsLength={notMyPendingActions.length}
                        index={index}
                        handleSignAction={handleSignAction}
                      />
                    )
                  })}
                </Carousel>
              </div>
            </article>
          )}

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
                            councilId={action.councilId}
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
                            councilId={action.councilId}
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

                {getFormComponent()}
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

        <div className="right-block">
          {!tabId && (
            <ReviewCard>
              <Link to={`${queryParameters.pathname}${queryParameters.pastActions}`}>
                <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
                  Review Past Actions
                </NewButton>
              </Link>

              <Link to={`${queryParameters.pathname}${queryParameters.pendingActions}`}>
                <NewButton form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
                  Review Pending Actions
                </NewButton>
              </Link>
            </ReviewCard>
          )}

          {Boolean(sortedCouncilMembers.length) && (
            <>
              <h1>{titles.membersName}</h1>

              <div>
                {sortedCouncilMembers.map((item) => (
                  <CouncilMemberView
                    key={item.id}
                    image={item.image}
                    name={item.name}
                    userId={item.userId}
                    openModal={handleOpenleModal}
                    showUpdateInfo={isCouncilMember}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CouncilStyled>

      <PopupContainer onClick={closePopup} show={isUpdateCouncilMemberInfo}>
        <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council">
          {getFormUpdateMemberInfo(maxLength, closePopup)}
        </PopupContainerWrapper>
      </PopupContainer>
    </CounsilPageWrapper>
  )
}
