import { useEffect, useState } from 'react'
import classNames from 'classnames'

import { ButtonStyled, SlidingTabButtonsStyled } from './SlidingTabButtons.style'
import { PRIMARY_SLIDING_TAB_BUTTONS, SlidingTabButtonsKindsType } from './SlidingTabButtons.conts'

export interface TabItem {
  text: string
  id: number
  active: boolean
  isDisabled?: boolean
  path?: string
}

type SlidingTabButtonsProps = {
  tabItems: TabItem[]
  onClick: (tabId: number) => void
  kind?: SlidingTabButtonsKindsType
  disabled?: boolean
  className?: string
}

export const SlidingTabButtons = ({
  tabItems = [],
  onClick,
  kind = PRIMARY_SLIDING_TAB_BUTTONS,
  className,
  disabled = false,
}: SlidingTabButtonsProps) => {
  // if we found active item by default set it, othervise set first item active, if it's not disabled
  const [activeTab, setActiveTab] = useState<number | undefined>(
    tabItems.find(({ active, isDisabled }) => active && !isDisabled)?.id ?? tabItems[0]?.isDisabled
      ? tabItems[0]?.id
      : undefined,
  )

  useEffect(() => {
    const foundActiveTabId = tabItems.find(({ active, isDisabled }) => active && !isDisabled)?.id
    if (typeof foundActiveTabId === 'number') {
      setActiveTab(foundActiveTabId)
    }
  }, [tabItems])

  const clickHandler = (tabId: number) => {
    if (disabled) return
    setActiveTab(tabId)
    onClick(tabId)
  }

  return (
    <SlidingTabButtonsStyled className={classNames(className, kind, { disabled: disabled })}>
      {tabItems.map((tabItem) => (
        <ButtonStyled
          key={tabItem.id}
          onClick={() => clickHandler(tabItem.id)}
          className={classNames(kind, { selected: activeTab === tabItem.id })}
        >
          {tabItem.text}
        </ButtonStyled>
      ))}
    </SlidingTabButtonsStyled>
  )
}
