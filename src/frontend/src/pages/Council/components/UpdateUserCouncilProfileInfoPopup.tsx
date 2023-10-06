import { useState, useEffect, useMemo } from 'react'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { PopupContainer } from 'app/App.components/popup/PopupMain.style'
import { CouncilFormPopupsContent } from 'app/App.components/popup/bases/CouncilPopup.style'
import { CouncilFormStyled, CouncilFormHeaderStyled } from '../CouncilForms/CouncilForm.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import Icon from 'app/App.components/Icon/Icon.view'
import { IPFSUploader } from 'app/App.components/IPFSUploader/IPFSUploader.controller'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'

// utils
import { updateBgCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { updateCouncilMemberInfo } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormField } from 'utils/validatorFunctions'

// consts
import {
  InputStatusType,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  INPUT_STATUS_ERROR,
} from 'app/App.components/Input/Input.constants'
import { UPDATE_USER_COUNCIL_PROFILE_FORM } from '../helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
  UPDATE_COUNSIL_MEMBER_INFO_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'

type PropsType = {
  isBreakGlassCounsil: boolean
  closePopup: () => void
  memberProfile?: CouncilMembersType[number]
  show: boolean
}

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

export const UpdateUserCouncilProfileInfoPopup = ({
  closePopup,
  show,
  isBreakGlassCounsil,
  memberProfile,
}: PropsType) => {
  const {
    maxLengths: { council: councilMaxLengths },
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress, councilAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  // setting member data to inputs
  useEffect(() => {
    if (memberProfile) {
      setForm({
        memberAddress: memberProfile.userId,
        newMemberName: memberProfile.name,
        newMemberWebsite: memberProfile.website,
        newMemberImage: memberProfile.image,
      })

      setFormInputStatus({
        memberAddress: INPUT_STATUS_SUCCESS,
        newMemberName: INPUT_STATUS_SUCCESS,
        newMemberWebsite: INPUT_STATUS_SUCCESS,
        newMemberImage: INPUT_STATUS_SUCCESS,
      })
    }
  }, [memberProfile])

  const { newMemberWebsite, newMemberName, newMemberImage, memberAddress } = form

  // action to update break glass council member
  const updateBgCouncilContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
      dappActionCallback: closePopup,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await updateBgCouncilMember(breakGlassAddress, newMemberName, newMemberWebsite, newMemberImage)
      },
    }),
    [breakGlassAddress, bug, closePopup, newMemberImage, newMemberName, newMemberWebsite, userAddress],
  )
  const { action: handleUpdateBreakGlassCouncilUserProfile } = useContractAction(updateBgCouncilContractActionProps)

  // action to update mavryk council member
  const updateCouncilMemberContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_COUNSIL_MEMBER_INFO_ACTION,
      dappActionCallback: closePopup,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage, councilAddress)
      },
    }),
    [closePopup, userAddress, councilAddress, newMemberName, newMemberWebsite, newMemberImage, bug],
  )
  const { action: handleUpdateMavrykCouncilUserProfile } = useContractAction(updateCouncilMemberContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (isBreakGlassCounsil) {
        await handleUpdateBreakGlassCouncilUserProfile()
      } else {
        await handleUpdateMavrykCouncilUserProfile()
      }

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('UpdateUserCouncilProfileInfoPopup', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const formHasChange =
    memberProfile &&
    (newMemberName !== memberProfile.name ||
      newMemberWebsite !== memberProfile.website ||
      newMemberImage !== memberProfile.image)

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS) || !formHasChange

  const {
    memberAddressProps,
    memberAddressSettings,
    newMemberNameProps,
    newMemberNameSettings,
    newMemberWebsiteProps,
    newMemberWebsiteSettings,
  } = useMemo(() => {
    const validateText = validateFormField(setFormInputStatus)

    const memberAddressProps = {
      name: 'memberAddress',
      value: memberAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateText(e, councilMaxLengths.councilMemberNameMaxLength)
      },
      disabled: true,
    }

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
    councilMaxLengths.councilMemberNameMaxLength,
    councilMaxLengths.councilMemberWebsiteMaxLength,
    formInputStatus.memberAddress,
    formInputStatus.newMemberName,
    formInputStatus.newMemberWebsite,
    memberAddress,
    newMemberName,
    newMemberWebsite,
  ])

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <CouncilFormPopupsContent onClick={(e) => e.stopPropagation()}>
        <CouncilFormStyled className="without-divider" formName={UPDATE_USER_COUNCIL_PROFILE_FORM}>
          <a
            className="info-link"
            href="https://mavryk.finance/litepaper#mavryk-council"
            target="_blank"
            rel="noreferrer"
          >
            <Icon id="question" />
          </a>

          <CouncilFormHeaderStyled>
            <H2Title>Update Council Member Info</H2Title>
            <div className="descr">Please enter valid function parameters for adding council member info</div>
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
                <Icon id="upload" />
                Update Council Member
              </NewButton>
            </div>
          </form>
        </CouncilFormStyled>
      </CouncilFormPopupsContent>
    </PopupContainer>
  )
}
