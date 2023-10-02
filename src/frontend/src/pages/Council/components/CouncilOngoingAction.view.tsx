import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// utils
import { parseDate } from 'utils/time'
import { scrollToFullView } from 'utils/scrollToFullView'
import { convertBytesAddressToAddress } from 'app/App.helpers'
import { getSeparateCamelCase } from '../../../utils/parse'
import { dropBreakGlass } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { dropRequest } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'

// consts
import { bytesToText, BytesType, BYTES_ADDRESS_TYPE } from 'utils/bytesToString'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION,
  DROP_MAVRYK_COUNCIL_REQUEST_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserContext } from 'providers/UserProvider/user.provider'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { CouncilActionStyled } from '../Council.style'

type Props = {
  isBreakGlassCounsil: boolean
  cardIdName: string
  counsilAddress: string
  startDatetime: string | null
  actionType: string
  signersCount: number
  numCouncilMembers: number
  id: number
  parameters: CouncilActionType['parameters']
}

export function CouncilOngoingAction({
  startDatetime,
  actionType,
  signersCount,
  numCouncilMembers,
  id,
  parameters,
  isBreakGlassCounsil,
  cardIdName,
  counsilAddress,
}: Props) {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const handleClickCard = () => setIsOpen(!isOpen)

  const findActionByName = useCallback(
    (name: string, type?: BytesType) => {
      const foundField = parameters.find((item) => item.name === name)?.value

      if (!foundField) {
        return ''
      }

      return type === BYTES_ADDRESS_TYPE ? convertBytesAddressToAddress(foundField) : bytesToText(foundField)
    },
    [parameters],
  )

  // drop request action
  const dropBreakGlassContractActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: isBreakGlassCounsil ? DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION : DROP_MAVRYK_COUNCIL_REQUEST_ACTION,
      actionFn: async (actionId: number) => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!counsilAddress) {
          bug('Wrong counsil address')
          return null
        }

        if (isBreakGlassCounsil) {
          return await dropBreakGlass(actionId, counsilAddress)
        } else {
          return await dropRequest(actionId, counsilAddress)
        }
      },
    }),
    [counsilAddress, isBreakGlassCounsil, userAddress],
  )

  const { actionWithArgs: handleDropAction } = useContractAction(dropBreakGlassContractActionProps)

  const isChangeCouncilMember = actionType === 'changeCouncilMember'
  const isAddCouncilMember = actionType === 'addCouncilMember'
  const isRemoveCouncilMember = actionType === 'removeCouncilMember'

  let bottomSection = (
    <>
      <div className="row two-columns">
        <div className="column">
          <div className="column-name">{cardIdName}</div>
          <div className="column-value">{id}</div>
        </div>

        <div className="column">
          <NewButton kind={BUTTON_SECONDARY} onClick={() => handleDropAction(id)}>
            <Icon id="navigation-menu_close" />
            Drop Action
          </NewButton>
        </div>
      </div>
    </>
  )

  if (isChangeCouncilMember || isAddCouncilMember) {
    const name = findActionByName(isChangeCouncilMember ? 'newCouncilMemberName' : 'councilMemberName')
    const website = findActionByName(isChangeCouncilMember ? 'newCouncilMemberWebsite' : 'councilMemberWebsite')
    const address = findActionByName(
      isChangeCouncilMember ? 'newCouncilMemberAddress' : 'councilMemberAddress',
      BYTES_ADDRESS_TYPE,
    )
    const oldAddress = findActionByName('oldCouncilMemberAddress', BYTES_ADDRESS_TYPE)
    const image = findActionByName(isChangeCouncilMember ? 'newCouncilMemberImage' : 'councilMemberImage')

    bottomSection = (
      <>
        <div className="row">
          {isChangeCouncilMember && (
            <div className="column">
              <div className="column-name">Council Member to change</div>
              <TzAddress
                type={PRIMARY_TZ_ADDRESS_COLOR}
                className="column-address"
                tzAddress={oldAddress}
                hasIcon={true}
              />
            </div>
          )}

          {isAddCouncilMember && (
            <div className="column">
              <div className="column-name">Council Member Address</div>
              <TzAddress
                type={PRIMARY_TZ_ADDRESS_COLOR}
                className="column-address"
                tzAddress={address}
                hasIcon={true}
              />
            </div>
          )}

          <div className="column">
            <div className="column-name">Council Member Name</div>
            <div className="column-value">{name}</div>
          </div>

          <div className="column">
            <div className="column-name">Council Member Website</div>
            <div className="column-link">
              <a className="column-link" href={website} target="_blank" rel="noreferrer">
                {website}
              </a>
            </div>
          </div>
        </div>

        <div className="row">
          {isChangeCouncilMember ? (
            <div className="column">
              <div className="column-name">New Council Member Address</div>
              <TzAddress
                type={PRIMARY_TZ_ADDRESS_COLOR}
                className="column-address"
                tzAddress={address}
                hasIcon={true}
              />
            </div>
          ) : (
            <div className="column-value"></div>
          )}

          {image ? (
            <div className="column">
              <div className="column-name">Profile Pic</div>
              <img className="column-image" src={image} alt="user logo" />
            </div>
          ) : (
            <div className="column-value">-</div>
          )}

          <div className="column">
            <NewButton kind={BUTTON_SECONDARY} onClick={() => handleDropAction(id)}>
              <Icon id="navigation-menu_close" />
              Drop Action
            </NewButton>
          </div>
        </div>
      </>
    )
  }

  if (isRemoveCouncilMember) {
    const address = findActionByName('councilMemberAddress', BYTES_ADDRESS_TYPE)

    bottomSection = (
      <>
        <div className="row two-columns">
          <div className="column">
            <div className="column-name">Council Member to remove</div>
            <TzAddress type={PRIMARY_TZ_ADDRESS_COLOR} className="column-address" tzAddress={address} hasIcon={true} />
          </div>

          <div className="column">
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={() => handleDropAction(id)}>
              <Icon id="navigation-menu_close" />
              Drop Action
            </NewButton>
          </div>
        </div>
      </>
    )
  }

  // if the dropdown is not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (isOpen) {
      scrollToFullView(ref.current)
    }
  }, [isOpen])

  return (
    <CouncilActionStyled>
      <div className="top" onClick={handleClickCard}>
        <div className="row top-row">
          <div className="column">
            <div className="column-name">Date</div>
            <div className="column-value">{parseDate({ time: startDatetime, timeFormat: 'MMM Do, YYYY' })}</div>
          </div>

          <div className="column">
            <div className="column-name">Purpose</div>
            <div className="column-value">{getSeparateCamelCase(actionType)}</div>
          </div>

          <div className="column">
            <div className="column-name">Signed</div>
            <div className="column-value">
              {signersCount}/{numCouncilMembers}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div ref={ref} className="bottom">
          {bottomSection}
        </div>
      )}
    </CouncilActionStyled>
  )
}
