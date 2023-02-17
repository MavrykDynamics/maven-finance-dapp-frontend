import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import type { CouncilMaxLength } from '../../../utils/TypesAndInterfaces/Council'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { ACTION_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

// const
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'

// action
import { changeCouncilMember } from '../Council.actions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

export const CouncilFormChangeCouncilMember = (maxLength: CouncilMaxLength) => {
  const dispatch = useDispatch()
  const { councilMembers } = useSelector((state: State) => state.council)

  const itemsForDropDown = useMemo(
    () =>
      councilMembers?.length
        ? councilMembers.map((item) => {
            return {
              text: getShortTzAddress({ tzAddress: item.userId }),
              value: item.userId,
            }
          })
        : [],
    [councilMembers],
  )

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()
  const [uploadKey, setUploadKey] = useState(1)
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

  const { oldCouncilMemberAddress, newCouncilMemberAddress, newMemberName, newMemberWebsite, newMemberImage } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (!oldCouncilMemberAddress) {
        dispatch(showToaster(ERROR, 'Please enter valid function parameter', 'Choose Council Member to change'))
        return
      }

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
      setChosenDdItem(itemsForDropDown[0])
      setUploadKey(uploadKey + 1)
    } catch (error) {
      console.error(error)
      setUploadKey(uploadKey + 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const handleSelect = (item: DropdownItemType) => {
    setForm((prev) => {
      return { ...prev, oldCouncilMemberAddress: item.value }
    })
  }

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
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
            placeholder="Chose Member Address"
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            clickOnItem={(e) => handleOnClickDropdownItem(e)}
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
        key={uploadKey}
        imageIpfsUrl={newMemberImage}
        className="form-ipfs"
        setIpfsImageUrl={(e: string) => {
          setForm({ ...form, newMemberImage: e })
          setFormInputStatus({ ...formInputStatus, newMemberImage: Boolean(e) ? 'success' : 'error' })
        }}
        title={'Upload Profile Pic'}
      />
      <div className="btn-group">
        <NewButton kind={ACTION_PRIMARY} type={SUBMIT}>
          <Icon id="exchange" />
          Change Council Member
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
