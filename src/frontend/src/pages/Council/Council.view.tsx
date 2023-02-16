import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useParams } from 'react-router'

// components
import { DropDown, DDItemId } from 'app/App.components/DropDown/NewDropdown'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CouncilPastActionView } from 'pages/Council/CouncilActions/CouncilPastAction.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { CouncilMemberView } from 'pages/Council/CouncilMember/CouncilMember.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { FormUpdateCouncilMemberView } from '../BreakGlassCouncil/BreakGlassCouncilForms/FormUpdateCouncilMember.view'
import { CouncilPending } from './CouncilPending/CouncilPending.controller'
import { MyCouncilActions } from './MyCouncilActions.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { councilEmptyContainer } from 'pages/Council/Council.controller'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// helpers
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  TRANSPARENT_WITH_BORDER,
} from '../../app/App.components/Button/Button.constants'
import { calculateSlicePositions } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { getSeparateSnakeCase } from 'utils/parse'
import { memberIsFirstOfList } from 'pages/Council/Council.helpers'
import { scrollUpPage } from 'utils/scrollUpPage'
import { councilTabsList } from 'pages/Council/Council.controller'

// styles
import {
  CouncilStyled,
  ReviewPastCouncilActionsCard,
  AvaliableActions,
  PropagateBreakGlassCouncilCard,
} from './Council.style'

// types
import { CouncilMaxLength, CouncilActions, CouncilMembers } from 'utils/TypesAndInterfaces/Council'

// actions
import { propagateBreakGlass } from '../BreakGlassCouncil/BreakGlassCouncil.actions'

type Props = {
  queryParameters: {
    pathname: string
    review: string
    pendingReview: string
  }
  maxLength: CouncilMaxLength
  glassBroken?: boolean
  showPropagateBreakGlass?: boolean
  paginationListName: string
  getFormComponent: (maxLength: CouncilMaxLength, action?: string) => void

  allPendingActions: CouncilActions
  notMyPendingActions: CouncilActions
  myPendingActions: CouncilActions

  allPastActions: CouncilActions
  myPastActions: CouncilActions

  members: CouncilMembers
  dropdowndActions: Record<string, string>

  handleSignAction: (id: number) => void
  handleDropAction: (id: number) => void
}

export function CouncilView({
  queryParameters,
  maxLength,
  glassBroken,
  showPropagateBreakGlass,
  paginationListName,
  getFormComponent,

  allPendingActions,
  notMyPendingActions,
  myPendingActions,

  allPastActions,
  myPastActions,

  members,
  dropdowndActions,

  handleSignAction,
  handleDropAction,
}: Props) {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const dropDownItems = useMemo(
    () =>
      Object.values(dropdowndActions).map((item, index) => ({
        content: <div>{getSeparateSnakeCase(item)}</div>,
        value: item,
        id: index,
      })),
    [dropdowndActions],
  )

  type DropDownItemType = typeof dropDownItems[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const [activeActionTab, setActiveActionTab] = useState(councilTabsList[0].text)

  const sortedBreakGlassCouncilMembers = memberIsFirstOfList(members, accountPkh)
  const { tabId } = useParams<{ tabId: string }>()
  const isReviewPage = tabId === 'review'

  const isUserInBreakCouncilMember = Boolean(members.find((item) => item.userId === accountPkh)?.id)
  const displayPendingSignature = Boolean(!tabId && isUserInBreakCouncilMember && notMyPendingActions.length)

  const handleClickReview = (review: string) => {
    history.replace(`${queryParameters.pathname}${review}`)
    setActiveActionTab(councilTabsList[0].text)
    scrollUpPage()
  }

  const handleOpenleModal = () => {
    setIsUpdateCouncilMemberInfo(true)
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  const closePopup = () => {
    setIsUpdateCouncilMemberInfo(false)
  }

  const currentPage = getPageNumber(search, paginationListName)

  const paginatedBreakGlassActionPendingAllSignature = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, paginationListName)
    return allPendingActions?.slice(from, to)
  }, [currentPage, paginationListName, allPendingActions])

  const paginatedBreakGlassActionPendingMySignature = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, paginationListName)
    return myPendingActions?.slice(from, to)
  }, [currentPage, myPendingActions, paginationListName])

  const paginatedMyPastCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, paginationListName)
    return myPastActions?.slice(from, to)
  }, [currentPage, myPastActions, paginationListName])

  const paginatedPastBreakGlassCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, paginationListName)
    return allPastActions?.slice(from, to)
  }, [currentPage, paginationListName, allPastActions])

  const handleClickPropagateBreakGlass = () => {
    dispatch(propagateBreakGlass())
  }

  useEffect(() => {
    // redirect to review or main page when member changes
    history.replace(
      isUserInBreakCouncilMember ? queryParameters.pathname : `${queryParameters.pathname}${queryParameters.review}`,
    )
  }, [history, isUserInBreakCouncilMember, queryParameters.pathname, queryParameters.review])

  useEffect(() => {
    // check authorization when clicking on a review or a header in the menu
    if (!isUserInBreakCouncilMember) {
      history.replace(`${queryParameters.pathname}${queryParameters.review}`)
    }
  }, [history, isUserInBreakCouncilMember, pathname, queryParameters.pathname, queryParameters.review])

  return (
    <>
      {tabId && isUserInBreakCouncilMember && (
        <Link to={queryParameters.pathname}>
          <NewButton kind={TRANSPARENT_WITH_BORDER} className="margin-top-30 go-back">
            <Icon id="arrowRight" /> Back to Member Dashboard
          </NewButton>
        </Link>
      )}

      {!tabId && isUserInBreakCouncilMember && showPropagateBreakGlass && (
        <PropagateBreakGlassCouncilCard>
          <h1>Propagate Break Glass</h1>

          <NewButton kind={ACTION_PRIMARY} onClick={handleClickPropagateBreakGlass} disabled={glassBroken}>
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
                  {notMyPendingActions.map((item, index) => (
                    <CouncilPending
                      {...item}
                      key={item.id}
                      numCouncilMembers={members.length}
                      councilPendingActionsLength={notMyPendingActions.length}
                      index={index}
                      handleSignAction={handleSignAction}
                    />
                  ))}
                </Carousel>
              </div>
            </article>
          )}

          {tabId ? (
            <>
              {isReviewPage ? (
                <>
                  <h1>Past Break Glass Council Actions</h1>
                  {paginatedPastBreakGlassCouncilActions.length
                    ? paginatedPastBreakGlassCouncilActions.map((item) => (
                        <CouncilPastActionView
                          startDatetime={String(item.startDatetime)}
                          key={item.id}
                          actionType={item.actionType}
                          signersCount={item.signersCount}
                          numCouncilMembers={members.length}
                          councilId={item.councilId}
                        />
                      ))
                    : councilEmptyContainer}
                </>
              ) : null}

              {!isReviewPage ? (
                <>
                  <h1>Pending Signature Council Actions</h1>
                  {paginatedBreakGlassActionPendingAllSignature.length
                    ? paginatedBreakGlassActionPendingAllSignature.map((item) => (
                        <CouncilPastActionView
                          startDatetime={String(item.startDatetime)}
                          key={item.id}
                          actionType={item.actionType}
                          signersCount={item.signersCount}
                          numCouncilMembers={members.length}
                          councilId={item.councilId}
                        />
                      ))
                    : councilEmptyContainer}
                </>
              ) : null}

              <Pagination
                itemsCount={isReviewPage ? allPastActions.length : allPastActions.length}
                listName={paginationListName}
              />
            </>
          ) : (
            <>
              <AvaliableActions>
                <div className="top-bar">
                  <h1 className="top-bar-title">Available Actions</h1>

                  <div className="dropdown-size">
                    <DropDown
                      placeholder="Choose action"
                      activeItem={chosenDdItem}
                      items={dropDownItems}
                      clickItem={handleClickDropdownItem}
                    />
                  </div>
                </div>

                {getFormComponent(maxLength, chosenDdItem?.value)}
              </AvaliableActions>

              <MyCouncilActions
                myPastCouncilAction={paginatedMyPastCouncilActions}
                myPastCouncilActionLength={myPastActions.length}
                actionPendingSignature={paginatedBreakGlassActionPendingMySignature}
                actionPendingSignatureLength={myPendingActions.length}
                numCouncilMembers={members.length}
                activeActionTab={activeActionTab}
                setActiveActionTab={setActiveActionTab}
                tabsList={councilTabsList}
                handleDropAction={handleDropAction}
                listNameMyPastActions={paginationListName}
                listNameMyOngoingActions={paginationListName}
                pageType="breakGlassCouncil"
              />
            </>
          )}
        </div>

        <div className="right-block">
          {!tabId && (
            <ReviewPastCouncilActionsCard displayPendingSignature={displayPendingSignature}>
              <NewButton kind={ACTION_SECONDARY} onClick={() => handleClickReview(queryParameters.review)}>
                Review Past Actions
              </NewButton>
              <NewButton kind={ACTION_SECONDARY} onClick={() => handleClickReview(queryParameters.pendingReview)}>
                Review Pending Actions
              </NewButton>
            </ReviewPastCouncilActionsCard>
          )}

          {Boolean(sortedBreakGlassCouncilMembers.length) && (
            <>
              <h1>Break Glass Council</h1>

              {sortedBreakGlassCouncilMembers.map((item) => (
                <CouncilMemberView
                  key={item.id}
                  image={item.image}
                  name={item.name}
                  userId={item.userId}
                  openModal={handleOpenleModal}
                  showUpdateInfo={isUserInBreakCouncilMember}
                />
              ))}
            </>
          )}
        </div>
      </CouncilStyled>

      <PopupContainer onClick={closePopup} show={isUpdateCouncilMemberInfo}>
        <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council">
          <FormUpdateCouncilMemberView {...maxLength} />
        </PopupContainerWrapper>
      </PopupContainer>
    </>
  )
}
