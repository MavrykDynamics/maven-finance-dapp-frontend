import { useRef, useEffect } from 'react'
import { useClickAway } from 'react-use'

// styles
import { DropDownStyled, DropDownMenu, DropDownListContainer, DropDownList, DropDownListItem } from './DropDown.style'

// components
import Icon from '../Icon/Icon.view'

// helpers
import { scrollToFullView } from 'utils/scrollToFullView'

export type DropDownItemType = {
  content: React.ReactNode
  id: number
}

type DropDownProps = {
  clickItem: (id: number) => void
  setIsOpen: (arg: boolean) => void
  placeholder: string
  isOpen: boolean
  disabled?: boolean
  activeItem?: DropDownItemType
  items: readonly DropDownItemType[]
  className?: string
}

export const DropDown = ({
  placeholder,
  isOpen,
  setIsOpen,
  clickItem,
  items,
  activeItem,
  className,
  disabled = false,
}: DropDownProps) => {
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
        {activeItem?.content ?? placeholder}
        <span>
          <Icon className={isOpen ? 'open' : ''} id="arrow-down" />
        </span>
      </DropDownMenu>
      {isOpen && (
        <DropDownListContainer ref={ref} id={'dropDownListContainer'}>
          <DropDownList className="scroll-block">
            {items.map(({ id, content }) => {
              return (
                <DropDownListItem onClick={() => clickItem(id)} key={id}>
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
