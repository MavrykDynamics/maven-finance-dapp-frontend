import { useState, useMemo, useEffect } from 'react'
import { useDispatch } from 'react-redux'

// const
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_FIN_REQUESTS_ACTIVE_SUBS,
  FIN_REQUESTS_DATA,
  ONGOING_FIN_REQUESTS_SUB,
} from 'providers/FinancialRequestsProvider/helpers/financialRequests.consts'
import { SPINNER_LOADER_MEDIUM } from 'app/App.components/Loader/loader.const'

// view
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'

// action
import { dropFinancialRequest } from '../Council.actions'

// style
import { CouncilFormDropFinancialRequestLoaderWrapper, CouncilFormStyled } from './CouncilForm.style'
import { useFinancialRequestsContext } from 'providers/FinancialRequestsProvider/financialRequests.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'

export const CouncilFormDropFinancialRequest = () => {
  const dispatch = useDispatch()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { ongoingFinRequestsIds, financialRequestsMapper, isLoading, changeFinancialRequestsSubscriptionList } =
    useFinancialRequestsContext()

  useEffect(() => {
    changeFinancialRequestsSubscriptionList({
      [FIN_REQUESTS_DATA]: ONGOING_FIN_REQUESTS_SUB,
    })

    return () => {
      changeFinancialRequestsSubscriptionList(DEFAULT_FIN_REQUESTS_ACTIVE_SUBS)
    }
  }, [])

  const dropDownItems = useMemo(
    () =>
      ongoingFinRequestsIds.map((frId) => {
        const fr = financialRequestsMapper[frId]
        return {
          content: <DropdownTruncateOption text={`${fr.type} ${fr.purpose}`} />,
          id: frId,
        }
      }),
    [ongoingFinRequestsIds, financialRequestsMapper],
  )

  type DropDownItemType = (typeof dropDownItems)[number]
  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const financialReqID = Number(chosenDdItem?.id)
      if (!financialReqID) return

      await dispatch(dropFinancialRequest(financialReqID))
      setChosenDdItem(undefined)
    } catch (error) {
      console.error(error)
    }
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  return isLoading ? (
    <CouncilFormDropFinancialRequestLoaderWrapper>
      <SpinnerCircleLoaderStyled className={SPINNER_LOADER_MEDIUM} />
    </CouncilFormDropFinancialRequestLoaderWrapper>
  ) : (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Drop Financial Request</h1>
      <p>Please enter valid function parameters for dropping a financial request</p>
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
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="navigation-menu_close" />
            Drop Financial Request
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
