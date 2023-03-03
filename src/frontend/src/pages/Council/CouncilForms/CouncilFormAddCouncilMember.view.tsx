import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { CouncilMaxLength } from 'utils/TypesAndInterfaces/Council'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

// action
import { addCouncilMember } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'
import { InputStatusType } from 'app/App.components/Input/Input.constants'

export const CouncilFormAddCouncilMember = (maxLength: CouncilMaxLength) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    newMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const { newMemberAddress, newMemberName, newMemberWebsite, newMemberImage } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(addCouncilMember(newMemberAddress, newMemberName, newMemberWebsite, newMemberImage))
      setForm({
        newMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setFormInputStatus({
        newMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
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

  const newMemberAddressProps = {
    name: 'newMemberAddress',
    value: newMemberAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const newMemberAddressSettings = {
    inputStatus: formInputStatus.newMemberAddress,
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
      <h1 className="form-h1">Add Council Member</h1>
      <p>Please enter valid function parameters for adding a council member</p>
      <div className="form-grid">
        <div>
          <label>Council Member Address</label>
          <Input inputProps={newMemberAddressProps} settings={newMemberAddressSettings} />
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
        <NewButton kind={BUTTON_PRIMARY} type={SUBMIT}>
          <Icon id="plus" />
          Add Council Member
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
