import Arrow from './svg/Arrow'
import Backdrop from './svg/Backdrop'
import Gradient from './svg/Gradient'

import { GaugeChartStyled, ArrowStyled, ValueWrapper } from './GaugeChart.style'

type GaugeChartProps = {
  children: React.ReactNode
}

export const GaugeChart = ({ children }: GaugeChartProps) => {
  return (
    <GaugeChartStyled>
      <Gradient className="gradient" />
      <Backdrop className="backdrop" />

      <ValueWrapper>{children}</ValueWrapper>
      <ArrowStyled angle={0}>
        <Arrow />
      </ArrowStyled>
    </GaugeChartStyled>
  )
}
