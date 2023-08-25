import { useCallback, useMemo, useState } from 'react'
import { SlidingTabButtonType, SlidingTabButtons } from '../SlidingTabButtons/SlidingTabButtons.controller'
import { chartsPeriodArr } from 'consts/charts.const'
import { ChartPeriodType } from 'types/charts.type'
import { ChartsSwitherWrapper } from './ChartSwitcher.style'
import { ChartSwitcherAlignmentType } from './chartSwitcher.types'
import { ALIGN_LEFT } from './chartSwitcher.consts'

type ChartSwitcherProps = {
  currentPeriod?: ChartPeriodType
  setCurrentPeriod: (period: ChartPeriodType) => void
}

export const ChartSwitcher = ({ setCurrentPeriod, currentPeriod }: ChartSwitcherProps) => {
  // chartsPeriodArr
  const [activeTabId, setActiveTabId] = useState(0)

  const tabItems: SlidingTabButtonType[] = useMemo(
    () =>
      chartsPeriodArr.map((period, idx) => {
        return {
          text: period,
          id: idx,
          active: currentPeriod === period ?? idx === activeTabId,
        }
      }),
    [activeTabId, currentPeriod],
  )

  const handleTabSwitch = useCallback(
    (tabId: number) => {
      setActiveTabId(tabId)

      // tabId is the same as index of chartsPeriodArr, so we can use it to avoid function recreation.
      setCurrentPeriod(chartsPeriodArr[tabId])
    },
    [setCurrentPeriod],
  )

  return <SlidingTabButtons tabItems={tabItems} onClick={handleTabSwitch} />
}

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
