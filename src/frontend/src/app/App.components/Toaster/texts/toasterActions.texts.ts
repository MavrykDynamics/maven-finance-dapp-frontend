import { STAKE_ACTION, UNSTAKE_ACTION } from 'providers/StakeProvider/helpers/stake.consts'
import { ACTION_START_MESSAGE_TEXT, ACTION_COMPLETION_MESSAGE_TEXT } from '../Toaster.constants'

export const TOASTER_ACTIONS_TEXTS = {
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
}
