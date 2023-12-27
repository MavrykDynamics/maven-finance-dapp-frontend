import React, { useMemo, useState } from 'react'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from '../../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// types
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// helpers
import { addCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// consts
import { BgCouncilDdForms } from '../../helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../../app/App.components/Button/Button.constants'
import { ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

const INIT_FORM = {
  newMemberAddress: '',
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newMemberAddress: INPUT_STATUS_DEFAULT,
  newMemberWebsite: INPUT_STATUS_DEFAULT,
  newMemberName: INPUT_STATUS_DEFAULT,
  newMemberImage: INPUT_STATUS_DEFAULT,
}

export function BgCouncilFormAddCouncilMember({
  maxLength,
  breakGlassCouncilMembers,
}: {
  maxLength: CouncilMaxLength
  breakGlassCouncilMembers: CouncilContext['breakGlassCouncilMembers']
}) {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newMemberAddress, newMemberWebsite, newMemberName, newMemberImage } = form

  // add bg council member action
  const addBgCouncilActionContractActionProps: HookContractActionArgs = useMemo(
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

        if (breakGlassCouncilMembers.find(({ memberAddress }) => memberAddress === newMemberAddress)) {
          bug('User is already council member')
          return null
        }

        return await addCouncilMember(
          breakGlassAddress,
          newMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        )
      },
    }),
    [
      breakGlassAddress,
      newMemberAddress,
      breakGlassCouncilMembers,
      newMemberImage,
      newMemberName,
      newMemberWebsite,
      userAddress,
    ],
  )

  const { action: handleAddCouncilMember } = useContractAction(addBgCouncilActionContractActionProps)

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

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const {
    memberAddressProps,
    memberAddressSettings,
    newMemberNameProps,
    newMemberNameSettings,
    newMemberWebsiteProps,
    newMemberWebsiteSettings,
  } = useMemo(() => {
    const validateLenght = validateFormField(setFormInputStatus)
    const validateAddress = validateFormAddress(setFormInputStatus)

    const memberAddressProps = {
      name: 'newMemberAddress',
      value: newMemberAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateAddress(e)
      },
      required: true,
    }

    const newMemberNameProps = {
      name: 'newMemberName',
      value: newMemberName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateLenght(e, maxLength.councilMemberNameMaxLength)
      },
      required: true,
    }

    const newMemberWebsiteProps = {
      name: 'newMemberWebsite',
      value: newMemberWebsite,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateLenght(e, maxLength.councilMemberWebsiteMaxLength)
      },
      required: true,
    }

    return {
      memberAddressProps,
      memberAddressSettings: {
        inputStatus: formInputStatus.memberAddress,
      },
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
    maxLength.councilMemberNameMaxLength,
    maxLength.councilMemberWebsiteMaxLength,
    formInputStatus.memberAddress,
    formInputStatus.newMemberName,
    formInputStatus.newMemberWebsite,
    newMemberAddress,
    newMemberName,
    newMemberWebsite,
  ])

  return (
    <CouncilFormStyled formName={BgCouncilDdForms.BG_ADD_COUNCIL_MEMBER}>
      <a
        className="info-link"
        href="https://mavryk.finance/litepaper#break-glass-council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Add Council Member</H2Title>
        <div className="descr">Please enter valid function parameters for adding a council member</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="member-address">
          <label>Council Member Address</label>
          <Input inputProps={memberAddressProps} settings={memberAddressSettings} />
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

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="plus" />
            Add Council Member
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
