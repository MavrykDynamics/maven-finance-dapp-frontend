import React, { useState, useCallback, useEffect, useRef } from 'react'

// components
import NewButton from 'app/App.components/Button/NewButton.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import Icon from 'app/App.components/Icon/Icon.view'

// helpers
import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { getSeparateCamelCase } from '../../../utils/parse'
import { scrollToFullView } from 'utils/scrollToFullView'
import { bytesToText, BytesType, BYTES_ADDRESS_TYPE } from 'utils/bytesToString'
import { convertBytesAddressToAddress } from 'app/App.helpers'

// styles
import { CouncilActionStyled } from '../Council.style'

// types
import { CouncilActions } from 'utils/TypesAndInterfaces/Council'

type Props = CouncilActions[0] & {
  numCouncilMembers: number
  handleDropAction: (arg: number) => void
  cardIdName: string
}

export function CouncilOngoingAction(props: Props) {
  const { startDatetime, actionType, signersCount, numCouncilMembers, id, parameters, handleDropAction, cardIdName } =
    props
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const handleClickCard = () => {
    setIsOpen(!isOpen)
  }

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
          <NewButton className='drop-btn' kind={TRANSPARENT_WITH_BORDER} onClick={() => handleDropAction(id)}>
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
              <TzAddress className="column-address" tzAddress={oldAddress} hasIcon={true} />
            </div>
          )}

          {isAddCouncilMember && (
            <div className="column">
              <div className="column-name">Council Member Address</div>
              <TzAddress className="column-address" tzAddress={address} hasIcon={true} />
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
              <TzAddress className="column-address" tzAddress={address} hasIcon={true} />
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
            <NewButton className='drop-btn' kind={TRANSPARENT_WITH_BORDER} onClick={() => handleDropAction(id)}>
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
            <TzAddress className="column-address" tzAddress={address} hasIcon={true} />
          </div>

          <div className="column">
            <NewButton className='drop-btn' kind={TRANSPARENT_WITH_BORDER} onClick={() => handleDropAction(id)}>
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
