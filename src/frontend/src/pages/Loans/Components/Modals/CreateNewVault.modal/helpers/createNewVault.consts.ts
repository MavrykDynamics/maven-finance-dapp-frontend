import { VaultType } from 'providers/VaultsProvider/vaults.provider.types'
import { CreateVaultModalState, VaultInputState } from './createNewVault.types'

export const INITIAL_SCREEN_ID = 'createVault'
export const ADD_COLLATERAL_SCREEN_ID = 'addCollateral'
export const BORROW_SCREEN_ID = 'borrow'
export const CONFIRMATION_SCREEN_ID = 'confirmation'

// default vault state
export const DEFAULT_VAULT_STATE: VaultInputState = { name: '', validationStatus: '', errorMessage: '' }

export const DEFAULT_CREATE_VAULT_STATE: CreateVaultModalState = {
  vaultInputState: DEFAULT_VAULT_STATE,
  screenToShow: INITIAL_SCREEN_ID,
  isVaultCreating: false,
  selectedCollaterals: {},
  selectedCollateralsAddresses: [],
  newVault: null,
  hasXTZTokenSelected: undefined,
  finalBorrowInputData: {
    amount: 0,
    symbol: '',
    rate: 0,
  },
}

export const screenTitles = {
  [INITIAL_SCREEN_ID]: 'Create New Vault',
  [ADD_COLLATERAL_SCREEN_ID]: 'Select Collateral For Vault',
  [BORROW_SCREEN_ID]: 'Borrow',
  [CONFIRMATION_SCREEN_ID]: 'Confirmation',
}

export const screenDescriptions = {
  [INITIAL_SCREEN_ID]: `Create a personal vault to begin borrowing. 
  You may only choose one asset (USDT, EURL, or XTZ) to be borrowed per vault. In your vault, you may deposit a basket of assets such as XTZ, tzBTC, USDT, and EURL together as collateral.`,
  [ADD_COLLATERAL_SCREEN_ID]:
    'Select an one or multiple assets to add as collateral.  If you are providing XTZ as collateral, make sure you select a baker. ',
  [BORROW_SCREEN_ID]: 'Select the amount you would like to borrow. You cannot borrow more than your borrow capacity.',
  [CONFIRMATION_SCREEN_ID]: 'Please confirm the following details.',
}

export const stepperItemsObj = {
  [INITIAL_SCREEN_ID]: 'Create Vault',
  [ADD_COLLATERAL_SCREEN_ID]: 'Add Collateral',
  [BORROW_SCREEN_ID]: 'Borrow',
  [CONFIRMATION_SCREEN_ID]: 'Confirmation',
}

export const stepperItems = Object.values(stepperItemsObj)

export const testVaults: Record<string, VaultType> = {
  KT1RyJznnuhSYP7aLJS8YHmcgumap2D2jhqC: {
    borrowedTokenAddress: 'KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5',
    name: 'test12-dev',
    address: 'KT1RyJznnuhSYP7aLJS8YHmcgumap2D2jhqC',
    ownerAddress: 'tz1byTGaUKjJqkwSXPnM3dpf9N39pYwRfnTm',
    vaultId: 358,
    apr: 25.590961144749258,
    creationTimestamp: 1690782579000,
    borrowedAmount: 0,
    availableLiquidity: 42313314,
    minimumRepay: 10000,
    fee: 0,
    collateralData: [],
    liquidationMax: 0,
    liquidationReward: 0.06,
    adminLiquidateFee: 600,
    liquidationRatio: 1500,
    liquidationLvl: null,
    sMVKDelegatedTo: '',
    xtzDelegatedTo: null,
    depositors: [],
    deporsitorsFlag: 'any',
  },
}
