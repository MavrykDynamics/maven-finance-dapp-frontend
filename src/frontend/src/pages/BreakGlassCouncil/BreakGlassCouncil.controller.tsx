import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useParams } from 'react-router'

// components
import { DropDown, DDItemId } from 'app/App.components/DropDown/NewDropdown'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CouncilPastActionView } from 'pages/Council/CouncilActions/CouncilPastAction.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { CouncilMemberView } from 'pages/Council/CouncilMember/CouncilMember.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { BreakGlassCouncilForm, actions } from './BreakGlassCouncilForms/BreakGlassCouncilForm.controller'
import { FormUpdateCouncilMemberView } from './BreakGlassCouncilForms/FormUpdateCouncilMember.view'
import { CouncilPending } from '../Council/CouncilPending/CouncilPending.controller'
import { MyCouncilActions } from '../Council/MyCouncilActions.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { councilEmptyContainer } from 'pages/Council/Council.controller'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// helpers
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  TRANSPARENT_WITH_BORDER,
} from '../../app/App.components/Button/Button.constants'
import {
  BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME,
  BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME,
  BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME,
  calculateSlicePositions,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { getSeparateSnakeCase } from 'utils/parse'
import { memberIsFirstOfList } from 'pages/Council/Council.helpers'
import { scrollUpPage } from 'utils/scrollUpPage'
import { councilTabsList } from 'pages/Council/Council.controller'

// styles
import {
  Page,
  BreakGlassCouncilStyled,
  ReviewPastCouncilActionsCard,
  AvaliableActions,
  PropagateBreakGlassCouncilCard,
} from './BreakGlassCouncil.style'

// actions
import {
  propagateBreakGlass,
  getBreakGlassActionPendingSignature,
  getMyPastBreakGlassCouncilAction,
  getPastBreakGlassCouncilAction,
  getBreakGlassCouncilMember,
  dropBreakGlass,
  signAction,
} from './BreakGlassCouncil.actions'

const queryParameters = {
  pathname: '/break-glass-council',
  review: '/review',
  pendingReview: '/pending-review',
}

export function BreakGlassCouncil() {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    breakGlassStorage,
    breakGlassCouncilMember,
    breakGlassActionPendingAllSignature,
    breakGlassActionPendingSignature,
    breakGlassActionPendingMySignature,
    pastBreakGlassCouncilAction,
    myPastBreakGlassCouncilAction,
    glassBroken,
    isPendingPropagateBreakGlass,
  } = useSelector((state: State) => state.breakGlass)

  const dropDownItems = useMemo(
    () =>
      Object.values(actions).map((item, index) => ({
        content: <div>{getSeparateSnakeCase(item)}</div>,
        value: item,
        id: index,
      })),
    [],
  )

  type DropDownItemType = typeof dropDownItems[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()
  const [isUpdateCouncilMemberInfo, setIsUpdateCouncilMemberInfo] = useState(false)
  const [activeActionTab, setActiveActionTab] = useState(councilTabsList[0].text)

  const sortedBreakGlassCouncilMembers = memberIsFirstOfList(breakGlassCouncilMember, accountPkh)
  const { review } = useParams<{ review: string }>()
  const isReviewPage = review === 'review'

  const isUserInBreakCouncilMember = Boolean(breakGlassCouncilMember.find((item) => item.userId === accountPkh)?.id)
  const displayPendingSignature = Boolean(
    !review && isUserInBreakCouncilMember && breakGlassActionPendingSignature?.length,
  )

  const councilMemberMaxLength = {
    councilMemberNameMaxLength: breakGlassStorage?.config?.councilMemberNameMaxLength,
    councilMemberWebsiteMaxLength: breakGlassStorage?.config?.councilMemberWebsiteMaxLength,
  }

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

  const handleSignAction = (id: number) => {
    dispatch(signAction(id))
  }

  const closePopup = () => {
    setIsUpdateCouncilMemberInfo(false)
  }

  const currentPage = getPageNumber(
    search,
    review
      ? BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME
      : councilTabsList[0].text === activeActionTab
      ? BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME
      : BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME,
  )

  const paginatedBreakGlassActionPendingAllSignature = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME)
    return breakGlassActionPendingAllSignature?.slice(from, to)
  }, [currentPage, breakGlassActionPendingAllSignature])

  const paginatedBreakGlassActionPendingMySignature = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME)
    return breakGlassActionPendingMySignature?.slice(from, to)
  }, [currentPage, breakGlassActionPendingMySignature])

  const paginatedMyPastCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME)
    return myPastBreakGlassCouncilAction?.slice(from, to)
  }, [currentPage, myPastBreakGlassCouncilAction])

  const paginatedPastBreakGlassCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME)
    return pastBreakGlassCouncilAction?.slice(from, to)
  }, [currentPage, pastBreakGlassCouncilAction])

  const handleClickPropagateBreakGlass = () => {
    dispatch(propagateBreakGlass())
  }

  const handleDropAction = (id: number) => {
    dispatch(dropBreakGlass(id))
  }

  useEffect(() => {
    dispatch(getPastBreakGlassCouncilAction())
    dispatch(getBreakGlassCouncilMember())
  }, [dispatch])

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMyPastBreakGlassCouncilAction())
      dispatch(getBreakGlassActionPendingSignature())
    }
  }, [dispatch, accountPkh])

  useEffect(() => {
    // redirect to review or main page when member changes
    history.replace(
      isUserInBreakCouncilMember ? queryParameters.pathname : `${queryParameters.pathname}${queryParameters.review}`,
    )
  }, [history, isUserInBreakCouncilMember])

  useEffect(() => {
    // check authorization when clicking on a review or a header in the menu
    if (!isUserInBreakCouncilMember) {
      history.replace(`${queryParameters.pathname}${queryParameters.review}`)
    }
  }, [history, isUserInBreakCouncilMember, pathname])

  return (
    <Page>
      <PageHeader page={'break glass council'} />
      {review && isUserInBreakCouncilMember && (
        <Link to={`/break-glass-council`}>
          <NewButton kind={TRANSPARENT_WITH_BORDER} className="margin-top-30 go-back">
            <Icon id="arrowRight" /> Back to Member Dashboard
          </NewButton>
        </Link>
      )}

      {isUserInBreakCouncilMember && !review && (
        <PropagateBreakGlassCouncilCard>
          <h1>Propagate Break Glass</h1>

          <NewButton
            kind={ACTION_PRIMARY}
            onClick={handleClickPropagateBreakGlass}
            disabled={glassBroken || isPendingPropagateBreakGlass}
          >
            <Icon id="plus" />
            Propagate Break Glass
          </NewButton>
        </PropagateBreakGlassCouncilCard>
      )}

      {displayPendingSignature && <h1>Pending Signature</h1>}

      <BreakGlassCouncilStyled>
        <div className="left-block">
          {displayPendingSignature && (
            <article className="pending">
              <div className="pending-items">
                <Carousel itemLength={breakGlassActionPendingSignature.length}>
                  {breakGlassActionPendingSignature.map((item, index) => (
                    <CouncilPending
                      {...item}
                      key={item.id}
                      numCouncilMembers={breakGlassCouncilMember.length}
                      councilPendingActionsLength={breakGlassActionPendingSignature.length}
                      index={index}
                      handleSignAction={handleSignAction}
                    />
                  ))}
                </Carousel>
              </div>
            </article>
          )}

          {review ? (
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
                          numCouncilMembers={breakGlassCouncilMember.length}
                          councilId={item.breakGlassId}
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
                          numCouncilMembers={breakGlassCouncilMember.length}
                          councilId={item.breakGlassId}
                        />
                      ))
                    : councilEmptyContainer}
                </>
              ) : null}

              <Pagination
                itemsCount={
                  isReviewPage ? pastBreakGlassCouncilAction.length : breakGlassActionPendingAllSignature.length
                }
                listName={BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME}
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

                <BreakGlassCouncilForm councilMemberMaxLength={councilMemberMaxLength} action={chosenDdItem?.value} />
              </AvaliableActions>

              <MyCouncilActions
                myPastCouncilAction={paginatedMyPastCouncilActions}
                myPastCouncilActionLength={myPastBreakGlassCouncilAction.length}
                actionPendingSignature={paginatedBreakGlassActionPendingMySignature}
                actionPendingSignatureLength={breakGlassActionPendingMySignature.length}
                numCouncilMembers={breakGlassCouncilMember.length}
                activeActionTab={activeActionTab}
                setActiveActionTab={setActiveActionTab}
                tabsList={councilTabsList}
                handleDropAction={handleDropAction}
                listNameMyPastActions={BREAK_GLASS_MY_PAST_COUNCIL_ACTIONS_LIST_NAME}
                listNameMyOngoingActions={BREAK_GLASS_MY_ONGOING_ACTIONS_LIST_NAME}
                pageType="breakGlassCouncil"
              />
            </>
          )}
        </div>

        <div className="right-block">
          {!review && (
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
      </BreakGlassCouncilStyled>
      <PopupContainer onClick={closePopup} show={isUpdateCouncilMemberInfo}>
        <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council">
          <FormUpdateCouncilMemberView councilMemberMaxLength={councilMemberMaxLength} />
        </PopupContainerWrapper>
      </PopupContainer>
    </Page>
  )
}
