// components
import { Chart } from 'app/App.components/Chart/Chart.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// styles
import { EarnBorrowChartStyled } from '../LoansEarnBorrow.styles'

// helpers
import { CHART_COLORS, MINI_CHART_SETTINGS } from '../LoansEarnBorrow.consts'
import { BUTTON_THIRD, BUTTON_ROUND } from 'app/App.components/Button/Button.constants'

// types
import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import { useState } from 'react'

type Props = {
  data: ChartPlotType[]
}

export const EarnBorrowChart = ({ data }: Props) => {
  const [isGraph, setIsGraph] = useState(false)

  return (
    <EarnBorrowChartStyled className={isGraph ? 'isGraph' : ''}>
      <div className="switchMenu">
        <span>Supply Vol / 14 Days</span>

        <Button kind={BUTTON_THIRD} form={BUTTON_ROUND} onClick={() => setIsGraph(!isGraph)}>
          <Icon id={isGraph ? 'graph' : 'chart'} />
        </Button>
      </div>

      <Chart
        data={data}
        colors={CHART_COLORS}
        settings={MINI_CHART_SETTINGS}
        numberOfItemsToDisplay={3}
      />
    </EarnBorrowChartStyled>
  )
}
