import { useEffect, useState, useRef } from 'react'

// view
import Icon from '../Icon/Icon.view'

// style
import { ExpandStyled, ExpandArticleStyled } from './Expand.style'

// helpers
import { scrollToFullView } from '../../../utils/scrollToFullView'

type Props = {
  children: React.ReactNode
  header?: React.ReactNode
  sufix?: React.ReactNode
  className?: string
  showCustomText?: string
  isExpandedByDefault?: boolean
  onClickCallback?: () => void
  showText?: boolean
  getExpandedStatus?: (arg: boolean) => void
}

export default function Expand({
  children,
  header = null,
  className = '',
  showCustomText = '',
  sufix = null,
  isExpandedByDefault = false,
  onClickCallback,
  showText = false,
  getExpandedStatus,
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const handleToggleExpand = () => {
    setExpanded(!expanded)

    if (getExpandedStatus) {
      getExpandedStatus(!expanded)
    }
  }
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setExpanded(isExpandedByDefault)
  }, [isExpandedByDefault])

  // if the children are not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (expanded) {
      scrollToFullView(ref.current)
    }
  }, [expanded])

  return (
    <ExpandStyled className={className}>
      <header className="expand-header">
        {header}
        <div className={`arrow-wrap ${expanded ? 'top' : 'bottom'}`}>
        {showText ? <span>{expanded ? 'Hide' : 'Show'}</span> : null}
          {showCustomText ? <span>{showCustomText}</span> : null}
          <div
            className="expand-btn"
            onClick={() => {
              handleToggleExpand()
              onClickCallback && onClickCallback()
            }}
          >
            Details <Icon id="arrow-down" />
          </div>
        </div>
        {sufix}
      </header>
      <ExpandArticleStyled ref={ref} show={expanded}>
        {children}
      </ExpandArticleStyled>
    </ExpandStyled>
  )
}
