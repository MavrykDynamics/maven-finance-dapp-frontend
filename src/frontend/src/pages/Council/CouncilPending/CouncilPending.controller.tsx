import { useState, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

// components
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { getSeparateCamelCase } from '../../../utils/parse'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { bytesToText, BytesType, BYTES_ADDRESS_TYPE } from 'utils/bytesToString'
import { convertBytesAddressToAddress } from 'app/App.helpers'
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'

// types
import { CouncilActions } from 'utils/TypesAndInterfaces/Council'

// styles
import { CouncilPendingStyled } from './CouncilPending.style'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'

type Props = CouncilActions[0] & {
  numCouncilMembers: number
  councilPendingActionsLength: number
  index: number
  handleSignAction: (id: number) => void
}

export const CouncilPending = (props: Props) => {
  const {
    id,
    actionType,
    signersCount,
    numCouncilMembers,
    councilPendingActionsLength,
    parameters,
    index,
    handleSignAction,
  } = props

  const [showing, setShowing] = useState(false)
  const { name, value } = parameters?.[0] || {}
  const cardNumber = index + 1

  const ref = useRef<HTMLDivElement | null>(null)
  const showScrollInModal = useMemo(
    () => ref.current?.offsetHeight !== ref.current?.scrollHeight,
    [ref.current?.offsetHeight, ref.current?.scrollWidth],
  )

  const onClickSign = () => {
    if (id) {
      handleSignAction(id)
    }
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

  const isAddCouncilMember = actionType === 'addCouncilMember'
  const isUpdateChangeCouncilMember = actionType === 'updateCouncilMember'
  const isChangeCouncilMember = actionType === 'changeCouncilMember'
  const isRemoveCouncilMember = actionType === 'removeCouncilMember'
  const isSetAllContractsAdmin = actionType === 'setAllContractsAdmin'
  const isSetSingleContractAdmin = actionType === 'setSingleContractAdmin'
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
      // TODO: remove setBaker conditions after fix bakery address
      case 'setBaker':
        return 'in progress...'
      case 'setContractBaker':
        return findActionByName('targetContractAddress', BYTES_ADDRESS_TYPE)
      default:
        return convertBytesAddressToAddress(value)
    }
  }

  const modal = (
    <ModalStyled showing={true}>
      <ModalMask
        showing={true}
        onClick={() => {
          setShowing(false)
        }}
      />
      <ModalCard>
        <ModalClose
          onClick={() => {
            setShowing(false)
          }}
        >
          <Icon id="error" />
        </ModalClose>
        <ModalCardContent style={{ width: 586 }}>
          <h1>Purpose for Request</h1>
          <div ref={ref} className="text-box">
            {purpose}
          </div>
          <div style={{ display: showScrollInModal ? 'block' : 'none' }} className="shadow-box"></div>
        </ModalCardContent>
      </ModalCard>
    </ModalStyled>
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
              <p>Council Member Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={councilMemberAddress} type={CYAN} hasIcon />
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

            <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
              <Icon id="sign" />
              Sign
            </NewButton>
          </div>
        </CouncilPendingStyled>
        {showing ? createPortal(modal, document?.body) : null}
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
                <TzAddress tzAddress={newCouncilMemberAddress} type={CYAN} hasIcon />
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

            <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
              <Icon id="sign" />
              Sign
            </NewButton>
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
              <p>Council Member to change</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={oldCouncilMemberAddress} type={CYAN} hasIcon />
              </span>
            </article>
            <article>
              <p>Council Member Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={newCouncilMemberAddress} type={CYAN} hasIcon />
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

            <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
              <Icon id="sign" />
              Sign
            </NewButton>
          </div>
        </CouncilPendingStyled>
      </>
    )
  }

  // 2/3
  if (isSetSingleContractAdmin) {
    const newAdminAddress = findActionByName('newAdminAddress', BYTES_ADDRESS_TYPE)
    const targetContractAddress = findActionByName('targetContractAddress', BYTES_ADDRESS_TYPE)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>New Admin Address</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={newAdminAddress} type={CYAN} hasIcon />
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
            <div>
              <p>Target Contract</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={targetContractAddress} type={CYAN} hasIcon />
              </span>
            </div>
          </article>

          <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
            <Icon id="sign" />
            Sign
          </NewButton>
        </div>
      </CouncilPendingStyled>
    )
  }

  // 2/3
  if (isAddVestee) {
    const cliffInMonths = findActionByName('cliffInMonths')
    const vestingInMonths = findActionByName('vestingInMonths')
    const totalAllocatedAmount = findActionByName('totalAllocatedAmount')
    const vesteeAddress = findActionByName('vesteeAddress', BYTES_ADDRESS_TYPE)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Vestee Address</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={vesteeAddress} type={CYAN} hasIcon />
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

          <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
            <Icon id="sign" />
            Sign
          </NewButton>
        </div>
      </CouncilPendingStyled>
    )
  }

  // 2/3
  if (isUpdateVestee) {
    const newCliffInMonths = findActionByName('newCliffInMonths')
    const newVestingInMonths = findActionByName('newVestingInMonths')
    const newTotalAllocatedAmount = findActionByName('newTotalAllocatedAmount')
    const vesteeAddress = findActionByName('vesteeAddress', BYTES_ADDRESS_TYPE)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Vestee Address</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={vesteeAddress} type={CYAN} hasIcon />
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

          <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
            <Icon id="sign" />
            Sign
          </NewButton>
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
                <TzAddress tzAddress={treasuryAddress} type={CYAN} hasIcon />
              </span>
            </article>
            <article>
              <p>Token Contract Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={tokenContractAddress} type={CYAN} hasIcon />
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
                <button className="parameters-link" onClick={() => setShowing(true)}>
                  Read Request
                </button>
              </article>
            )}

            <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
              <Icon id="sign" />
              Sign
            </NewButton>
          </div>
        </CouncilPendingStyled>
        {showing ? createPortal(modal, document?.body) : null}
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
                <TzAddress tzAddress={receiverAddress} type={CYAN} hasIcon />
              </span>
            </article>
            <article>
              <p>Token Contract Address</p>
              <span className="parameters-value content-width">
                <TzAddress tzAddress={tokenContractAddress} type={CYAN} hasIcon />
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
                <button className="parameters-link" onClick={() => setShowing(true)}>
                  Read Request
                </button>
              </article>
            )}

            <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
              <Icon id="sign" />
              Sign
            </NewButton>
          </div>
        </CouncilPendingStyled>
        {showing ? createPortal(modal, document?.body) : null}
      </>
    )
  }

  // 2/3
  if (isRequestMint) {
    const tokenAmount = findActionByName('tokenAmount')
    const treasuryAddress = findActionByName('treasuryAddress', BYTES_ADDRESS_TYPE)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <article>
            <p>Treasury Address</p>
            <span className="parameters-value content-width">
              <TzAddress tzAddress={treasuryAddress} type={CYAN} hasIcon />
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
              <button className="parameters-link" onClick={() => setShowing(true)}>
                Read Request
              </button>
            </article>
          )}

          <article />

          <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
            <Icon id="sign" />
            Sign
          </NewButton>
        </div>
        {showing ? createPortal(modal, document?.body) : null}
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
    console.log({ value, name, valuelength: value.length, parameters, actionType })
    let address = findAddress(actionType)

    return (
      <CouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <span className="number">{cardNumber}</span>
        <h3>{getSeparateCamelCase(actionType)}</h3>
        <div className="parameters">
          <div>
            <p className="parameters-name">{getSeparateCamelCase(name)}</p>
            <span className="parameters-value content-width">
              {
                // TODO: remove isSetBaker condition after fix baker address
              }
              {isSetBaker ? address : <TzAddress tzAddress={address} type={CYAN} hasIcon />}
            </span>
          </div>
          <div>
            <p>Signed</p>
            <span className="parameters-value content-width">
              {signersCount}/{numCouncilMembers}
            </span>
          </div>
        </div>

        <div className="g-centering">
          <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
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

      <div className="g-centering">
        <NewButton className="sign-btn" kind={ACTION_PRIMARY} onClick={onClickSign}>
          <Icon id="sign" />
          Sign
        </NewButton>
      </div>
    </CouncilPendingStyled>
  )
}
