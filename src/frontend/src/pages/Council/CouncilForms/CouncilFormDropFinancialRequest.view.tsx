import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// const
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'
import { distinctRequestsByExecuting } from 'pages/FinacialRequests/FinancialRequests.helpers'

// view
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'

// action
import { dropFinancialRequest } from '../Council.actions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { getFinancialRequestStorage } from 'pages/FinacialRequests/FiancialRequest.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormDropFinancialRequest = () => {
  const dispatch = useDispatch()
  const { financialRequests, isLoaded: isFinancialRequestsLoaded } = useSelector(
    (state: State) => state.financialRequest,
  )

  const { isLoading } = useDataLoader(async () => {
    try {
      if (!isFinancialRequestsLoaded) {
        await dispatch(getFinancialRequestStorage())
      }
    } catch (e) {}
  }, [])

  const { ongoing } = distinctRequestsByExecuting(financialRequests || [])

  const itemsForDropDown = useMemo(
    () =>
      ongoing?.length
        ? ongoing.map((item, i: number) => {
            return {
              text: `${item.request_type} ${item.request_purpose}`,
              value: String(item.id),
            }
          })
        : [],
    [ongoing],
  )

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()

  const [form, setForm] = useState({
    financialReqID: '',
  })

  const { financialReqID } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (!financialReqID) {
        dispatch(showToaster(ERROR, 'Please enter valid function parameter', 'Choose Financial Request to drop'))
        return
      }

      await dispatch(dropFinancialRequest(+financialReqID))
      setForm({
        financialReqID: '',
      })

      setChosenDdItem(itemsForDropDown[0])
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelect = (item: DropdownItemType) => {
    setForm((prev) => {
      return { ...prev, financialReqID: item.value }
    })
  }

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
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
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            clickOnItem={(e) => handleOnClickDropdownItem(e)}
          />
        </div>
        <div className="button-aligment">
          <Button
            text="Drop Financial Request"
            className="plus-btn fill"
            kind={'actionPrimary'}
            icon="close-stroke"
            type="submit"
          />
        </div>
      </div>
    </CouncilFormStyled>
  )
}
