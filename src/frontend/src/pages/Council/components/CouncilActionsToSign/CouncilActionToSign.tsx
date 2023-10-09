import { useState } from 'react'
import classNames from 'classnames'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'

// view
import { CouncilActionToSignBodyStyled, CouncilActionToSignStyled } from './CouncilActionsToSign.styles'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { CouncilActionPurposePopupContent } from 'app/App.components/popup/bases/CouncilPopup.style'
import { H2SimpleTitle, H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// consts
import { BUTTON_WIDE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { getClientActionIdByName } from 'pages/Council/helpers/commonCouncil.utils'
import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'
import { COUNCIL_ACTIONS_TO_SIGN_COLUMS_MAPPER, CouncilActionsToSignColumnsType } from './CouncilActionsToSign.consts'
import { convertBytes, BYTES_ADDRESS_TYPE, BYTES_STRING_TYPE } from 'utils/bytesToString'
import { CAPITALIZE_CASE, parseCamelCaseString } from 'utils/parse'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

type Props = {
  action: CouncilActionType
  councilMembersAmount: number
  actionsToSignAmount: number
  actionIndex: number
  signActionHandler: (id: number) => void
}

const ActionPurposePopup = ({ closePopup, purpose }: { closePopup: () => void; purpose: string | null }) => {
  return (
    <PopupContainer onClick={closePopup} show={Boolean(purpose)}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council__request-purpose">
        <CouncilActionPurposePopupContent>
          <button onClick={closePopup} className="close-modal" />
          <H2Title>Purpose for Request</H2Title>
          <p>{purpose}</p>
          {/* {showScrollInModal && <div className="shadow"></div>} */}
        </CouncilActionPurposePopupContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

export const CouncilActionToSign = ({
  action,
  councilMembersAmount,
  actionsToSignAmount,
  actionIndex,
  signActionHandler,
}: Props) => {
  // action purpose popup
  const [popupPurose, setPopupPurose] = useState<null | string>(null)
  const closePopup = () => setPopupPurose(null)

  const { actionName, id } = action
  const handleSignAction = () => signActionHandler(id)

  const actionId = getClientActionIdByName(actionName)
  if (!actionId) return null

  return (
    <CouncilActionToSignStyled className={classNames({ isLast: actionsToSignAmount - 1 === actionIndex })}>
      <H2SimpleTitle>{actionName}</H2SimpleTitle>
      <CouncilActionToSignBody
        handleSignAction={handleSignAction}
        action={action}
        actionId={actionId}
        councilMembersAmount={councilMembersAmount}
      />

      <ActionPurposePopup closePopup={closePopup} purpose={popupPurose} />
    </CouncilActionToSignStyled>
  )
}

const CouncilActionToSignBody = ({
  handleSignAction,
  action,
  actionId,
  councilMembersAmount,
}: {
  handleSignAction: () => void
  action: CouncilActionType
  actionId: CouncilsFormsIds
  councilMembersAmount: number
}) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { parameters, signersCount } = action

  const gridCells = getCardToSignBodyCels(parameters)

  return (
    <CouncilActionToSignBodyStyled actionId={actionId}>
      {gridCells.map(({ className, value, valueContent, name }) => {
        return (
          <div className={classNames('column', className)}>
            <div className="name">{name}</div>
            <div className="value" title={value}>
              {valueContent}
            </div>
          </div>
        )
      })}

      <div className="column signed-amount">
        <div className="name">Signed</div>
        <div
          className={`value ${councilMembersAmount / 2 < signersCount ? 'is-green' : 'is-red'}`}
        >{`${signersCount}/${councilMembersAmount}`}</div>
      </div>

      <div className="sign-btn">
        <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={handleSignAction} disabled={isActionActive}>
          <Icon id="sign" />
          Sign
        </NewButton>
      </div>
    </CouncilActionToSignBodyStyled>
  )
}

type CardToSignBodyCelsType = Array<{ name: string; className: string; value: string; valueContent: React.ReactNode }>

const getCardToSignBodyCels = (actionParams: CouncilActionType['parameters']): CardToSignBodyCelsType => {
  return actionParams.reduce<CardToSignBodyCelsType>((acc, actionParam) => {
    const { name, value } = actionParam
    const convertedParamValue = convertBytes(
      value,
      name.toLowerCase().includes('address') || name === 'keyHash' ? BYTES_ADDRESS_TYPE : BYTES_STRING_TYPE,
    )
    const columnData = COUNCIL_ACTIONS_TO_SIGN_COLUMS_MAPPER[name]

    if (convertedParamValue && columnData) {
      const { type, className, sufix } = columnData
      const valueContent =
        type === 'number' ? (
          <CommaNumber value={parseFloat(convertedParamValue)} endingText={sufix} />
        ) : type === 'url' ? (
          <CustomLink to={convertedParamValue}>{convertedParamValue}</CustomLink>
        ) : type === 'address' ? (
          <TzAddress tzAddress={convertedParamValue} hasIcon />
        ) : type === 'image' ? (
          <ImageWithPlug imageLink={convertedParamValue} alt={name} />
        ) : (
          convertedParamValue
        )

      acc.push({
        className,
        valueContent,
        value: convertedParamValue,
        name: parseCamelCaseString(name, CAPITALIZE_CASE),
      })
    }

    return acc
  }, [])
}
