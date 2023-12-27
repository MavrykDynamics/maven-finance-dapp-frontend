import { isNumberInRange } from 'utils/validatorFunctions'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

export const stakingInputValidation = ({
  amount,
  myMvnTokenBalance,
  mySMvnTokenBalance,
  userAddress,
}: {
  amount: number
  myMvnTokenBalance: number
  mySMvnTokenBalance: number
  userAddress: string | null
}) => {
  return isNumberInRange(
    amount,
    1,
    userAddress ? Math.max(Number(myMvnTokenBalance), Number(mySMvnTokenBalance)) : undefined,
  )
    ? INPUT_STATUS_SUCCESS
    : INPUT_STATUS_ERROR
}
