import { memo, useCallback, useMemo } from 'react'

// view
import { SlidingTabButtons, SlidingTabButtonType } from '../SlidingTabButtons/SlidingTabButtons.controller'
import { ChartsSwitcherWrapper } from './ChartSwitcher.style'

// consts
import { chartsPeriodArr } from 'consts/charts.const'
import { ALIGN_LEFT } from './chartSwitcher.consts'

// types
import { ChartPeriodType } from 'types/charts.type'
import { ChartSwitcherAlignmentType } from './chartSwitcher.types'
import { SlidingTabButtonsSizesType } from '../SlidingTabButtons/SlidingTabButtons.conts'

type ChartSwitcherProps = {
  currentPeriod?: ChartPeriodType
  setCurrentPeriod: (period: ChartPeriodType) => void
  size?: SlidingTabButtonsSizesType
  disabled?: boolean
}

// TODO try to play with state to avoid blinks between diff screen switched
export const ChartSwitcher = memo(({ setCurrentPeriod, currentPeriod, size, disabled }: ChartSwitcherProps) => {
  const tabItems: SlidingTabButtonType[] = useMemo(
    () =>
      chartsPeriodArr.map((period, idx) => {
        return {
          text: period,
          id: idx,
          active: currentPeriod === period,
        }
      }),
    [currentPeriod],
  )

  const handleTabSwitch = useCallback(
    (tabId: number) => {
      // tabId is the same as index of chartsPeriodArr, so we can use it to avoid function recreation.
      setCurrentPeriod(chartsPeriodArr[tabId])
    },
    [setCurrentPeriod],
  )

  return <SlidingTabButtons tabItems={tabItems} disabled={disabled} onClick={handleTabSwitch} size={size} />
})

type ChartSwitcherWithPositionProps = ChartSwitcherProps & {
  align?: ChartSwitcherAlignmentType
  space?: number
  disabled?: boolean
}

export const ChartsSwitcherWithPosition = ({
  align = ALIGN_LEFT,
  space = 20,
  ...props
}: ChartSwitcherWithPositionProps) => {
  return (
    <ChartsSwitcherWrapper align={align} space={space}>
      <ChartSwitcher {...props} />
    </ChartsSwitcherWrapper>
  )
}
