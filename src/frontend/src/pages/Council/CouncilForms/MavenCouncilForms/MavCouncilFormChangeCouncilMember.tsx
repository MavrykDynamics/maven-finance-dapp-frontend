import { useMemo, useState } from 'react' // consts
import { MavenCouncilDdForms } from '../../helpers/council.consts'
import { ADD_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import type { InputStatusType } from '../../../../app/App.components/Input/Input.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../../app/App.components/Input/Input.constants' // types
import type { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import type { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types' // helpers
import { getShortTzAddress } from '../../../../utils/tzAdress'
import { changeMavenCouncilMember } from 'providers/CouncilProvider/actions/mavenCouncil.actions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions' // view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'
import { IPFSUploader } from '../../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown' // hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

const INITIAL_FORM = {
  newCouncilMemberAddress: '',
  newMemberName: '',
  newMemberWebsite: '',
  newMemberImage: '',
}

const INITIAL_FORM_VALIDATION: Record<string, InputStatusType> = {
  newCouncilMemberAddress: INPUT_STATUS_DEFAULT,
  newMemberName: INPUT_STATUS_DEFAULT,
  newMemberWebsite: INPUT_STATUS_DEFAULT,
  newMemberImage: INPUT_STATUS_DEFAULT,
}

type DdItemType = {
  content: React.ReactNode
  tzAddress: string
  id: number
}

export const MavCouncilFormChangeCouncilMember = ({
  councilMaxLengths,
  councilMembers,
}: {
  councilMaxLengths: CouncilMaxLength
  councilMembers: CouncilContext['councilMembers']
}) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const dropDownItems = useMemo(
    () =>
      councilMembers.map<DdItemType>((item, index) => ({
        content: (
          <DropdownTruncateOption text={`${item.name} - ${getShortTzAddress({ tzAddress: item.memberAddress })}`} />
        ),
        tzAddress: item.memberAddress,
        id: index,
      })),
    [councilMembers],
  )

  const [chosenDdItem, setChosenDdItem] = useState<DdItemType | undefined>()
  const [form, setForm] = useState(INITIAL_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INITIAL_FORM_VALIDATION)

  const { newCouncilMemberAddress, newMemberName, newMemberWebsite, newMemberImage } = form
  const oldCouncilMemberAddress = chosenDdItem?.tzAddress

  // change council member council action
  const changeCouncilMemberContractActionProps: HookContractActionArgs = useMemo(
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

        if (!oldCouncilMemberAddress) {
          bug('Select member to change')
          return null
        }

        if (councilMembers.find(({ memberAddress }) => memberAddress === newCouncilMemberAddress)) {
          bug('New user is already council member')
          return null
        }

        return await changeMavenCouncilMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
          councilAddress,
        )
      },
    }),
    [
      oldCouncilMemberAddress,
      newCouncilMemberAddress,
      councilMembers,
      newMemberName,
      newMemberWebsite,
      newMemberImage,
      userAddress,
      councilAddress,
    ],
  )

  const { action: handleChangeCouncilMember } = useContractAction(changeCouncilMemberContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleChangeCouncilMember()

      setForm(INITIAL_FORM)
      setFormInputStatus(INITIAL_FORM_VALIDATION)
      setChosenDdItem(undefined)
    } catch (error) {
      console.error('CouncilFormChangeCouncilMember', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (foundItem) setChosenDdItem(foundItem)
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const {
    newCouncilMemberAddressProps,
    newCouncilMemberAddressSettings,
    newMemberNameProps,
    newMemberNameSettings,
    newMemberWebsiteProps,
    newMemberWebsiteSettings,
  } = useMemo(() => {
    const validateLength = validateFormField(setFormInputStatus)
    const validateAddress = validateFormAddress(setFormInputStatus)

    const newCouncilMemberAddressProps = {
      name: 'newCouncilMemberAddress',
      value: newCouncilMemberAddress,
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
        validateLength(e, councilMaxLengths.councilMemberNameMaxLength)
      },
      required: true,
    }

    const newMemberWebsiteProps = {
      name: 'newMemberWebsite',
      value: newMemberWebsite,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateLength(e, councilMaxLengths.councilMemberWebsiteMaxLength)
      },
      required: true,
    }

    return {
      newCouncilMemberAddressProps,
      newCouncilMemberAddressSettings: {
        inputStatus: formInputStatus.newCouncilMemberAddress,
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
    formInputStatus.newCouncilMemberAddress,
    formInputStatus.newMemberName,
    formInputStatus.newMemberWebsite,
    newCouncilMemberAddress,
    newMemberName,
    newMemberWebsite,
  ])

  return (
    <CouncilFormStyled formName={MavenCouncilDdForms.CHANGE_COUNCIL_MEMBER}>
      <a
        className="info-link"
        href="https://docs.mavryk.finance/mavryk-finance/council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Change Council Member</H2Title>
        <div className="descr">Please enter valid function parameters for changing a council member</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="select-council-member">
          <label>Choose Council Member to change</label>
          <DropDown
            placeholder="Choose Member Address"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>
        <div />
        <div className="member-address">
          <label>Council Member Address</label>
          <Input inputProps={newCouncilMemberAddressProps} settings={newCouncilMemberAddressSettings} />
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
            <Icon id="exchange" />
            Change Council Member
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
