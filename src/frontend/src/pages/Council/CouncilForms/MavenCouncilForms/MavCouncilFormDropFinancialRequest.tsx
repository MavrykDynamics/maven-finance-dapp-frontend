import { useEffect, useMemo, useState } from 'react'

// const
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_FIN_REQUESTS_ACTIVE_SUBS,
  FIN_REQUESTS_DATA,
  ONGOING_FIN_REQUESTS_SUB,
} from 'providers/FinancialRequestsProvider/helpers/financialRequests.consts'
import {
  COUNCIL_ACTIONS_PARAMS_MAPPER,
  DROP_FIN_REQUEST_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'
import { BYTES_STRING_TYPE, convertBytes } from 'utils/convertBytes'
import { MavenCouncilDdForms } from '../../helpers/council.consts'
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'

// view
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// utils
import { getRequestStatus } from 'providers/FinancialRequestsProvider/helpers/financialRequests.utils'
import { dropFinancialRequest } from 'providers/CouncilProvider/actions/mavenCouncil.actions'

// hooks
import { useFinancialRequestsContext } from 'providers/FinancialRequestsProvider/financialRequests.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'

type DdItemType = {
  content: React.ReactNode
  id: string
}

export const MavCouncilFormDropFinancialRequest = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const {
    ongoingFinRequestsIds,
    financialRequestsMapper,
    isLoading: isFinancialRequestsLoading,
    changeFinancialRequestsSubscriptionList,
  } = useFinancialRequestsContext()
  const {
    councilActions: { actionsMapper, allPendingActions },
  } = useCouncilContext()

  useEffect(() => {
    changeFinancialRequestsSubscriptionList({
      [FIN_REQUESTS_DATA]: ONGOING_FIN_REQUESTS_SUB,
    })

    return () => {
      changeFinancialRequestsSubscriptionList(DEFAULT_FIN_REQUESTS_ACTIVE_SUBS)
    }
  }, [])

  const [chosenDdItem, setChosenDdItem] = useState<DdItemType | undefined>()

  const dropDownItems = useMemo(() => {
    // map all fin requests that are dropping to exclude them from list "fin requests to drop"
    const droppingFinRequestsMapper = allPendingActions.reduce<Record<string, boolean>>((acc, actionId) => {
      const dropFinReqActionParams =
        actionsMapper[actionId].actionClientId === MavenCouncilDdForms.DROP_FINANCIAL_REQUEST
          ? actionsMapper[actionId].parameters
          : null
      const dropFinReqActionFinReqIdInBytes =
        dropFinReqActionParams?.find(({ name }) => name === COUNCIL_ACTIONS_PARAMS_MAPPER.requestId)?.value ?? null
      const dropFinReqActionFinReqIdInConverted = dropFinReqActionFinReqIdInBytes
        ? convertBytes(dropFinReqActionFinReqIdInBytes, BYTES_STRING_TYPE)
        : null

      if (dropFinReqActionFinReqIdInConverted) acc[dropFinReqActionFinReqIdInConverted] = true
      return acc
    }, {})

    return ongoingFinRequestsIds.reduce<Array<DdItemType>>((acc, frId) => {
      const fr = financialRequestsMapper[frId]
      // show in dd ongoing fin req, that are not in drop process
      if (!droppingFinRequestsMapper[frId] && getRequestStatus(fr) === ProposalStatus.ONGOING) {
        acc.push({
          content: <DropdownTruncateOption text={`${fr.type} ${fr.purpose}`} />,
          id: frId,
        })
      }
      return acc
    }, [])
  }, [ongoingFinRequestsIds, financialRequestsMapper, allPendingActions, actionsMapper])

  // drop financial request council action
  const dropFinReqContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DROP_FIN_REQUEST_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        if (!chosenDdItem) {
          bug('Select financial request to drop')
          return null
        }

        return await dropFinancialRequest(chosenDdItem.id, councilAddress)
      },
    }),
    [chosenDdItem, userAddress, councilAddress],
  )

  const { action: handleDropFinReq } = useContractAction(dropFinReqContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleDropFinReq()

      setChosenDdItem(undefined)
    } catch (error) {
      console.error('CouncilFormDropFinancialRequest', error)
    }
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (foundItem) setChosenDdItem(foundItem)
  }

  const isButtonDisabled = isActionActive || !chosenDdItem || isFinancialRequestsLoading

  return (
    <CouncilFormStyled $formName={MavenCouncilDdForms.DROP_FINANCIAL_REQUEST}>
      <a
        className="info-link"
        href="https://docs.mavenfinance.io/maven-finance/council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Drop Financial Request</H2Title>
        <div className="descr">
          Please enter valid function parameters for dropping a financial request{' '}
          {isFinancialRequestsLoading ? <SpinnerCircleLoaderStyled /> : null}
        </div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="select-contracts">
          <label>Choose Financial Request to drop</label>
          <DropDown
            placeholder="Choose Financial Request"
            activeItem={chosenDdItem}
            items={dropDownItems}
            disabled={isFinancialRequestsLoading}
            clickItem={handleClickDropdownItem}
          />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="navigation-menu_close" />
            Drop Financial Request
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
