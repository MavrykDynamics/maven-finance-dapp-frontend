import classNames from 'classnames'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'
import { CouncilsActionsIds } from 'providers/CouncilProvider/helpers/council.types'
import { CouncilActionParamCellType } from 'pages/Council/helpers/council.types'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import {
  ACTION_READ_MORE_CONTRACTS_LIST,
  ACTION_READ_MORE_PURPOSE,
  ActionReadMorePopupDataType,
} from '../popups/CouncilActionReadMorePopupPopup'

// view
import { CouncilActionToSignBodyStyled, CouncilActionToSignStyled } from './CouncilActionsToSign.styles'
import { H2SimpleTitle } from 'styles/generalStyledComponents/Titles.style'
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
  openReadMorePopup: (popupContentData: ActionReadMorePopupDataType) => void
}

export const CouncilActionToSign = ({
  action,
  actionsToSignAmount,
  actionIndex,
  signActionHandler,
  openReadMorePopup,
}: Props) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { tokensMetadata } = useTokensContext()

  const { actionName, id, parameters, councilSize, signersCount, actionClientId } = action
  const gridCells = getCardToSignBodyCels(parameters, actionClientId, tokensMetadata)

  const handleSignAction = () => signActionHandler(id)

  return (
    <CouncilActionToSignStyled className={classNames({ isLast: actionsToSignAmount - 1 === actionIndex })}>
      <H2SimpleTitle>{actionName}</H2SimpleTitle>

      <CouncilActionToSignBodyStyled actionId={actionClientId}>
        {gridCells.map(({ className, value, valueContent, cellName, paramName }) => {
          const isPurposeParam = paramName === COUNCIL_ACTIONS_PARAMS_MAPPER.purpose
          const isContractsSetParams = paramName === COUNCIL_ACTIONS_PARAMS_MAPPER.contractAddressSet

          const handleOpenReadMore = isPurposeParam
            ? () =>
                openReadMorePopup({
                  contentType: ACTION_READ_MORE_PURPOSE,
                  purposeText: value,
                })
            : isContractsSetParams
            ? () =>
                openReadMorePopup({
                  contentType: ACTION_READ_MORE_CONTRACTS_LIST,
                  constractsList: value.split(', '),
                })
            : undefined
          return (
            <div className={classNames('column', className)} key={paramName}>
              <div className="name">{cellName}</div>
              {isPurposeParam || isContractsSetParams ? (
                <div className="value open-readmore" onClick={handleOpenReadMore}>
                  {isPurposeParam ? 'Read Request' : 'Look Contracts'}
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
    </CouncilActionToSignStyled>
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
          name === COUNCIL_ACTIONS_PARAMS_MAPPER.newTotalAllocatedAmount ||
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
