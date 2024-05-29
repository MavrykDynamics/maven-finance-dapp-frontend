import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { ImpactSignMapper } from './Impact.conts'
import { ImpactStyled } from './Impact.style'

export const Impact = ({ value, endingText }: { value: number; endingText?: string }) => {
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''

  return (
    <ImpactStyled $impact={ImpactSignMapper[sign]}>
      {<CommaNumber value={Math.abs(value)} beginningText={sign} endingText={endingText} />}
    </ImpactStyled>
  )
}
