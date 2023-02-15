import React, { useState, useCallback, useEffect, useRef } from 'react'

// components
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'

// helpers
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { getSeparateCamelCase } from '../../../utils/parse'
import { scrollToFullView } from 'utils/scrollToFullView'
import { bytesToText, BytesType, BYTES_ADDRESS_TYPE } from 'utils/bytesToString'
import { convertBytesAddressToAddress } from 'app/App.helpers'

// styles
import { CouncilActionStyled } from '../Council.style'

// types
import { CouncilActions } from 'utils/TypesAndInterfaces/Council'

export type CouncilPageType = 'council' | 'breakGlassCouncil'

type Props = CouncilActions[0] & {
  numCouncilMembers: number
  handleDropAction: (arg: number) => void
  pageType: CouncilPageType
}

export function CouncilOngoingAction(props: Props) {
  const { startDatetime, actionType, signersCount, numCouncilMembers, id, parameters, handleDropAction, pageType } =
    props
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  // TODO: use props for page name
  const isCouncilPage = pageType === 'council'

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
          <div className="column-name">{isCouncilPage ? 'Council action ID' : 'Break Glass Action ID'}</div>
          <div className="column-value">{id}</div>
        </div>

        <div className="column">
          <Button
            className="drop-btn"
            icon="close-stroke"
            text="Drop Action"
            kind={ACTION_SECONDARY}
            onClick={() => handleDropAction(id)}
          />
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
            <Button
              className="drop-btn"
              icon="close-stroke"
              text="Drop Action"
              kind={ACTION_SECONDARY}
              onClick={() => handleDropAction(id)}
            />
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
            <Button
              className="drop-btn"
              icon="close-stroke"
              text="Drop Action"
              kind={ACTION_SECONDARY}
              onClick={() => handleDropAction(id)}
            />
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
