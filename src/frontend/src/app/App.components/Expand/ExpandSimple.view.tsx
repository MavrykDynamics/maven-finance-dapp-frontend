import { useEffect, useState, useRef } from 'react'

// view
import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'

// style
import { ExpandStyled, ExpandArticleStyled } from './Expand.style'

// helpers
import { scrollToFullView } from '../../../utils/scrollToFullView'
import { BUTTON_SIMPLE_SMALL } from '../Button/Button.constants'

type Props = {
  children: React.ReactNode
  header?: React.ReactNode
  sufix?: React.ReactNode
  className?: string
  expanded: boolean
  showCustomText?: string
  isExpandedByDefault?: boolean
  onClick: () => void
  showText?: boolean
  getExpandedStatus?: (arg: boolean) => void
  openButtonName?: string
}

export default function ExpandSimple({
  children,
  header = null,
  expanded,
  className = '',
  showCustomText = '',
  sufix = null,
  onClick,
  showText = false,
  openButtonName = 'Details',
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  // if the children are not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (expanded) {
      scrollToFullView(ref.current, 'nearest')
    }
  }, [expanded])

  return (
    <ExpandStyled ref={ref} className={className}>
      <header className="expand-header">
        {header}
        <div className={`arrow-wrap ${expanded ? 'top' : 'bottom'}`}>
          {showText ? <span>{expanded ? 'Hide' : 'Show'}</span> : null}
          {showCustomText ? <span>{showCustomText}</span> : null}
          <Button onClick={onClick} kind={BUTTON_SIMPLE_SMALL}>
            {openButtonName} <Icon id="simple-arrow-down" />
          </Button>
        </div>
        {sufix}
      </header>
      <ExpandArticleStyled show={expanded}>{children}</ExpandArticleStyled>
    </ExpandStyled>
  )
}
