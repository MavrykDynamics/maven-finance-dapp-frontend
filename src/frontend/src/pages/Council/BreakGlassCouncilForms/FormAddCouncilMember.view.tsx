import React, { useMemo, useState } from 'react'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { FormStyled } from './BreakGlassCouncilForm.style'

// types
import { INPUT_STATUS_DEFAULT, InputStatusType } from 'app/App.components/Input/Input.constants'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// helpers
import { addCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// consts
import { ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

const INIT_FORM = {
  memberAddress: '',
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  memberAddress: INPUT_STATUS_DEFAULT,
  newMemberWebsite: INPUT_STATUS_DEFAULT,
  newMemberName: INPUT_STATUS_DEFAULT,
  newMemberImage: INPUT_STATUS_DEFAULT,
}

export function FormAddCouncilMemberView({ councilMaxLengths }: { councilMaxLengths: CouncilMaxLength }) {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { memberAddress, newMemberWebsite, newMemberName, newMemberImage } = form

  // add bg council member action
  const signActionContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await addCouncilMember(breakGlassAddress, memberAddress, newMemberName, newMemberWebsite, newMemberImage)
      },
    }),
    [breakGlassAddress, memberAddress, newMemberImage, newMemberName, newMemberWebsite, userAddress],
  )

  const { action: handleAddCouncilMember } = useContractAction(signActionContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleAddCouncilMember()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('FormAddCouncilMemberView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const memberAddressProps = {
    name: 'memberAddress',
    value: memberAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const memberAddressSettings = {
    inputStatus: formInputStatus.memberAddress,
  }

  const newMemberNameProps = {
    name: 'newMemberName',
    value: newMemberName,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMaxLengths.councilMemberNameMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, councilMaxLengths.councilMemberNameMaxLength)
    },
    required: true,
  }

  const newMemberNameSettings = {
    inputStatus: formInputStatus.newMemberName,
  }

  const newMemberWebsiteProps = {
    name: 'newMemberWebsite',
    value: newMemberWebsite,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMaxLengths.councilMemberWebsiteMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, councilMaxLengths.councilMemberWebsiteMaxLength)
    },
    required: true,
  }

  const newMemberWebsiteSettings = {
    inputStatus: formInputStatus.newMemberWebsite,
  }

  return (
    <FormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <h1>Add Council Member</h1>
      <p>Please enter valid function parameters for adding a council member</p>

      <form onSubmit={handleSubmit}>
        <div className="form-fields in-two-columns">
          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Address</label>
            <Input inputProps={memberAddressProps} settings={memberAddressSettings} />
          </div>

          <div className="input-size-tertiary">
            <label>Council Member Name</label>
            <Input inputProps={newMemberNameProps} settings={newMemberNameSettings} />
          </div>

          <div className="input-size-secondary margin-bottom-20">
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

        <div className="align-to-right">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="plus" />
            Add Council Member
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}
