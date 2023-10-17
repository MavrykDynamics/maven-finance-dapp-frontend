import classNames from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLockBodyScroll, useScroll } from 'react-use'

// view
import Portal from 'app/App.components/popup/Portal'
import { PopupContainer } from 'app/App.components/popup/PopupMain.style'
import { CouncilActionReadMorePopupContent } from 'app/App.components/popup/bases/CouncilPopup.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

// hooks
import { useContractStatusesContext } from 'providers/ContractStatuses/ContractStatuses.provider'

export const ACTION_READ_MORE_PURPOSE = 'ACTION_READ_MORE_PURPOSE'
export const ACTION_READ_MORE_CONTRACTS_LIST = 'ACTION_READ_MORE_CONTRACTS_LIST'

export type ActionReadMorePopupDataType =
  | {
      contentType: typeof ACTION_READ_MORE_PURPOSE
      purposeText: string
      constractsList?: never
    }
  | {
      contentType: typeof ACTION_READ_MORE_CONTRACTS_LIST
      constractsList: Array<string>
      purposeText?: never
    }

type Props = {
  closePopup: () => void
  popupContentData: ActionReadMorePopupDataType | null
}

/**
 * NOTE: contractStatuses should be subscribed in the page file
 */
export const ActionReadMorePopup = ({ closePopup, popupContentData }: Props) => {
  const { contractStatuses } = useContractStatusesContext()
  const scrollRef = useRef<null | HTMLDivElement>(null)
  const { y: scrolledY } = useScroll(scrollRef)
  const [removeShadow, setRemoveShadow] = useState(false)

  const isPopupShown = Boolean(popupContentData)

  useLockBodyScroll(isPopupShown)

  const mappedContractAddresses = useMemo(
    () =>
      contractStatuses.reduce<Record<string, string>>((acc, { address: contractAddress, title: contractName }) => {
        acc[contractAddress] = contractName
        return acc
      }, {}),
    [contractStatuses],
  )

  useEffect(() => {
    setRemoveShadow(
      scrollRef.current
        ? Math.floor(scrollRef.current.scrollHeight - scrollRef.current.offsetHeight) <= Math.ceil(scrolledY)
        : false,
    )
  }, [scrolledY, scrollRef.current?.scrollHeight, scrollRef.current?.offsetHeight])

  const popupTitleText =
    popupContentData?.contentType === ACTION_READ_MORE_PURPOSE
      ? 'Purpose For Request'
      : popupContentData?.contentType === ACTION_READ_MORE_CONTRACTS_LIST
      ? 'Selected Contracts For Request'
      : ''

  return (
    <Portal>
      <PopupContainer onClick={closePopup} show={isPopupShown}>
        <CouncilActionReadMorePopupContent onClick={(e) => e.stopPropagation()}>
          <button onClick={closePopup} className="close-modal" />
          <H2Title>{popupTitleText}</H2Title>
          <div className="content-wrapper scroll-block" ref={scrollRef}>
            {popupContentData?.contentType === ACTION_READ_MORE_PURPOSE ? <p>{popupContentData.purposeText}</p> : null}
            {popupContentData?.contentType === ACTION_READ_MORE_CONTRACTS_LIST ? (
              <div className="contracts-grid">
                {popupContentData.constractsList.map((contractAddress) => {
                  const contractName = mappedContractAddresses[contractAddress]
                  if (!contractName) return null
                  return (
                    <>
                      <div className="contract-address" key={`${contractAddress}-address`}>
                        <TzAddress tzAddress={contractAddress} hasIcon />
                      </div>
                      <div className="contract-name" key={`${contractAddress}-name`}>
                        – {contractName}
                      </div>
                    </>
                  )
                })}
              </div>
            ) : null}
            <div className={classNames('shadow', { removeShadow })} />
          </div>
        </CouncilActionReadMorePopupContent>
      </PopupContainer>
    </Portal>
  )
}
