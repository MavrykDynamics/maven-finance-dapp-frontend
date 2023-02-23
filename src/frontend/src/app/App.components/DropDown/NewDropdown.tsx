import { useRef, useEffect, useState } from 'react'
import { useClickAway } from 'react-use'

// styles
import { DropDownStyled, DropDownMenu, DropDownListContainer, DropDownList, DropDownListItem } from './DropDown.style'

// components
import Icon from '../Icon/Icon.view'

// helpers
import { scrollToFullView } from 'utils/scrollToFullView'
import { DropDownJsxChild } from 'pages/Loans/Components/Modals/Modals.style'
import { ImageWithPlug } from '../Icon/ImageWithPlug'

export type DDItemId = number | string
export type DropDownItemType = {
  content: React.ReactNode
  id: DDItemId
  disabled?: boolean
}

type DropDownProps = {
  clickItem: (id: DDItemId) => void
  placeholder: string
  disabled?: boolean
  activeItem?: DropDownItemType
  items: readonly DropDownItemType[]
  className?: string
}

export const DropDown = ({ placeholder, clickItem, items, activeItem, className, disabled = false }: DropDownProps) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const refDropdownWrapper = useRef<HTMLDivElement | null>(null)
  useClickAway(refDropdownWrapper, () => setIsDropDownOpen(false))

  // if the dropdown is not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (isDropDownOpen) {
      scrollToFullView(ref.current)
    }
  }, [isDropDownOpen])

  return (
    <DropDownStyled ref={refDropdownWrapper} className={`drop-down ${className} ${disabled ? 'disabled' : ''}`}>
      <DropDownMenu id={'selected-option'} onClick={() => setIsDropDownOpen(!isDropDownOpen)}>
        {activeItem?.content ?? placeholder}
        <span>
          <Icon className={isDropDownOpen ? 'open' : ''} id="arrow-down" />
        </span>
      </DropDownMenu>
      {isDropDownOpen && (
        <DropDownListContainer ref={ref} id={'dropDownListContainer'}>
          <DropDownList className="scroll-block">
            {items.map(({ id, content, disabled }) => {
              return (
                <DropDownListItem
                  onClick={() => {
                    if (!disabled) {
                      clickItem(id)
                      setIsDropDownOpen(false)
                    }
                  }}
                  key={id}
                  disabled={disabled}
                >
                  {content} {activeItem?.id === id ? <Icon id="check-stroke" /> : null}
                </DropDownListItem>
              )
            })}
          </DropDownList>
        </DropDownListContainer>
      )}
    </DropDownStyled>
  )
}

export const DropdownInputCustomChild = ({ iconSrc, symbol }: { iconSrc: string; symbol: string }) => (
  <DropDownJsxChild>
    <div className="flex-row with-image">
      <ImageWithPlug alt={symbol + ' logo'} imageLink={iconSrc} />
      {symbol}
    </div>
  </DropDownJsxChild>
)
