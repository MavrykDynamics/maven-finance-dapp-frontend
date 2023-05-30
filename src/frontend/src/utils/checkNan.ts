/**
 * 
 * @param amount is a number for check.
 * @returns if the number equal NaN return 0, otherwise we return the current number
 */
export const checkNan = (amount: number) => isNaN(amount) ? 0 : amount