export const LIQUIDATION_PRICE = 'Price value of your vault’s collateral at which your vault can be liquidated.'
export const LIQUIDATION_COST = 'How much it will cost to liquidated this vault.'
export const VAULT_RISK = 'The level of risk of being liquidated your vault is at.'
export const TOTAL_AMOUNT =
  'Total amount you are borrowing, a portion of which is paid to the treasury as the DAO fee. The amount you will actually receive is the Total Amount minus the DAO fee'
export const DAO_FEE =
  'Amount paid to the DAO as the origination fee for borrowing. Each time you borrow, a fee is paid.'
export const AVALIABLE_TO_BORROW =
  'The available to borrow metric takes 2 separate values into account. The borrow capacity of your vault AND the availableLiquidity of the asset pool your vault is borrowing from. The equation used is: min(avaliableLiquidity, vaultCollateralValue / 2 - borrowedAmount)'
export const FEES_DUE = (feesAmount: number) =>
  `Your current interest fee of ${feesAmount} was rounded to ${Math.ceil(
    feesAmount,
  )}. Any overpaid amount will automatically be refunded.`
export const OUTSTANDING_DEBT =
  'Outstanding debt + any accrued interest since the last time you interacted with your vault’s smart contract.'
export const COLLATERAL_VALUE =
  'The summed dollar value of all of the collateral assets your have deposited into this vault.'
export const ACCRUED_INTEREST = 'Interest compounded overtime, every time you borrow.'
export const APR = 'Current interest rate being charged to borrowers.'
export const BORROW_CAPACITY =
  'How much you are able to borrow given your current collateral ratio including the amount you wish to borrow and the total amount available to borrow from the pool.'
