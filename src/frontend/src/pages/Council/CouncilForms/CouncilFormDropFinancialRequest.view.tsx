import { useState, useMemo, useEffect } from 'react'

// const
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_FIN_REQUESTS_ACTIVE_SUBS,
  FIN_REQUESTS_DATA,
  ONGOING_FIN_REQUESTS_SUB,
} from 'providers/FinancialRequestsProvider/helpers/financialRequests.consts'
import { DROP_FIN_REQUEST_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// view
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { CouncilFormStyled } from './CouncilForm.style'

// utils
import { dropFinancialRequest } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'

// hooks
import { useFinancialRequestsContext } from 'providers/FinancialRequestsProvider/financialRequests.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

type DdItemType = {
  content: React.ReactNode
  id: string
}

export const CouncilFormDropFinancialRequest = () => {
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

  useEffect(() => {
    changeFinancialRequestsSubscriptionList({
      [FIN_REQUESTS_DATA]: ONGOING_FIN_REQUESTS_SUB,
    })

    return () => {
      changeFinancialRequestsSubscriptionList(DEFAULT_FIN_REQUESTS_ACTIVE_SUBS)
    }
  }, [])

  const [chosenDdItem, setChosenDdItem] = useState<DdItemType | undefined>()

  const dropDownItems = useMemo(
    () =>
      ongoingFinRequestsIds.map<DdItemType>((frId) => {
        const fr = financialRequestsMapper[frId]
        return {
          content: <DropdownTruncateOption text={`${fr.type} ${fr.purpose}`} />,
          id: frId,
        }
      }),
    [ongoingFinRequestsIds, financialRequestsMapper],
  )

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

  const isButtonDisabled = isActionActive || !chosenDdItem

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Drop Financial Request</h1>
      <p>
        {isFinancialRequestsLoading ? (
          <>
            <div className="loading-label">
              Loading Financial Requests <SpinnerCircleLoaderStyled />
            </div>
          </>
        ) : (
          'Please enter valid function parameters for dropping a financial request'
        )}
      </p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Choose Financial Request to drop</label>
          <DropDown
            placeholder="Choose Financial Request"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>
        <div className="button-aligment">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="navigation-menu_close" />
            Drop Financial Request
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
