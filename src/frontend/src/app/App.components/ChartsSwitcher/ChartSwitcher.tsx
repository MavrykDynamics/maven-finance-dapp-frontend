import { memo, useCallback, useMemo } from 'react'

// view
import { SlidingTabButtonType, SlidingTabButtons } from '../SlidingTabButtons/SlidingTabButtons.controller'
import { ChartsSwitherWrapper } from './ChartSwitcher.style'

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
}

// TODO try to play with state to avoid blinks between diff screen switched
export const ChartSwitcher = memo(({ setCurrentPeriod, currentPeriod, size }: ChartSwitcherProps) => {
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

  return <SlidingTabButtons tabItems={tabItems} onClick={handleTabSwitch} size={size} />
})

type ChartSwitherWithPositionProps = ChartSwitcherProps & {
  align?: ChartSwitcherAlignmentType
  space?: number
}

export const ChartsSwitherWithPosition = ({
  align = ALIGN_LEFT,
  space = 20,
  ...props
}: ChartSwitherWithPositionProps) => {
  return (
    <ChartsSwitherWrapper align={align} space={space}>
      <ChartSwitcher {...props} />
    </ChartsSwitherWrapper>
  )
}
