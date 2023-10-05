import { useState, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { TzAddress } from '../../../../app/App.components/TzAddress/TzAddress.view'
import NewButton from 'app/App.components/Button/NewButton'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { AvatarStyle } from '../../../../app/App.components/Avatar/Avatar.style'
import { CouncilPendingStyled, CouncilModalBase } from './CouncilPending.style'
import Icon from '../../../../app/App.components/Icon/Icon.view'

// helpers
import { getSeparateCamelCase } from '../../../../utils/parse'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { bytesToText, BytesType, BYTES_ADDRESS_TYPE } from 'utils/bytesToString'
import { convertBytesAddressToAddress } from 'app/App.helpers'
import { convertNumberForClient } from 'utils/calcFunctions'

// consts
import { MVK_DECIMALS } from 'utils/constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type Props = CouncilActionType & {
  numCouncilMembers: number
  councilPendingActionsLength: number
  index: number
  handleSignAction: (id: number) => void
}

export const CouncilPending = ({
  id,
  actionType,
  signersCount,
  numCouncilMembers,
  councilPendingActionsLength,
  parameters,
  index,
  handleSignAction,
}: Props) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const ref = useRef<HTMLDivElement | null>(null)

  const [showPopup, setShowPopup] = useState(false)

  const { name, value } = parameters?.[0] || {}
  const cardNumber = index + 1

  const showScrollInModal = useMemo(
    () => ref.current?.offsetHeight !== ref.current?.scrollHeight,
    [ref.current?.offsetHeight, ref.current?.scrollWidth],
  )

  const closePopup = () => setShowPopup(false)
  const onClickSign = () => handleSignAction(id)

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

  const isAddCouncilMember = actionType === 'addCouncilMember'
  const isUpdateChangeCouncilMember = actionType === 'updateCouncilMember'
  const isChangeCouncilMember = actionType === 'changeCouncilMember'
  const isRemoveCouncilMember = actionType === 'removeCouncilMember'
  const isSetAllContractsAdmin = actionType === 'setAllContractsAdmin'
  // const isSetSingleContractAdmin = actionType === 'setSingleContractAdmin'
  const isSetBaker = actionType === 'setBaker'
  const isSetContractBaker = actionType === 'setContractBaker'
  const isSignAction = actionType === 'signAction'
  const isAddVestee = actionType === 'addVestee'
  const isRequestTokens = actionType === 'requestTokens'
  const isUpdateVestee = actionType === 'updateVestee'
  const isTransfer = actionType === 'transfer'
  const isRequestMint = actionType === 'requestMint'
  const isToggleVesteeLock = actionType === 'toggleVesteeLock'
  const isRemoveVestee = actionType === 'removeVestee'
  const purpose = findActionByName('purpose')

  const findAddress = (type: string) => {
    switch (type) {
      case 'setBaker':
        return findActionByName('keyHash', BYTES_ADDRESS_TYPE)
      case 'setContractBaker':
        return findActionByName('keyHash', BYTES_ADDRESS_TYPE)
      default:
        return convertBytesAddressToAddress(value)
    }
  }

  const purposeRequestPopup = createPortal(
    <PopupContainer onClick={closePopup} show={showPopup}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="council__request-purpose">
        <CouncilModalBase>
          <button onClick={closePopup} className="close-modal" />
          <h1>Purpose for Request</h1>
          <p ref={ref}>{purpose}</p>
          {showScrollInModal && <div className="shadow"></div>}
        </CouncilModalBase>
      </PopupContainerWrapper>
    </PopupContainer>,
    document.body,
  )

  // 2/3
  if (isAddCouncilMember) {
    const councilMemberName = findActionByName('councilMemberName')
    const councilMemberWebsite = findActionByName('councilMemberWebsite')
    const councilMemberImage = findActionByName('councilMemberImage')
    const councilMemberAddress = findActionByName('councilMemberAddress', BYTES_ADDRESS_TYPE)

    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className="number">{cardNumber}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters">
            <article>
              <p>Council Member</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={councilMemberAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>
            {councilMemberName ? (
              <article>
                <p>Council Member Name</p>
                <span className="parameters-value">{councilMemberName}</span>
              </article>
            ) : null}
            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value content-width">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>
          </div>

          <div className="parameters">
            <article>
              {councilMemberImage ? (
                <article className="parameters-img">
                  <AvatarStyle>
                    <img src={councilMemberImage} />
                  </AvatarStyle>
                </article>
              ) : (
                <>
                  <p>Profile Pic</p>
                  <span className="parameters-value">-</span>
                </>
              )}
            </article>

            <article>
              <p>Council Member Website</p>
              {councilMemberWebsite ? (
                <a className="parameters-link" href={councilMemberWebsite} target="_blank" rel="noreferrer">
                  {councilMemberWebsite}
                </a>
              ) : (
                <span className="parameters-value">-</span>
              )}
            </article>

            <div className="sign-action">
              <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
                <Icon id="sign" />
                Sign
              </NewButton>
            </div>
          </div>
        </CouncilPendingStyled>
        {purposeRequestPopup}
      </>
    )
  }

  // 2/3
  if (isUpdateChangeCouncilMember) {
    const newCouncilMemberAddress = findActionByName('newCouncilMemberAddress', BYTES_ADDRESS_TYPE)
    const newCouncilMemberName = findActionByName('newCouncilMemberName')
    const newCouncilMemberWebsite = findActionByName('newCouncilMemberWebsite')
    const newCouncilMemberImage = findActionByName('newCouncilMemberImage')
    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className="number">{cardNumber}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p>Council Member</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={newCouncilMemberAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>

            <article>
              <p>Council Member Name</p>
              <span className="parameters-value">{newCouncilMemberName || '-'}</span>
            </article>

            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value content-width">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>
          </div>

          <div className="parameters grid">
            <article>
              {newCouncilMemberImage ? (
                <article className="parameters-img">
                  <AvatarStyle>
                    <img src={newCouncilMemberImage} />
                  </AvatarStyle>
                </article>
              ) : (
                <>
                  <p>Profile Pic</p>
                  <span className="parameters-value">-</span>
                </>
              )}
            </article>

            <article>
              <p>Council Member Website</p>
              {newCouncilMemberWebsite ? (
                <a className="parameters-link" href={newCouncilMemberWebsite} target="_blank" rel="noreferrer">
                  {newCouncilMemberWebsite}
                </a>
              ) : (
                <span className="parameters-value">-</span>
              )}
            </article>
            <div className="sign-action">
              <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
                <Icon id="sign" />
                Sign
              </NewButton>
            </div>
          </div>
        </CouncilPendingStyled>
      </>
    )
  }

  // 3/3
  if (isChangeCouncilMember) {
    const oldCouncilMemberAddress = findActionByName('oldCouncilMemberAddress', BYTES_ADDRESS_TYPE)
    const newCouncilMemberAddress = findActionByName('newCouncilMemberAddress', BYTES_ADDRESS_TYPE)
    const newCouncilMemberName = findActionByName('newCouncilMemberName')
    const newCouncilMemberWebsite = findActionByName('newCouncilMemberWebsite')
    const newCouncilMemberImage = findActionByName('newCouncilMemberImage')
    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className="number">{cardNumber}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p className="without-margin">Council Member to change</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={oldCouncilMemberAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>
            <article>
              <p className="without-margin">Council Member Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={newCouncilMemberAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>

            <article>
              <p>Council Member Name</p>
              <span className="parameters-value">{newCouncilMemberName || '-'}</span>
            </article>

            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value content-width">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>
          </div>

          <div className="parameters grid">
            <div></div>

            <article>
              {newCouncilMemberImage ? (
                <article className="parameters-img">
                  <AvatarStyle>
                    <img src={newCouncilMemberImage} />
                  </AvatarStyle>
                </article>
              ) : (
                <>
                  <p>Profile Pic</p>
                  <span className="parameters-value">-</span>
                </>
              )}
            </article>

            <article>
              <p>Council Member Website</p>
              {newCouncilMemberWebsite ? (
                <a className="parameters-link" href={newCouncilMemberWebsite} target="_blank" rel="noreferrer">
                  {newCouncilMemberWebsite}
                </a>
              ) : (
                <span className="parameters-value">-</span>
              )}
            </article>

            <div className="sign-action">
              <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
                <Icon id="sign" />
                Sign
              </NewButton>
            </div>
          </div>
        </CouncilPendingStyled>
      </>
    )
  }

  // TODO: return to use after design will be adjusted
  // 2/3
  // if (isSetSingleContractAdmin) {
  //   const newAdminAddress = findActionByName('newAdminAddress', BYTES_ADDRESS_TYPE)
  //   const targetContractAddress = findActionByName('targetContractAddress', BYTES_ADDRESS_TYPE)

  //   return (
  //     <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
  //       <span className="number">{cardNumber}</span>
  //       <h3>{getSeparateCamelCase(actionType)}</h3>
  //       <div className="parameters">
  //         <article>
  //           <p>New Admin Address</p>
  //           <span className="parameters-value content-width">
  //             <TzAddress tzAddress={newAdminAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
  //           </span>
  //         </article>

  //         <article className="signed-article">
  //           <div>
  //             <p>Signed</p>
  //             <span className="parameters-value content-width">
  //               {signersCount}/{numCouncilMembers}
  //             </span>
  //           </div>
  //         </article>
  //       </div>

  //       <div className="parameters">
  //         <article>
  //           <div>
  //             <p>Target Contract</p>
  //             <span className="parameters-value content-width">
  //               <TzAddress tzAddress={targetContractAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
  //             </span>
  //           </div>
  //         </article>
  //         <div className="sign-action">
  //           <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
  //             <Icon id="sign" />
  //             Sign
  //           </NewButton>
  //         </div>
  //       </div>
  //     </CouncilPendingStyled>
  //   )
  // }

  // 2/3
  if (isAddVestee) {
    const cliffInMonths = findActionByName('cliffInMonths')
    const vestingInMonths = findActionByName('vestingInMonths')

    const totalAllocatedAmount = convertNumberForClient({
      number: Number(findActionByName('totalAllocatedAmount')),
      grade: MVK_DECIMALS,
    })

    const vesteeAddress = findActionByName('vesteeAddress', BYTES_ADDRESS_TYPE)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Vestee Address</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={vesteeAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
            </span>
          </article>

          <article>
            <p>Total Allocated Amount</p>
            <span className="parameters-value">
              <CommaNumber value={+totalAllocatedAmount} endingText={'MVK'} />
            </span>
          </article>

          <article className="signed-article">
            <div>
              <p>Signed</p>
              <span className="parameters-value content-width">
                {signersCount}/{numCouncilMembers}
              </span>
            </div>
          </article>
        </div>

        <div className="parameters">
          <article>
            <p>Cliff In Months</p>
            <span className="parameters-value">{cliffInMonths} months</span>
          </article>

          <article>
            <p>Vesting In Months</p>
            <span className="parameters-value">{vestingInMonths} months</span>
          </article>
          <div className="sign-action">
            <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
              <Icon id="sign" />
              Sign
            </NewButton>
          </div>
        </div>
      </CouncilPendingStyled>
    )
  }

  // 2/3
  if (isUpdateVestee) {
    const newCliffInMonths = findActionByName('newCliffInMonths')
    const newVestingInMonths = findActionByName('newVestingInMonths')

    const newTotalAllocatedAmount = convertNumberForClient({
      number: Number(findActionByName('newTotalAllocatedAmount')),
      grade: MVK_DECIMALS,
    })

    const vesteeAddress = findActionByName('vesteeAddress', BYTES_ADDRESS_TYPE)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Vestee Address</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={vesteeAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
            </span>
          </article>

          <article>
            <p>New Total Allocated Amount</p>
            <span className="parameters-value">
              <CommaNumber value={+newTotalAllocatedAmount} endingText={'MVK'} />
            </span>
          </article>

          <article className="signed-article">
            <div>
              <p>Signed</p>
              <span className="parameters-value content-width">
                {signersCount}/{numCouncilMembers}
              </span>
            </div>
          </article>
        </div>

        <div className="parameters">
          <article>
            <p>New Cliff In Months</p>
            <span className="parameters-value">{newCliffInMonths} months</span>
          </article>

          <article>
            <p>New Vesting In Months</p>
            <span className="parameters-value">{newVestingInMonths} months</span>
          </article>
          <div className="sign-action">
            <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
              <Icon id="sign" />
              Sign
            </NewButton>
          </div>
        </div>
      </CouncilPendingStyled>
    )
  }

  // 3/3
  if (isRequestTokens) {
    const treasuryAddress = findActionByName('treasuryAddress', BYTES_ADDRESS_TYPE)
    const tokenAmount = findActionByName('tokenAmount')
    const tokenContractAddress = findActionByName('tokenContractAddress', BYTES_ADDRESS_TYPE)
    const tokenType = findActionByName('tokenType')
    const tokenId = findActionByName('tokenId')

    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className="number">{cardNumber}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p>Treasury Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={treasuryAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>
            <article>
              <p>Token Contract Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={tokenContractAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>

            <article>
              <p>Token Amount</p>
              <span className="parameters-value">
                <CommaNumber value={+tokenAmount} endingText={'MVK'} />
              </span>
            </article>

            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value content-width">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>
          </div>

          <div className="parameters grid">
            <article>
              <p>Token Type</p>
              <span className="parameters-value">{tokenType}</span>
            </article>

            <article>
              <p>Token ID</p>
              <span className="parameters-value">{tokenId}</span>
            </article>

            {purpose && (
              <article>
                <p>Purpose for Request</p>
                <button className="parameters-link" onClick={() => setShowPopup(true)}>
                  Read Request
                </button>
              </article>
            )}
            <div className="sign-action">
              <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
                <Icon id="sign" />
                Sign
              </NewButton>
            </div>
          </div>
        </CouncilPendingStyled>
        {purposeRequestPopup}
      </>
    )
  }

  // 3/3
  if (isTransfer) {
    const receiverAddress = findActionByName('receiverAddress', BYTES_ADDRESS_TYPE)
    const tokenContractAddress = findActionByName('tokenContractAddress', BYTES_ADDRESS_TYPE)
    const tokenAmount = findActionByName('tokenAmount')
    const tokenType = findActionByName('tokenType')
    const tokenId = findActionByName('tokenId')

    return (
      <>
        <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
          <span className="number">{cardNumber}</span>
          <h3>{getSeparateCamelCase(actionType)}</h3>
          <div className="parameters grid">
            <article>
              <p>Receiver Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={receiverAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>
            <article>
              <p>Token Contract Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={tokenContractAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </span>
            </article>

            <article>
              <p>Total Amount</p>
              <span className="parameters-value">
                <CommaNumber value={+tokenAmount} endingText={'MVK'} />
              </span>
            </article>

            <article className="signed-article">
              <div>
                <p>Signed</p>
                <span className="parameters-value content-width">
                  {signersCount}/{numCouncilMembers}
                </span>
              </div>
            </article>
          </div>

          <div className="parameters grid">
            <article>
              <p>Token Type</p>
              <span className="parameters-value">{tokenType}</span>
            </article>

            <article>
              <p>Token ID</p>
              <span className="parameters-value">{tokenId}</span>
            </article>

            {purpose && (
              <article>
                <p>Purpose for Request</p>
                <button className="parameters-link" onClick={() => setShowPopup(true)}>
                  Read Request
                </button>
              </article>
            )}
            <div className="sign-action">
              <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
                <Icon id="sign" />
                Sign
              </NewButton>
            </div>
          </div>
        </CouncilPendingStyled>
        {purposeRequestPopup}
      </>
    )
  }

  // 2/3
  if (isRequestMint) {
    const tokenAmount = convertNumberForClient({ number: Number(findActionByName('tokenAmount')), grade: MVK_DECIMALS })
    const treasuryAddress = findActionByName('treasuryAddress', BYTES_ADDRESS_TYPE)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>Request Token Mint</h3>
        <div className="parameters">
          <article>
            <p>Treasury Address</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={treasuryAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
            </span>
          </article>

          <article>
            <p>Token Amount</p>
            <span className="parameters-value">
              <CommaNumber value={+tokenAmount} endingText={'MVK'} />
            </span>
          </article>

          <article className="signed-article">
            <div>
              <p>Signed</p>
              <span className="parameters-value content-width">
                {signersCount}/{numCouncilMembers}
              </span>
            </div>
          </article>
        </div>

        <div className="parameters">
          {purpose && (
            <article>
              <p>Purpose for Request</p>
              <button className="parameters-link" onClick={() => setShowPopup(true)}>
                Read Request
              </button>
            </article>
          )}

          <article />
          <div className="sign-action">
            <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
              <Icon id="sign" />
              Sign
            </NewButton>
          </div>
        </div>
        {purposeRequestPopup}
      </CouncilPendingStyled>
    )
  }

  // 1/3
  // for general card with only address field
  if (
    isRemoveVestee ||
    isToggleVesteeLock ||
    isRemoveCouncilMember ||
    isSignAction ||
    isSetAllContractsAdmin ||
    isSetBaker ||
    isSetContractBaker
  ) {
    let address = findAddress(actionType)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <div>
            <p className="parameters-name">{getSeparateCamelCase(name)}</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={address} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
            </span>
          </div>
          <div>
            <p>Signed</p>
            <span className="parameters-value content-width">
              {signersCount}/{numCouncilMembers}
            </span>
          </div>
        </div>

        <div className="sign-action">
          <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
            <Icon id="sign" />
            Sign
          </NewButton>
        </div>
      </CouncilPendingStyled>
    )
  }

  const convertedValue = bytesToText(value)

  return (
    <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
      <span className="number">{cardNumber}</span>
      <h3>{getSeparateCamelCase(actionType)}</h3>
      <div className="parameters">
        <div>
          <p className="parameters-name">{getSeparateCamelCase(name)}</p>
          <span className="parameters-value">{convertedValue}</span>
        </div>
        <div>
          <p>Signed</p>
          <span className="parameters-value content-width">
            {signersCount}/{numCouncilMembers}
          </span>
        </div>
      </div>

      <div className="sign-action">
        <NewButton form={BUTTON_WIDE} kind={BUTTON_PRIMARY} onClick={onClickSign} disabled={isActionActive}>
          <Icon id="sign" />
          Sign
        </NewButton>
      </div>
    </CouncilPendingStyled>
  )
}
