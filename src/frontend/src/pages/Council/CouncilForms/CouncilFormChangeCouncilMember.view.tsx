import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import type { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'

// action
import { changeCouncilMember } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

export const CouncilFormChangeCouncilMember = (maxLength: CouncilMaxLength) => {
  const dispatch = useDispatch()
  const { councilMembers } = useSelector((state: State) => state.council)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const dropDownItems = useMemo(
    () =>
      councilMembers.map((item, index) => ({
        content: <DropdownTruncateOption text={`${item.name} - ${getShortTzAddress({ tzAddress: item.userId })}`} />,
        tzAddress: item.userId,
        id: index,
      })),
    [councilMembers],
  )

  type DropDownItemType = (typeof dropDownItems)[0]
  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  const [form, setForm] = useState({
    oldCouncilMemberAddress: '',
    newCouncilMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    oldCouncilMemberAddress: '',
    newCouncilMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const { newCouncilMemberAddress, newMemberName, newMemberWebsite, newMemberImage } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const oldCouncilMemberAddress = chosenDdItem?.tzAddress
      if (!oldCouncilMemberAddress) return

      await dispatch(
        changeCouncilMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        ),
      )
      setForm({
        oldCouncilMemberAddress: '',
        newCouncilMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setFormInputStatus({
        oldCouncilMemberAddress: '',
        newCouncilMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setChosenDdItem(undefined)
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  const newCouncilMemberAddressProps = {
    name: 'newCouncilMemberAddress',
    value: newCouncilMemberAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const newCouncilMemberAddressSettings = {
    inputStatus: formInputStatus.newCouncilMemberAddress,
  }

  const newMemberNameProps = {
    name: 'newMemberName',
    value: newMemberName,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.councilMemberNameMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, maxLength.councilMemberNameMaxLength)
    },
    required: true,
  }

  const newMemberNameSettings = {
    inputStatus: formInputStatus.newMemberName,
  }

  const newMemberWebsiteProps = {
    name: 'newMemberWebsite',
    value: newMemberWebsite,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.councilMemberWebsiteMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, maxLength.councilMemberWebsiteMaxLength)
    },
    required: true,
  }

  const newMemberWebsiteSettings = {
    inputStatus: formInputStatus.newMemberWebsite,
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Change Council Member</h1>
      <p>Please enter valid function parameters for changing a council member</p>
      <div className="form-grid">
        <div>
          <label>Choose Council Member to change</label>
          <DropDown
            placeholder="Choose Member Address"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>
        <div />
        <div>
          <label>Council Member Address</label>
          <Input inputProps={newCouncilMemberAddressProps} settings={newCouncilMemberAddressSettings} />
        </div>
        <div>
          <label>Council Member Name</label>
          <Input inputProps={newMemberNameProps} settings={newMemberNameSettings} />
        </div>
        <div>
          <label>Council Member Website URL</label>
          <Input inputProps={newMemberWebsiteProps} settings={newMemberWebsiteSettings} />
        </div>
      </div>
      <IPFSUploader
        typeFile="image"
        imageIpfsUrl={newMemberImage}
        className="form-ipfs"
        setIpfsImageUrl={(e: string) => {
          setForm({ ...form, newMemberImage: e })
          setFormInputStatus({ ...formInputStatus, newMemberImage: Boolean(e) ? 'success' : 'error' })
        }}
        title={'Upload Profile Pic'}
      />
      <div className="btn-group">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
          <Icon id="exchange" />
          Change Council Member
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
