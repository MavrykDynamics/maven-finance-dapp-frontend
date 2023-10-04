import React, { useState, useEffect, useMemo } from 'react'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { CouncilFormHeaderStyled, CouncilFormStyled } from './BreakGlassCouncilForm.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { validateFormField } from 'utils/validatorFunctions'
import { updateBgCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'

// types
import { CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { UPDATE_COUNCIL_MEMBER } from '../helpers/council.consts'
import { SUCCESS_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

const INIT_FORM = {
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newMemberWebsite: INPUT_STATUS_DEFAULT,
  newMemberName: INPUT_STATUS_DEFAULT,
  newMemberImage: INPUT_STATUS_DEFAULT,
}

type Props = {
  councilMaxLengths: CouncilMaxLength
  memberProfile?: CouncilMembersType[number]
  callback: () => void
}

export function FormUpdateCouncilMemberView({ councilMaxLengths, callback, memberProfile }: Props) {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  useEffect(() => {
    if (memberProfile) {
      setForm({
        newMemberName: memberProfile.name,
        newMemberWebsite: memberProfile.website,
        newMemberImage: memberProfile.image,
      })

      setFormInputStatus({
        newMemberName: INPUT_STATUS_DEFAULT,
        newMemberWebsite: INPUT_STATUS_DEFAULT,
        newMemberImage: INPUT_STATUS_DEFAULT,
      })
    }
  }, [memberProfile])

  const { newMemberWebsite, newMemberName, newMemberImage } = form

  // update bg council action
  const updateBgCouncilContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await updateBgCouncilMember(breakGlassAddress, newMemberName, newMemberWebsite, newMemberImage, callback)
      },
    }),
    [breakGlassAddress, callback, newMemberImage, newMemberName, newMemberWebsite, userAddress],
  )

  const { action: handleUpdateCouncilMember } = useContractAction(updateBgCouncilContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleUpdateCouncilMember()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('FormSetSingleContractAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const { newMemberNameProps, newMemberNameSettings, newMemberWebsiteProps, newMemberWebsiteSettings } = useMemo(() => {
    const validateText = validateFormField(setFormInputStatus)

    const newMemberNameProps = {
      name: 'newMemberName',
      value: newMemberName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateText(e, councilMaxLengths.councilMemberNameMaxLength)
      },
      required: true,
    }

    const newMemberWebsiteProps = {
      name: 'newMemberWebsite',
      value: newMemberWebsite,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateText(e, councilMaxLengths.councilMemberWebsiteMaxLength)
      },
      required: true,
    }

    return {
      newMemberNameProps,
      newMemberNameSettings: {
        inputStatus: formInputStatus.newMemberName,
      },
      newMemberWebsiteProps,
      newMemberWebsiteSettings: {
        inputStatus: formInputStatus.newMemberWebsite,
      },
    }
  }, [
    councilMaxLengths.councilMemberNameMaxLength,
    councilMaxLengths.councilMemberWebsiteMaxLength,
    formInputStatus.newMemberName,
    formInputStatus.newMemberWebsite,
    newMemberName,
    newMemberWebsite,
  ])

  return (
    <CouncilFormStyled className="without-divider" formName={UPDATE_COUNCIL_MEMBER}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Update Council Member Info</H2Title>
        <div className="descr">Please enter valid function parameters for adding council member info</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="member-address">
          <label>Council Member Address</label>
          <TzAddress tzAddress={userAddress} className="userAddress" type={SUCCESS_TZ_ADDRESS_COLOR} />
        </div>

        <div className="member-name">
          <label>Council Member Name</label>
          <Input inputProps={newMemberNameProps} settings={newMemberNameSettings} />
        </div>

        <div className="member-url">
          <label>Council Member Website URL</label>
          <Input inputProps={newMemberWebsiteProps} settings={newMemberWebsiteSettings} />
        </div>

        <div className="member-image">
          <label>Upload Profile Pic</label>
          <IPFSUploader
            typeFile="image"
            imageIpfsUrl={newMemberImage}
            className="form-ipfs"
            setIpfsImageUrl={(e: string) => {
              setForm({ ...form, newMemberImage: e })
              setFormInputStatus({
                ...formInputStatus,
                newMemberImage: Boolean(e) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
              })
            }}
          />
        </div>

        <div className="submit-form right">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="upload" />
            Update Council Member
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
