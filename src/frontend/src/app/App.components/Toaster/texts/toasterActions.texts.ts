import { STAKE_ACTION, UNSTAKE_ACTION } from 'providers/StakeProvider/helpers/stake.consts'
import { ACTION_START_MESSAGE_TEXT, getActionsStartMessageText } from '../Toaster.constants'
import {
  CLAIM_ALL_REWARDS_ACTION,
  CLAIM_VESTING_REWARD_ACTION,
  GET_MVK_FROM_FAUCET_ACTION,
  REWARDS_COMPOUND_ACTION,
} from 'providers/UserProvider/helpers/user.consts'
import {
  DELEGATE_ACTION,
  DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
  REGISTER_SATELLITE_ACTION,
  UNDELEGATE_ACTION,
  UNREGISTER_SATELLITE_ACTION,
  UPDATE_SATELLITE_ACTION,
} from 'providers/SatellitesProvider/satellites.const'

export const TOASTER_ACTIONS_TEXTS = {
  // doorman actions -----------------------------
  [STAKE_ACTION]: {
    start: {
      title: 'Staking...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Staking done',
      message: getActionsStartMessageText(),
    },
  },
  [UNSTAKE_ACTION]: {
    start: {
      title: 'Unstaking...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Unstaking done',
      message: getActionsStartMessageText(),
    },
  },
  [GET_MVK_FROM_FAUCET_ACTION]: {
    start: {
      title: 'Requesting MVK...',
      message: getActionsStartMessageText(15),
    },
    end: {
      title: 'Received 1,000 MVK...',
      message: 'Enjoy using Mavryk Finance :)',
    },
  },
  // user actions -------------------------------
  [REWARDS_COMPOUND_ACTION]: {
    start: {
      title: 'Compounding rewards...',
      message: getActionsStartMessageText(15),
    },
    end: {
      title: 'Compounding done',
      message: getActionsStartMessageText(),
    },
  },
  [CLAIM_VESTING_REWARD_ACTION]: {
    start: {
      title: 'Claiming vesting reward...',
      message: getActionsStartMessageText(15),
    },
    end: {
      title: 'Compounding done',
      message: 'Vesting reward claimed',
    },
  },
  [CLAIM_ALL_REWARDS_ACTION]: {
    start: {
      title: 'Claiming rewards...',
      message: getActionsStartMessageText(15),
    },
    end: {
      title: 'Compounding done',
      message: 'Rewards claimed.',
    },
  },
  // satellites actions
  [DELEGATE_ACTION]: {
    start: {
      title: 'Delegating...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Delegation done',
      message: getActionsStartMessageText(),
    },
  },
  [UNDELEGATE_ACTION]: {
    start: {
      title: 'Undelegating...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Undelegating done',
      message: getActionsStartMessageText(),
    },
  },
  [DISTRIBUTE_PROPOSALS_REWARDS_ACTION]: {
    start: {
      title: 'Distributing proposal rewards...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Distributing proposal rewards done',
      message: getActionsStartMessageText(),
    },
  },
  [REGISTER_SATELLITE_ACTION]: {
    start: {
      title: 'Registering...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Satellite Registered.',
      message: getActionsStartMessageText(),
    },
  },
  [UNREGISTER_SATELLITE_ACTION]: {
    start: {
      title: 'Unregistering...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Satellite is no longer registered.',
      message: getActionsStartMessageText(),
    },
  },
  [UPDATE_SATELLITE_ACTION]: {
    start: {
      title: 'Updating satellite record...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Satellite record updated.',
      message: getActionsStartMessageText(),
    },
  },
}
