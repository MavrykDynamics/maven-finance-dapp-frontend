import {
  GET_MVK_FROM_FAUCET_ACTION,
  REWARDS_COMPOUND_ACTION,
  STAKE_ACTION,
  UNSTAKE_ACTION,
} from 'providers/StakeProvider/helpers/stake.consts'
import { ACTION_START_MESSAGE_TEXT, ACTION_COMPLETION_MESSAGE_TEXT } from '../Toaster.constants'
import { CLAIM_ALL_REWARDS_ACTION, CLAIM_VESTING_REWARD_ACTION } from 'providers/UserProvider/helpers/user.consts'

export const TOASTER_ACTIONS_TEXTS = {
  // doorman actions -----------------------------
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
      message: 'Please wait 15s',
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
      message: 'Please wait 15s',
    },
    end: {
      title: 'Compounding done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [CLAIM_VESTING_REWARD_ACTION]: {
    start: {
      title: 'Claiming vesting reward...',
      message: 'Please wait 15s',
    },
    end: {
      title: 'Compounding done',
      message: 'Vesting reward claimed',
    },
  },
  [CLAIM_ALL_REWARDS_ACTION]: {
    start: {
      title: 'Claiming rewards...',
      message: 'Please wait 15s',
    },
    end: {
      title: 'Compounding done',
      message: 'Rewards claimed.',
    },
  },
}
