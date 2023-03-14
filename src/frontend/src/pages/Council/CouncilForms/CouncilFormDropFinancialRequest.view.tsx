import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// const
import { distinctRequestsByExecuting } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { BUTTON_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'

// action
import { dropFinancialRequest } from '../Council.actions'
import { getFinancialRequestStorage } from 'pages/FinacialRequests/FiancialRequest.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// style
import { CouncilFormStyled } from './CouncilForm.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

export const CouncilFormDropFinancialRequest = () => {
  const dispatch = useDispatch()
  const { financialRequests, isLoaded: isFinancialRequestsLoaded } = useSelector(
    (state: State) => state.financialRequest,
  )

  useDataLoader(async () => {
    try {
      if (!isFinancialRequestsLoaded) {
        await dispatch(getFinancialRequestStorage())
      }
    } catch (e) {}
  }, [])

  const dropDownItems = useMemo(
    () =>
      distinctRequestsByExecuting(financialRequests).ongoing.map((item) => ({
        content: (
          <div className="truncated-text">
            {item.type} {item.purpose}
          </div>
        ),
        id: item.id,
      })),
    [financialRequests],
  )

  type DropDownItemType = typeof dropDownItems[0]
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
          <NewButton kind={BUTTON_PRIMARY} type={SUBMIT}>
            <Icon id="navigation-menu_close" />
            Drop Financial Request
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
