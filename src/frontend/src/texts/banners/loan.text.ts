export const LENDING_TAB_SUPPLY_TEXT = (asset: string) =>
  `Earn yield by supplying assets to Mavryk’s lending pools. Loans are secured by 200% collateral.${
    asset.toLowerCase() === 'xtz' ? ' Supplied XTZ is automatically delegated to the Mavryk Finance DAO Bakery.' : ''
  }`

export const LENDING_TAB_WITHDRAW_TEXT =
  'Input the amount you wish to withdraw from Mavryk Finance’s lending pools. You cannot withdraw more than you have deposited or is available from the reserve amount.'

export const LENDING_TAB_WITHDRAW_ERROR_TEXT =
  'Insufficient available funds to withdraw, Use Max enters the max amount available to withdraw.'
