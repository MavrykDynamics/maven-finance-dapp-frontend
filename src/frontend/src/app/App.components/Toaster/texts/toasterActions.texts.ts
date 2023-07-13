import { ACTION_COMPLETION_MESSAGE_TEXT, ACTION_START_MESSAGE_TEXT } from '../Toaster.constants'

// doorman
import { STAKE_ACTION, UNSTAKE_ACTION } from 'providers/StakeProvider/helpers/stake.consts'

// user
import {
  CLAIM_ALL_REWARDS_ACTION,
  CLAIM_VESTING_REWARD_ACTION,
  GET_MVK_FROM_FAUCET_ACTION,
  REWARDS_COMPOUND_ACTION,
} from 'providers/UserProvider/helpers/user.consts'

// satellites
import {
  DELEGATE_ACTION,
  DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
  REGISTER_SATELLITE_ACTION,
  UNDELEGATE_ACTION,
  UNREGISTER_SATELLITE_ACTION,
  UPDATE_SATELLITE_ACTION,
} from 'providers/SatellitesProvider/satellites.const'

// loans
import {
  CREATE_NEW_VAULT_ACTION,
  DEPOSIT_LENDING_ASSET_ACTION,
  WITHDRAW_LENDING_ASSET_ACTION,
} from 'providers/LoansProvider/helpers/loans.const'

// vaults
import { BORROW_VAULT_ASSET_ACTION, CHANGE_VAULT_NAME_ACTION, REPAY_FULL_VAULT_ACTION, REPAY_PART_OF_VAULT_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

export const TOASTER_ACTIONS_TEXTS = {
  // doorman actions -------------------------------------
  [STAKE_ACTION]: {
    start: {
      title: 'Staking...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Staking done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UNSTAKE_ACTION]: {
    start: {
      title: 'Unstaking...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Unstaking done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [GET_MVK_FROM_FAUCET_ACTION]: {
    start: {
      title: 'Requesting MVK...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Received 1,000 MVK...',
      message: 'Enjoy using Mavryk Finance :)',
    },
  },
  // user actions -------------------------------------
  [REWARDS_COMPOUND_ACTION]: {
    start: {
      title: 'Compounding rewards...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Compounding done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [CLAIM_VESTING_REWARD_ACTION]: {
    start: {
      title: 'Claiming vesting reward...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Compounding done',
      message: 'Vesting reward claimed',
    },
  },
  [CLAIM_ALL_REWARDS_ACTION]: {
    start: {
      title: 'Claiming rewards...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Compounding done',
      message: 'Rewards claimed.',
    },
  },
  // satellites actions -------------------------------------
  [DELEGATE_ACTION]: {
    start: {
      title: 'Delegating...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Delegation done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UNDELEGATE_ACTION]: {
    start: {
      title: 'Undelegating...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Undelegating done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DISTRIBUTE_PROPOSALS_REWARDS_ACTION]: {
    start: {
      title: 'Distributing proposal rewards...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Distributing proposal rewards done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REGISTER_SATELLITE_ACTION]: {
    start: {
      title: 'Registering...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Satellite Registered.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UNREGISTER_SATELLITE_ACTION]: {
    start: {
      title: 'Unregistering...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Satellite is no longer registered.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UPDATE_SATELLITE_ACTION]: {
    start: {
      title: 'Updating satellite record...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Satellite record updated.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  // loans actions -------------------------------------
  [CREATE_NEW_VAULT_ACTION]: {
    start: {
      title: 'Creating new vault...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'New vault created.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DEPOSIT_LENDING_ASSET_ACTION]: {
    start: {
      title: 'Adding liquidity...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Liquidity added.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [WITHDRAW_LENDING_ASSET_ACTION]: {
    start: {
      title: 'Removing liquidity...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Liquidity removed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // vaults actions -------------------------------------
  [CHANGE_VAULT_NAME_ACTION]: {
    start: {
      title: 'Changing vault name...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Vault name is changed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [BORROW_VAULT_ASSET_ACTION]: {
    start: {
      title: 'Borrowing from the vault...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Asset borrowed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REPAY_PART_OF_VAULT_ACTION]: {
    start: {
      title: 'Repaying asset...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Asset repayed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REPAY_FULL_VAULT_ACTION]: {
    start: {
      title: 'Repaying asset...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Asset repayed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
}
