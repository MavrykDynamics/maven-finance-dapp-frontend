import { Info } from 'app/App.components/Info/Info.view'
import { useContractErrorContext } from '../contractError.provider'
import { ContractErrorBlockStyled } from './ContractErrorBlock.styles'
import { ContractErrorKeys } from '../contractError.const'

type ContractErrorBlockProps = {
  type: ContractErrorKeys
}

export const ContractErrorBlock = ({ type }: ContractErrorBlockProps): JSX.Element | null => {
  const { errors } = useContractErrorContext()
  const error = errors[type]

  return error ? (
    <ContractErrorBlockStyled>
      <Info type="error" text={error.description} className="infoBlockSmall" />
    </ContractErrorBlockStyled>
  ) : null
}
