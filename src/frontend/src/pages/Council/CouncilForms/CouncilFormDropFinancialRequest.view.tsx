import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// const
import { distinctRequestsByExecuting } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { ACTION_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'

// action
import { dropFinancialRequest } from '../Council.actions'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

export const CouncilFormDropFinancialRequest = () => {
  const dispatch = useDispatch()
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { financialRequestLedger } = governanceStorage
  const { ongoing } = distinctRequestsByExecuting(financialRequestLedger || [])

  const dropDownItems = useMemo(
    () =>
      ongoing.map((item) => ({
        content: (
          <div className="dropdownItem">
            {item.request_type} - {item.request_purpose}
          </div>
        ),
        id: item.id,
      })),
    [ongoing],
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

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

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
          <NewButton kind={ACTION_PRIMARY} type={SUBMIT}>
            <Icon id="navigation-menu_close" />
            Drop Financial Request
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
