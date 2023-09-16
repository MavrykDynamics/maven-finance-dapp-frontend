import { isNumberInRange } from 'utils/validatorFunctions'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

export const stakingInputValidation = ({
  amount,
  myMvkTokenBalance,
  mySMvkTokenBalance,
  userAddress,
}: {
  amount: number
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  userAddress: string | null
}) => {
  if (amount === 0) return ''

  return isNumberInRange(
    amount,
    1,
    userAddress ? Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)) : undefined,
  )
    ? INPUT_STATUS_SUCCESS
    : INPUT_STATUS_ERROR
}
