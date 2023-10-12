import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { useScroll } from 'react-use'

// view
import Portal from 'app/App.components/popup/Portal'
import { PopupContainer } from 'app/App.components/popup/PopupMain.style'
import { CouncilActionPurposePopupContent } from 'app/App.components/popup/bases/CouncilPopup.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

export const ActionPurposePopup = ({ closePopup, purpose }: { closePopup: () => void; purpose: string | null }) => {
  const scrollRef = useRef<null | HTMLDivElement>(null)
  const { y: scrolledY } = useScroll(scrollRef)
  const [removeShadow, setRemoveShadow] = useState(false)

  useEffect(() => {
    setRemoveShadow(
      scrollRef.current
        ? Math.floor(scrollRef.current.scrollHeight - scrollRef.current.offsetHeight) <= Math.ceil(scrolledY)
        : false,
    )
  }, [scrolledY, scrollRef.current?.scrollHeight, scrollRef.current?.offsetHeight])

  return (
    <Portal>
      <PopupContainer onClick={closePopup} show={Boolean(purpose)}>
        <CouncilActionPurposePopupContent onClick={(e) => e.stopPropagation()}>
          <button onClick={closePopup} className="close-modal" />
          <H2Title>Purpose for Request</H2Title>
          <div className="purpose scroll-block" ref={scrollRef}>
            <p>{purpose}</p>
            <div className={classNames('shadow', { removeShadow })} />
          </div>
        </CouncilActionPurposePopupContent>
      </PopupContainer>
    </Portal>
  )
}
