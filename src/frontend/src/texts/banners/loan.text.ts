export const LENDING_TAB_SUPPLY_TEXT = (asset: string) =>
  `Earn yield by supplying assets to Mavryk’s lending pools. Loans are secured by 200% collateral.${
    asset.toLowerCase() === 'xtz' ? ' Supplied XTZ is automatically delegated to the Mavryk Finance DAO Bakery.' : ''
  }`
  
export const LENDING_TAB_WITHDRAW_TEXT =
  'Input the amount you wish to withdraw from earning. You cannot withdraw more than you have supplied in this earn market.'
