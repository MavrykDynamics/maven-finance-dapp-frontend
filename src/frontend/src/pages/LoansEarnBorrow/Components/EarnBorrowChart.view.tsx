import { useMemo, useState } from 'react'

// components
import { Chart } from 'app/App.components/Chart/Chart'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// styles
import { EarnBorrowChartStyled } from '../LoansEarnBorrow.styles'
import colors from 'styles/colors'

// helpers
import { MINI_CHART_SETTINGS, numberOfItemsToDisplay } from '../LoansEarnBorrow.consts'
import { BUTTON_THIRD, BUTTON_ROUND } from 'app/App.components/Button/Button.constants'
import { AREA_CHART_TYPE, HISTOGRAM_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'
import { CURRENCY_AMOUNT_DATE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// types
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

type ChartDataType = {
  type: typeof AREA_CHART_TYPE | typeof HISTOGRAM_CHART_TYPE
  plots: AreaChartPlotType[]
}

type Props = {
  data: AreaChartPlotType[]
}

export const EarnBorrowChart = ({ data }: Props) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const [isGraph, setIsGraph] = useState(false)

  const CHART_COLORS = useMemo(
    () => ({
      lineColor: colors[themeSelected].primaryChartColor,
      areaTopColor: colors[themeSelected].primaryChartColor,
      areaBottomColor: colors[themeSelected].primaryChartBottomColor,
      textColor: colors[themeSelected].regularText,
    }),
    [themeSelected],
  )

  const chartData: ChartDataType = { type: isGraph ? HISTOGRAM_CHART_TYPE : AREA_CHART_TYPE, plots: data }
  const showChart = chartData.plots.length >= numberOfItemsToDisplay

  return (
    <EarnBorrowChartStyled>
      {showChart && (
        <div className="switchMenu">
          <span>Supply Vol / 14 Days</span>

          <Button kind={BUTTON_THIRD} form={BUTTON_ROUND} onClick={() => setIsGraph(!isGraph)}>
            <Icon id={isGraph ? 'graph' : 'chart'} />
          </Button>
        </div>
      )}

      <Chart
        data={chartData}
        colors={CHART_COLORS}
        settings={MINI_CHART_SETTINGS}
        numberOfItemsToDisplay={numberOfItemsToDisplay}
        tooltipAsset="$"
        tooltipName={CURRENCY_AMOUNT_DATE_TOOLTIP}
      />
    </EarnBorrowChartStyled>
  )
}
