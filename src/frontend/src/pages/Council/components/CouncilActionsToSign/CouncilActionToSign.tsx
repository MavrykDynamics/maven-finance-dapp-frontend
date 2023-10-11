import { useState } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'
import { CouncilsActionsIds } from 'providers/CouncilProvider/helpers/council.types'
import { CouncilActionParamCellType } from 'pages/Council/helpers/council.types'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'

// view
import { CouncilActionToSignBodyStyled, CouncilActionToSignStyled } from './CouncilActionsToSign.styles'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { CouncilActionPurposePopupContent } from 'app/App.components/popup/bases/CouncilPopup.style'
import { H2SimpleTitle, H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// consts
import { BUTTON_WIDE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { CouncilActionsToSignGridCellsMapper } from './CouncilActionsToSign.consts'
import { COUNCIL_ACTIONS_PARAMS_MAPPER } from 'providers/CouncilProvider/helpers/council.consts'
import { MVK_DECIMALS } from 'utils/constants'
import { MavrykCounsilDdForms } from 'pages/Council/helpers/council.consts'

// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getCellData, getCellValueContent } from 'pages/Council/helpers/commonCouncil.utils'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

type Props = {
  action: CouncilActionType
  actionsToSignAmount: number
  actionIndex: number
  signActionHandler: (id: number) => void
}

const ActionPurposePopup = ({ closePopup, purpose }: { closePopup: () => void; purpose: string | null }) => {
  return createPortal(
    <PopupContainer onClick={closePopup} show={Boolean(purpose)}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council__request-purpose">
        <CouncilActionPurposePopupContent>
          <button onClick={closePopup} className="close-modal" />
          <H2Title>Purpose for Request</H2Title>
          {/* <p>{purpose}</p> */}
          <div className="purpose scroll-block">
            <p>
              Lorem ipsum dolor sit amet. Sed dignissimos iure ex esse voluptatem eum autem earum! Ut voluptates
              eligendi quo repudiandae consequuntur sit recusandae omnis et dolore esse a voluptate sunt hic nulla velit
              quo architecto ullam. Non nostrum labore qui officiis internos et adipisci vero id saepe officiis est
              voluptatem galisum. Qui exercitationem dolorem id modi nulla qui soluta quos. Vel enim assumenda ex
              blanditiis laudantium aut velit consequatur? Ex provident repudiandae non voluptatibus culpa At reiciendis
              magni aut dignissimos corrupti est suscipit veritatis et vero voluptatem! Et enim omnis sit voluptatem
              magnam sit dolorem ipsum. Rem repellat sint et numquam cupiditate hic libero autem aut architecto omnis.
              Cum quia sint est ipsum ullam sed unde sequi est ipsam incidunt ut praesentium ipsa. Non dolorem saepe ut
              nulla repellat sed sunt sint. Lorem ipsum dolor sit amet. Sed dignissimos iure ex esse voluptatem eum
              autem earum! Ut voluptates eligendi quo repudiandae consequuntur sit recusandae omnis et dolore esse a
              voluptate sunt hic nulla velit quo architecto ullam. Non nostrum labore qui officiis internos et adipisci
              vero id saepe officiis est voluptatem galisum. Qui exercitationem dolorem id modi nulla qui soluta quos.
              Vel enim assumenda ex blanditiis laudantium aut velit consequatur? Ex provident repudiandae non
              voluptatibus culpa At reiciendis magni aut dignissimos corrupti est suscipit veritatis et vero voluptatem!
              Et enim omnis sit voluptatem magnam sit dolorem ipsum. Rem repellat sint et numquam cupiditate hic libero
              autem aut architecto omnis. Cum quia sint est ipsum ullam sed unde sequi est ipsam incidunt ut praesentium
              ipsa. Non dolorem saepe ut nulla repellat sed sunt sint.
            </p>
            {/* TODO: hide if full scrolled (check this https://codesandbox.io/s/react-detect-scroll-to-bottom-ik9g4) */}
            <div className="shadow" />
          </div>
        </CouncilActionPurposePopupContent>
      </PopupContainerWrapper>
    </PopupContainer>,
    document.body,
  )
}

export const CouncilActionToSign = ({ action, actionsToSignAmount, actionIndex, signActionHandler }: Props) => {
  // action purpose popup
  const [popupPurose, setPopupPurose] = useState<null | string>(null)
  const closePopup = () => setPopupPurose(null)
  const openPopup = (purposeText: string) => setPopupPurose(purposeText)

  const { actionName, id } = action
  const handleSignAction = () => signActionHandler(id)

  return (
    <CouncilActionToSignStyled className={classNames({ isLast: actionsToSignAmount - 1 === actionIndex })}>
      <H2SimpleTitle>{actionName}</H2SimpleTitle>
      <CouncilActionToSignBody handleSignAction={handleSignAction} handleOpenPurposePopup={openPopup} action={action} />

      <ActionPurposePopup closePopup={closePopup} purpose={popupPurose} />
    </CouncilActionToSignStyled>
  )
}

const CouncilActionToSignBody = ({
  handleSignAction,
  handleOpenPurposePopup,
  action,
}: {
  handleSignAction: () => void
  handleOpenPurposePopup: (purposeText: string) => void
  action: CouncilActionType
}) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { tokensMetadata } = useTokensContext()

  const { parameters, councilSize, signersCount, actionClientId } = action

  const gridCells = getCardToSignBodyCels(parameters, actionClientId, tokensMetadata)

  return (
    <CouncilActionToSignBodyStyled actionId={actionClientId}>
      {gridCells.map(({ className, value, valueContent, cellName, paramName }) => {
        return (
          <div className={classNames('column', className)} key={paramName}>
            <div className="name">{cellName}</div>
            {paramName === COUNCIL_ACTIONS_PARAMS_MAPPER.purpose ? (
              <div className="value open-purpose" onClick={() => handleOpenPurposePopup(value)}>
                Read Request
              </div>
            ) : (
              <div className="value" title={value}>
                {valueContent}
              </div>
            )}
          </div>
        )
      })}

      <div className="column signed-amount">
        <div className="name">Signed</div>
        <div
          className={`value ${councilSize / 2 < signersCount ? 'is-green' : 'is-red'}`}
        >{`${signersCount}/${councilSize}`}</div>
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

/**
 *
 * @param actionParams action parameters
 * @param actionId client id of the action
 * @param tokensMetadata metadata of tokens
 * @returns data for action to sign cells
 */
const getCardToSignBodyCels = (
  actionParams: CouncilActionType['parameters'],
  actionId: CouncilsActionsIds,
  tokensMetadata: TokensContext['tokensMetadata'],
): CouncilActionParamCellType => {
  const actionParamsCells = CouncilActionsToSignGridCellsMapper[actionId]

  // for actions add vestee, update vestee, request tokens mint we need to convert mvk tokens amount (totalAllocatedAmount | tokenAmount fields)
  if (
    actionId === MavrykCounsilDdForms.ADD_VESTEE ||
    actionId === MavrykCounsilDdForms.UPDATE_VESTEE ||
    actionId === MavrykCounsilDdForms.REQUEST_TOKEN_MINT
  ) {
    return actionParams.reduce<CouncilActionParamCellType>((acc, actionParam) => {
      const { name, parsedValue, columnData } = getCellData(actionParam, actionParamsCells)

      if (parsedValue && columnData) {
        const columnValue =
          name === COUNCIL_ACTIONS_PARAMS_MAPPER.totalAllocatedAmount ||
          name === COUNCIL_ACTIONS_PARAMS_MAPPER.tokenAmount
            ? String(convertNumberForClient({ number: parseFloat(parsedValue), grade: MVK_DECIMALS }))
            : parsedValue

        acc.push({
          valueContent: getCellValueContent(columnData, columnValue),
          className: columnData.className,
          value: columnValue,
          paramName: name,
          cellName: columnData.cellName,
        })
      }

      return acc
    }, [])
  }

  // for actions transfer tokens & request tokens we need to convert tokens amount (tokenAmount field)
  if (actionId === MavrykCounsilDdForms.TRANSFER_TOKENS || actionId === MavrykCounsilDdForms.REQUEST_TOKENS) {
    const tokenUsedInAction = getTokenDataByAddress({
      tokenAddress: actionParams.find(({ name }) => name === COUNCIL_ACTIONS_PARAMS_MAPPER.tokenContractAddress)?.value,
      tokensMetadata,
    })

    return actionParams.reduce<CouncilActionParamCellType>((acc, actionParam) => {
      const { name, parsedValue, columnData } = getCellData(actionParam, actionParamsCells)

      if (parsedValue && columnData) {
        if (name === 'tokenAmount') {
          // if tokens is not present log debug data into console and show plug instead of token amount
          if (!tokenUsedInAction) {
            console.error('invalid token used in action', {
              tokensMetadata,
              actionParams,
            })

            acc.push({
              valueContent: getCellValueContent({ ...columnData, type: 'default' }, '-'),
              className: 'token-amount',
              value: '-',
              paramName: name,
              cellName: columnData.cellName,
            })

            return acc
          }

          // if token is present show converted token amount
          const columnValue = String(
            convertNumberForClient({ number: parseFloat(parsedValue), grade: tokenUsedInAction.decimals }),
          )

          acc.push({
            valueContent: getCellValueContent({ ...columnData, sufix: tokenUsedInAction.symbol }, columnValue),
            className: columnData.className,
            value: columnValue,
            paramName: name,
            cellName: columnData.cellName,
          })
          return acc
        }

        acc.push({
          valueContent: getCellValueContent(columnData, parsedValue),
          className: columnData.className,
          value: parsedValue,
          paramName: name,
          cellName: columnData.cellName,
        })
      }

      return acc
    }, [])
  }

  // converting all other forms
  return actionParams.reduce<CouncilActionParamCellType>((acc, actionParam) => {
    const { parsedValue, columnData } = getCellData(actionParam, actionParamsCells)

    if (parsedValue && columnData) {
      acc.push({
        valueContent: getCellValueContent(columnData, parsedValue),
        className: columnData.className,
        value: parsedValue,
        paramName: actionParam.name,
        cellName: columnData.cellName,
      })
    }

    return acc
  }, [])
}

// /**
//  *
//  * @param columnData type of value see CouncilActionsToSignColumnsType[CouncilsActionsIds]['type'] and sufix in case we need to add token name after it's amount
//  * @param convertedParamValue unpacked param value bytes, if need converted to client format
//  * @param name name of the parameter
//  * @returns ReactNode to output to user
//  */
// const getCellValueContent = (
//   columnData: NonNullable<CouncilActionsToSignColumnsType[CouncilsActionsIds][CouncilActionParamsNames]>,
//   convertedParamValue: string,
// ) => {
//   const { type, sufix, cellName } = columnData

//   return type === 'number' ? (
//     <CommaNumber value={parseFloat(convertedParamValue)} endingText={sufix} />
//   ) : type === 'url' ? (
//     <CustomLink to={convertedParamValue}>{convertedParamValue}</CustomLink>
//   ) : type === 'address' ? (
//     <TzAddress tzAddress={convertedParamValue} hasIcon />
//   ) : type === 'image' ? (
//     <ImageWithPlug imageLink={convertedParamValue} alt={`${cellName} image`} />
//   ) : (
//     convertedParamValue
//   )
// }

// /**
//  *
//  * @param actionParam parameters of action from back-end
//  * @returns unpacked bytes value, param name and param parsed name, and column data (grid-area classname, value type)
//  */
// const getCellData = (
//   actionParam: CouncilActionType['parameters'][number],
//   actionParamsCells: CouncilActionsToSignColumnsType[CouncilsActionsIds],
// ) => {
//   const { name, value } = actionParam

//   const bytesType =
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.keyHash ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.newAdminAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.vesteeAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.receiverAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.tokenContractAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.targetContractAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.oldCouncilMemberAddress ||
//     name === COUNCIL_ACTIONS_PARAMS_MAPPER.treasuryAddress
//       ? BYTES_ADDRESS_TYPE
//       : BYTES_STRING_TYPE

//   const parsedValue = convertBytes(value, bytesType)

//   return { parsedValue, name, columnData: actionParamsCells[name] }
// }
