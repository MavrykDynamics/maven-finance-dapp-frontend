import { Info } from 'app/App.components/Info/Info.view'
import { useErrorContext } from '../../error.provider'
import { ContractErrorBlockStyled } from './ContractErrorBlock.styles'
import { ContractErrorKeys } from '../../consts/error.provider.const'

type ContractErrorBlockProps = {
  type: ContractErrorKeys
}

export const ContractErrorBlock = ({ type }: ContractErrorBlockProps): JSX.Element | null => {
  const { errors } = useErrorContext()
  const error = errors[type]

  return error ? (
    <ContractErrorBlockStyled>
      <Info type="error" text={error.description} className="infoBlockSmall" />
    </ContractErrorBlockStyled>
  ) : null
}
