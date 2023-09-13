import { useState, useEffect, useMemo } from 'react'

// consts
import { UPDATE_COUNSIL_MEMBER_INFO_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  type InputStatusType,
} from '../../../app/App.components/Input/Input.constants'

// types
import { CouncilMembersType } from 'providers/CouncilProvider/council.provider.types'
import type { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// helpers
import { validateFormField } from 'utils/validatorFunctions'
import { updateCouncilMemberInfo } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { CouncilFormStyled } from './CouncilForm.style'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

type Props = {
  councilMaxLengths: CouncilMaxLength
  memberProfile?: CouncilMembersType[number]
  callback: () => void
}

const INIT_FORM = {
  newMemberName: '',
  newMemberWebsite: '',
  newMemberImage: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newMemberName: INPUT_STATUS_DEFAULT,
  newMemberWebsite: INPUT_STATUS_DEFAULT,
  newMemberImage: INPUT_STATUS_DEFAULT,
}

export const CouncilFormUpdateCouncilMemberInfo = ({ councilMaxLengths, callback, memberProfile }: Props) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

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

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newMemberName, newMemberWebsite, newMemberImage } = form

  // update council member council action
  const updateCouncilMemberContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_COUNSIL_MEMBER_INFO_ACTION,
      dappActionCallback: callback,
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
    [newMemberName, newMemberWebsite, newMemberImage, callback, userAddress, councilAddress],
  )

  const { action: handleAddCouncilMember } = useContractAction(updateCouncilMemberContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleAddCouncilMember()
    } catch (error) {
      console.error('CouncilFormUpdateCouncilMemberInfo', error)
    }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)

  return (
    <CouncilFormStyled className="update-council-member-info" onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Update Council Member Info</h1>
      <p>Please enter valid function parameters for adding council member info</p>
      <div className="form-grid">
        <div>
          <label>Council Member Address</label>
          <div className="form-grid-adress">
            <TzAddress tzAddress={userAddress} hasIcon={false} />
          </div>
        </div>

        <div>
          <label>Update Name</label>
          <Input inputProps={newMemberNameProps} settings={newMemberNameSettings} />
        </div>

        <div>
          <label>Updated Website URL</label>
          <Input inputProps={newMemberWebsiteProps} settings={newMemberWebsiteSettings} />
        </div>
      </div>
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
        title={'Upload Profile Pic'}
      />
      <div className="btn-group">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
          <Icon id="upload" />
          Update Council Member Info
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
