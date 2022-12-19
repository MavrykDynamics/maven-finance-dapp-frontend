import { useRef, useEffect } from 'react'
import { useClickAway } from 'react-use'

// styles
import { DropDownStyled, DropDownMenu, DropDownListContainer, DropDownList, DropDownListItem } from './DropDown.style'

// components
import Icon from '../Icon/Icon.view'

// helpers
import { scrollToFullView } from 'utils/scrollToFullView'

type DropDownViewProps = {
  placeholder: string
  clickItem: (value: string) => void
  isOpen: boolean
  disabled?: boolean
  setIsOpen: (arg: boolean) => void
  itemSelected: string | undefined
  items: readonly string[]
  className?: string
}

export const DropDownView = ({
  placeholder,
  isOpen,
  setIsOpen,
  clickItem,
  itemSelected,
  items,
  className,
  disabled = false,
}: DropDownViewProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const refDropdownWrapper = useRef<HTMLDivElement | null>(null)
  useClickAway(refDropdownWrapper, () => setIsOpen(false))

  // if the dropdown is not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (isOpen) {
      scrollToFullView(ref.current)
    }
  }, [isOpen])
  return (
    <DropDownStyled ref={refDropdownWrapper} className={`drop-down ${className} ${disabled ? 'disabled' : ''}`}>
      <DropDownMenu
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        {itemSelected ?? placeholder}
        <span>
          <Icon className={isOpen ? 'open' : ''} id="arrow-down" />
        </span>
      </DropDownMenu>
      {isOpen && (
        <DropDownListContainer ref={ref} id={'dropDownListContainer'}>
          <DropDownList className="scroll-block">
            {items.map((value, idx) => {
              const isActive = itemSelected === value
              return (
                <DropDownListItem onClick={() => clickItem(value)} key={`${idx}-${value}`}>
                  {value} {isActive ? <Icon id="check-stroke" /> : null}
                </DropDownListItem>
              )
            })}
          </DropDownList>
        </DropDownListContainer>
      )}
    </DropDownStyled>
  )
}
