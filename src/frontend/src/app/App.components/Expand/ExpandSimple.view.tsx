import { useEffect, useRef } from 'react'

// view
import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'

// style
import { ExpandStyled, ExpandArticleStyled } from './Expand.style'

// helpers
import { scrollToFullView } from '../../../utils/scrollToFullView'
import { BUTTON_SIMPLE_SMALL } from '../Button/Button.constants'

type Props = {
  isExpanded: boolean
  onClick: () => void

  header?: React.ReactNode
  sufix?: React.ReactNode
  children: React.ReactNode

  showText?: boolean
  showCustomText?: string
  openButtonName?: string
  className?: string
}

export default function ExpandSimple({
  isExpanded,
  onClick,

  header = null,
  sufix = null,
  children,

  showText = false,
  showCustomText = '',
  openButtonName = 'Details',
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  // if the children are not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (!isExpanded) return
    scrollToFullView(ref.current, 'nearest')
  }, [isExpanded])

  return (
    <ExpandStyled ref={ref} className={className}>
      <header className="expand-header">
        {header}
        <div className={`arrow-wrap ${isExpanded ? 'top' : 'bottom'}`}>
          {showText ? <span>{isExpanded ? 'Hide' : 'Show'}</span> : null}
          {showCustomText ? <span>{showCustomText}</span> : null}
          <Button onClick={onClick} kind={BUTTON_SIMPLE_SMALL}>
            {openButtonName} <Icon id="simple-arrow-down" />
          </Button>
        </div>
        {sufix}
      </header>
      {isExpanded && <ExpandArticleStyled show={isExpanded}>{children}</ExpandArticleStyled>}
    </ExpandStyled>
  )
}
