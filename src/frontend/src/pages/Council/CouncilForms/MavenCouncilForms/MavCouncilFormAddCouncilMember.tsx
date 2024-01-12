import { useMemo, useState } from 'react'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { IPFSUploader } from '../../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// types
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'

// utils
import { addCouncilMember } from 'providers/CouncilProvider/actions/mavenCouncil.actions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// consts
import { ADD_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { MavenCouncilDdForms } from '../../helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

const INIT_FORM = {
  newMemberAddress: '',
  newMemberName: '',
  newMemberWebsite: '',
  newMemberImage: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newMemberAddress: INPUT_STATUS_DEFAULT,
  newMemberName: INPUT_STATUS_DEFAULT,
  newMemberWebsite: INPUT_STATUS_DEFAULT,
  newMemberImage: INPUT_STATUS_DEFAULT,
}

export const MavCouncilFormAddCouncilMember = ({
  maxLength,
  councilMembers,
}: {
  maxLength: CouncilMaxLength
  councilMembers: CouncilContext['councilMembers']
}) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newMemberAddress, newMemberName, newMemberWebsite, newMemberImage } = form

  // add council member council action
  const addCouncilMemberContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: ADD_COUNCIL_MEMBER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        if (councilMembers.find(({ memberAddress }) => memberAddress === newMemberAddress)) {
          bug('User is already council member')
          return null
        }

        return await addCouncilMember(newMemberAddress, newMemberName, newMemberWebsite, newMemberImage, councilAddress)
      },
    }),
    [newMemberAddress, newMemberName, councilMembers, newMemberWebsite, newMemberImage, userAddress, councilAddress],
  )

  const { action: handleAddCouncilMember } = useContractAction(addCouncilMemberContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleAddCouncilMember()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormAddCouncilMember', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const {
    newMemberAddressProps,
    newMemberAddressSettings,
    newMemberNameProps,
    newMemberNameSettings,
    newMemberWebsiteProps,
    newMemberWebsiteSettings,
  } = useMemo(() => {
    const validateAddress = validateFormAddress(setFormInputStatus)
    const validateLength = validateFormField(setFormInputStatus)

    const newMemberAddressProps = {
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
        validateLength(e, maxLength.councilMemberNameMaxLength)
      },
      required: true,
    }

    const newMemberWebsiteProps = {
      name: 'newMemberWebsite',
      value: newMemberWebsite,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateLength(e, maxLength.councilMemberWebsiteMaxLength)
      },
      required: true,
    }

    return {
      newMemberAddressProps,
      newMemberAddressSettings: {
        inputStatus: formInputStatus.newMemberAddress,
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
    formInputStatus.newMemberAddress,
    formInputStatus.newMemberName,
    formInputStatus.newMemberWebsite,
    maxLength.councilMemberNameMaxLength,
    maxLength.councilMemberWebsiteMaxLength,
    newMemberAddress,
    newMemberName,
    newMemberWebsite,
  ])

  return (
    <CouncilFormStyled formName={MavenCouncilDdForms.ADD_COUNCIL_MEMBER}>
      <a
        className="info-link"
        href="https://docs.mavenfinance.io/maven-finance/council"
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
          <Input inputProps={newMemberAddressProps} settings={newMemberAddressSettings} />
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
