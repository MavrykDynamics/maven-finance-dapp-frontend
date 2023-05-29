export const LENDING_APY = (asset: string) => `You will receive m${asset} instead of your ${asset}`
export const USER_AVAILABLE_BORROW = (asset: string) =>
  `The total available borrow across all of your vaults for the ${asset} market. Please note, this number does not factor in the borrow capacity of the market itself so this number can be significantly higher than the current borrow capacity of the market and thus your vaults.`
export const INTEREST_EARNED = 'Total yield you have earned to date.'
export const M_TOKEN_BALANCE = (asset: string) =>
  `Your current balance of m${asset} you have in the pool. This is the same amount that you have the in Supplied Amount.`
export const SUPPLIED_AMOUNT = (asset: string) =>
  `Total ${asset} you have supplied to the pool included yield earned on your deposit.`
export const EARN_APY = 'Current yield suppliers are earning on their deposits.'
