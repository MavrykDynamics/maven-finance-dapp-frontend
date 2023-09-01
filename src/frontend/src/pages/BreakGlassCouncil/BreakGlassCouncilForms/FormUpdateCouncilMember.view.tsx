import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'
import { validateFormField } from 'utils/validatorFunctions'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { updateCouncilMember } from 'providers/BreakGlassCouncilProvider/actions/breakGlassCouncil.actions'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import { UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/BreakGlassCouncilProvider/helpers/breakGlassCouncil.consts'

const INIT_FORM = {
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

type Props = {
  maxLength: CouncilMaxLength
  callback: () => void
}

export function FormUpdateCouncilMemberView({ maxLength, callback }: Props) {
  const { breakGlassCouncilMembers } = useSelector((state: State) => state.council)
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const myInfo = breakGlassCouncilMembers.find((item) => item.userId === userAddress)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newMemberWebsite: '',
    newMemberName: '',
    newMemberImage: '',
  })

  const { newMemberWebsite, newMemberName, newMemberImage } = form

  // update bg council action
  const updateCouncilMemberAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!breakGlassAddress) {
      bug('Wrong breakGlass address')
      return null
    }

    return await updateCouncilMember(breakGlassAddress, newMemberName, newMemberWebsite, newMemberImage, callback)
  }, [userAddress, breakGlassAddress, newMemberName, newMemberWebsite, newMemberImage, callback, bug])

  const updateBgCouncilContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
      actionFn: updateCouncilMemberAction,
    }),
    [updateCouncilMemberAction],
  )

  const { action: handleUpdateCouncilMember } = useContractAction(updateBgCouncilContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleUpdateCouncilMember()

      setForm(INIT_FORM)
      setFormInputStatus({
        newMemberWebsite: '',
        newMemberName: '',
        newMemberImage: '',
      })
    } catch (error) {
      console.error('FormSetSingleContractAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)

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

  useEffect(() => {
    if (myInfo) {
      setForm({
        newMemberName: myInfo.name,
        newMemberWebsite: myInfo.website,
        newMemberImage: myInfo.image,
      })

      setFormInputStatus({
        newMemberName: 'success',
        newMemberWebsite: 'success',
        newMemberImage: 'success',
      })
    }
  }, [myInfo])

  return (
    <FormStyled className="without-divider">
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <h1>Update Council Member Info</h1>
      <p>Please enter valid function parameters for adding council member info</p>

      <form onSubmit={handleSubmit}>
        <div className="form-fields in-two-columns">
          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Address</label>
            <div className="address">{getShortTzAddress({ tzAddress: userAddress ?? '' })}</div>
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
            <Icon id="upload" />
            Update Council Member
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}
