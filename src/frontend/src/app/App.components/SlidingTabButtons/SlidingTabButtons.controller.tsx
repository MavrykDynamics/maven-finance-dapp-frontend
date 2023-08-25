import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'

import { ButtonStyled, SlidingTabButtonsStyled } from './SlidingTabButtons.style'
import { PRIMARY_SLIDING_TAB_BUTTONS, SlidingTabButtonsKindsType } from './SlidingTabButtons.conts'

export interface SlidingTabButtonType {
  text: string
  id: number
  active: boolean
  disabled?: boolean
  path?: string
}

type SlidingTabButtonsProps = {
  tabItems: SlidingTabButtonType[]
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
    tabItems.find(({ active, disabled }) => active && !disabled)?.id ?? tabItems[0]?.disabled
      ? tabItems[0]?.id
      : undefined,
  )

  useEffect(() => {
    const foundActiveTabId = tabItems.find(({ active, disabled }) => active && !disabled)?.id
    if (typeof foundActiveTabId === 'number') {
      setActiveTab(foundActiveTabId)
    }
  }, [tabItems])

  const clickHandler = useCallback(
    (tabId: number) => {
      if (disabled) return
      setActiveTab(tabId)
      onClick(tabId)
    },
    [disabled, onClick],
  )

  return (
    <SlidingTabButtonsStyled className={classNames(className, kind, { disabled: disabled })}>
      {tabItems.map((tabItem) => (
        <ButtonStyled
          key={tabItem.id}
          onClick={() => clickHandler(tabItem.id)}
          className={classNames(kind, { selected: activeTab === tabItem.id }, { disabled: tabItem.disabled })}
        >
          {tabItem.text}
        </ButtonStyled>
      ))}
    </SlidingTabButtonsStyled>
  )
}
