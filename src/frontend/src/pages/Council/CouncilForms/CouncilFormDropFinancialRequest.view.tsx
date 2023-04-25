import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// const
import { distinctRequestsByExecuting } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'

// action
import { dropFinancialRequest } from '../Council.actions'
import { getFinancialRequestStorage } from 'pages/FinacialRequests/FinancialRequest.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// style
import { CouncilFormStyled } from './CouncilForm.style'

export const CouncilFormDropFinancialRequest = () => {
  const dispatch = useDispatch()
  const {
    financialRequestMapper,
    financialRequestsIds,
    isLoaded: isFinancialRequestsLoaded,
  } = useSelector((state: State) => state.financialRequest)

  useDataLoader(async (isDepsChanged) => {
    try {
      if (!isFinancialRequestsLoaded || isDepsChanged) {
        await dispatch(getFinancialRequestStorage())
      }
    } catch (e) {}
  }, [])

  const dropDownItems = useMemo(
    () =>
      distinctRequestsByExecuting(financialRequestsIds, financialRequestMapper).ongoing.map((frId) => {
        const fr = financialRequestMapper[frId]
        return {
          content: <DropdownTruncateOption text={`${fr.type} ${fr.purpose}`} />,
          id: frId,
        }
      }),
    [financialRequestMapper, financialRequestsIds],
  )

  type DropDownItemType = (typeof dropDownItems)[number]
  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const financialReqID = chosenDdItem?.id
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

  return (
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
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT}>
            <Icon id="navigation-menu_close" />
            Drop Financial Request
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
