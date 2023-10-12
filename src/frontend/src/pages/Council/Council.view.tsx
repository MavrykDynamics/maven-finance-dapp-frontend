import { useState, useMemo, useEffect, useCallback } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

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
  MavrykCounsilDdForms,
  MavrykCounsilPageTitles,
  BgCounsilDdForms,
  BgCounsilPageTitles,
  COUNCIL_FORMS_NAMES_MAPPER,
} from './helpers/council.consts'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'
import {
  DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION,
  DROP_MAVRYK_COUNCIL_REQUEST_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'

// types
import { CouncilActionType, CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'
import { CouncilTabsType } from 'providers/CouncilProvider/helpers/council.types'
import {
  SlidingTabButtonType,
  SlidingTabButtons,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// utils
import { dropBreakGlassCouncilAction } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { dropMavrykCouncilAction } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'

// view
import { DropDown, DDItemId, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import { CouncilForms } from './CouncilForms/CouncilForms.controller'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'
import { CouncilStyled, AvaliableActions, CounsilPageWrapper } from './Council.style'
import { CounsilActionsToSignOld } from './components/CounsilActionsToSignOld'
import { UpdateUserCouncilProfileInfoPopup } from './components/popups/UpdateUserCouncilProfileInfoPopup'
import { CounsilSidebar } from './components/CounsilSidebar'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { H2SimpleTitle, H2Title } from 'styles/generalStyledComponents/Titles.style'
import { CouncilAction } from './components/CouncilAction/CouncilAction'
import { CouncilActionsToSign } from './components/CouncilActionsToSign/CouncilActionsToSign'

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
    contractAddresses: { councilAddress, breakGlassAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress, isBreakGlassCouncil, isMavrykCouncil, isLoading: isUserLoading } = useUserContext()

  const isUserCouncil = isBreakGlassCounsil ? isBreakGlassCouncil : isMavrykCouncil

  const { pagePathname, dropDownItems, titles } = useMemo(() => {
    return {
      titles: isBreakGlassCounsil ? BgCounsilPageTitles : MavrykCounsilPageTitles,
      pagePathname: isBreakGlassCounsil ? '/break-glass-council' : '/mavryk-council',
      dropDownItems: Object.values(isBreakGlassCounsil ? BgCounsilDdForms : MavrykCounsilDdForms)
        // TODO: remove when those 3 actions will be working
        .filter(
          (formId) =>
            !['UNPAUSE_ALL_ENTRYPOINTS', 'SET_SELECTED_CONTRACTS_ADMIN', 'REMOVE_BREAK_GLASS_CONTROLL'].includes(
              formId,
            ),
        )
        .map<ActionsDDItemType>((formId, index) => ({
          content: <DropdownTruncateOption text={COUNCIL_FORMS_NAMES_MAPPER[formId]} />,
          value: formId,
          id: index,
        })),
    }
  }, [isBreakGlassCounsil])

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
    const isMyPendingTab = selectedTab === MY_PENDING_COUNSIL_TAB
    const isMyPastTab = selectedTab === MY_PAST_COUNSIL_TAB
    const isAllPendingTab = selectedTab === ALL_PENDING_COUNSIL_TAB
    const isAllPastTab = selectedTab === ALL_PAST_COUNSIL_TAB

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
  // TODO: uncomment to return council validation
  // useEffect(() => {
  //   if (isMyActionsTabs && !isUserLoading && (!userAddress || !isUserCouncil))
  //     history.replace(`${pagePathname}/${ALL_PAST_COUNSIL_TAB}`)
  // }, [userAddress, isUserCouncil, isUserLoading, isMyActionsTabs])

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

  // drop action
  const dropActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: isBreakGlassCounsil ? DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION : DROP_MAVRYK_COUNCIL_REQUEST_ACTION,
      actionFn: async (actionId: number) => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress || !breakGlassAddress) {
          bug('Wrong counsil address')
          return null
        }

        if (isBreakGlassCounsil) {
          return await dropBreakGlassCouncilAction(actionId, breakGlassAddress)
        } else {
          return await dropMavrykCouncilAction(actionId, councilAddress)
        }
      },
    }),
    [councilAddress, breakGlassAddress, isBreakGlassCounsil, userAddress],
  )

  const { actionWithArgs: handleDropAction } = useContractAction(dropActionProps)

  return (
    <CounsilPageWrapper>
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
              <CounsilActionsToSignOld
                isBreakGlassAction={isBreakGlassCounsil}
                actionstoSign={notMyPendingActions}
                actionsMapper={actionsMapper}
                members={members}
              />

              {/* <CouncilActionsToSign
                isBreakGlassCounsil={isBreakGlassCouncil}
                // TODO: actionstoSign={notMyPendingActions}
                actionstoSign={[...myPendingActions, ...notMyPendingActions]}
                actionsMapper={actionsMapper}
              /> */}
            </>
          ) : null}

          {isMyActionsTabs ? (
            <>
              <AvaliableActions>
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
                    isBreakGlassCounsil={isBreakGlassCounsil}
                    handleDropAction={handleDropAction}
                    councilAction={councilAction}
                    isMyActionsTabs={isMyActionsTabs}
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

      <UpdateUserCouncilProfileInfoPopup
        show={isUpdateCouncilMemberInfo}
        closePopup={closePopup}
        isBreakGlassCounsil={isBreakGlassCounsil}
        memberProfile={members.find((item) => item.memberAddress === userAddress)}
      />
    </CounsilPageWrapper>
  )
}
