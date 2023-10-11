// import classNames from 'classnames'
// import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'
// import { CouncilsActionsIds } from 'providers/CouncilProvider/helpers/council.types'
// import { CouncilActionToSignBodyStyled } from './CouncilActionsToSign.styles'
// import NewButton from 'app/App.components/Button/NewButton'
// import Icon from 'app/App.components/Icon/Icon.view'
// import { BUTTON_WIDE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
// import { CouncilActionsToSignGridCellsMapper } from './CouncilActionsToSign.consts'
// import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
// import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
// import { getCardToSignBodyCels } from './CouncilActionToSign'

// export const CouncilActionToSignBody = ({
//   handleSignAction,
//   handleOpenPurposePopup,
//   action,
//   actionId,
//   councilMembersAmount,
// }: {
//   handleSignAction: () => void
//   handleOpenPurposePopup: (purposeText: string) => void
//   action: CouncilActionType
//   actionId: CouncilsActionsIds
//   councilMembersAmount: number
// }) => {
//   const {
//     globalLoadingState: { isActionActive },
//   } = useDappConfigContext()
//   const { tokensMetadata } = useTokensContext()

//   const { parameters, signersCount, actionClientId } = action

//   const gridCells = getCardToSignBodyCels(parameters, actionId, tokensMetadata)

//   return (
//     <CouncilActionToSignBodyStyled actionId={actionId}>
//       {gridCells.map(({ className, value, valueContent, name }) => {
//         return (
//           <div className={classNames('column', className)} key={name}>
//             <div className="name">{name}</div>
//             {name.toLowerCase() === 'purpose' ? (
//               <div className="value open-purpose" onClick={() => handleOpenPurposePopup(value)}>
//                 Read Request
//               </div>
//             ) : (
//               <div className="value" title={value}>;
//                 {valueContent}
//               </div>
//             )}
//           </div>
//         )
//       })}

//       <div className="column signed-amount">
//         <div className="name">Signed</div>
//         <div
//           className={`value ${councilMembersAmount / 2 < signersCount ? 'is-green' : 'is-red'}`}
//         >{`${signersCount}/${councilMembersAmount}`}</div>
//       </div>

//       <div className="sign-btn">
//         <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={handleSignAction} disabled={isActionActive}>
//           <Icon id="sign" />
//           Sign
//         </NewButton>
//       </div>
//     </CouncilActionToSignBodyStyled>
//   )
// }
