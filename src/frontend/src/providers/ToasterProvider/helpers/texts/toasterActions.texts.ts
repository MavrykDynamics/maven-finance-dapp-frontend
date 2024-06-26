import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  DEFAULT_REQUEST_COMPLETION_MESSAGE_TEXT,
} from 'providers/ToasterProvider/toaster.provider.const'

// doorman
import { STAKE_ACTION, UNSTAKE_ACTION } from 'providers/DoormanProvider/helpers/doorman.consts'

// user
import {
  CLAIM_ALL_REWARDS_ACTION,
  CLAIM_VESTING_REWARD_ACTION,
  GET_MVN_FROM_FAUCET_ACTION,
  GET_USDT_FROM_FAUCET_ACTION,
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
  DEPOSIT_LENDING_ASSET_ACTION,
  WITHDRAW_LENDING_ASSET_ACTION,
} from 'providers/LoansProvider/helpers/loans.const'

// vaults
import {
  BORROW_VAULT_ASSET_ACTION,
  CHANGE_BAKER_ACTION,
  CHANGE_VAULT_NAME_ACTION,
  CREATE_VAULT_ACTION,
  DEPOSIT_COLLATERAL_ACTION,
  LIQUIDATE_VAULT_ACTION,
  MANAGE_PERMISSIONS_ACTION,
  MARK_FOR_LIQUIDATION_ACTION,
  REPAY_FULL_VAULT_ACTION,
  REPAY_PART_OF_VAULT_ACTION,
  UPDATE_OPERATORS_ACTION,
  WITHDRAW_COLLATERAL_ACTION,
} from 'providers/VaultsProvider/helpers/vaults.const'

// proposals
import {
  DROP_PROPOSAL_ACTION,
  EXECUTE_PROPOSAL_ACTION,
  LOCK_PROPOSAL_ACTION,
  PROCESS_PROPOSAL_ACTION,
  PROPOSAL_ROUND_VOTE_ACTION,
  START_NEXT_ROUND_ACTION,
  START_PROPOSAL_ROUND_ACTION,
  START_VOTING_ROUND_ACTION,
  SUBMIT_PROPOSAL_ACTION,
  UPDATE_PROPOSAL_DATA_ACTION,
  VOTING_ROUND_VOTE_ACTION,
} from 'providers/ProposalsProvider/helpers/proposals.const'

// fin requests
import { FINANCIAL_REQUEST_VOTE_ACTION } from 'providers/FinancialRequestsProvider/helpers/financialRequests.consts'

// sat governance
import {
  ADD_ORACLES_AGGREGATOR_ACTION,
  BAN_SATELLITE_ACTION,
  DROP_ACTION,
  FIX_MISTAKEN_TRANSFER_ACTION,
  REGISTER_AGGREGATOR_ACTION,
  REMOVE_ORACLES_ACTION,
  REMOVE_ORACLES_AGGREGATOR_ACTION,
  RESTORE_SATELLITE_ACTION,
  SET_AGGREGATOR_MAINTAINER_ACTION,
  SUSPEND_SATELLITE_ACTION,
  UNBAN_SATELLITE_ACTION,
  UNSUSPEND_SATELLITE_ACTION,
  UPDATE_AGGREGATOR_STATUS_ACTION,
  VOTE_FOR_ACTION,
} from 'providers/SatelliteGovernanceProvider/helpers/satellitesGov.consts'

// council
import {
  ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
  ADD_COUNCIL_MEMBER_ACTION,
  ADD_VESTEE_ACTION,
  CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
  CHANGE_COUNCIL_MEMBER_ACTION,
  DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION,
  DROP_FIN_REQUEST_ACTION,
  DROP_MAVEN_COUNCIL_REQUEST_ACTION,
  PROPAGATE_BREAK_GLASS_ACTION,
  REMOVE_BG_CONTROL_ACTION,
  REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
  REMOVE_COUNCIL_MEMBER_ACTION,
  REMOVE_VESTEE_ACTION,
  REQUEST_TOKENS_ACTION,
  REQUEST_TOKENS_MINT_ACTION,
  SET_BAKER_ACTION,
  SET_CONTRACT_BAKER_ACTION,
  SET_SELECTED_CONTRACTS_ADMIN_ACTION,
  SIGN_BREAK_GLASS_COUNCIL_ACTION,
  SIGN_MAVEN_COUNCIL_ACTION,
  TOGGLE_VESTEE_LOCK_ACTION,
  TRANSFER_TOKENS_ACTION,
  UNPAUSE_ALL_ENTRYPOINTS_ACTION,
  UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
  UPDATE_COUNCIL_MEMBER_INFO_ACTION,
  UPDATE_VESTEE_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'

// farms
import {
  DEPOSIT_TO_FARM_ACTION,
  HARVEST_FARM_REWARDS_ACTION,
  WITHDRAW_FROM_FARM_ACTION,
} from 'providers/FarmsProvider/helpers/farms.const'

// eGov
import {
  SUBMIT_EGOV_PROPOSAL_ACTION,
  VOTE_FOR_EGOV_PROPOSAL_ACTION,
} from 'providers/EmergencyGovernanceProvider/helpers/eGov.consts'

// feeds
import { REGISTER_FEED_ACTION } from 'providers/DataFeedsProvider/helpers/feeds.consts'

// types
import { ActionTypes } from 'providers/DappConfigProvider/dappConfig.provider.types'

type ToastMessageContent = {
  title: string
  message: string
}

type ToastMessageFullContent = {
  start: ToastMessageContent
  end: ToastMessageContent
}

export const TOASTER_ACTIONS_TEXTS: Record<ActionTypes, ToastMessageFullContent> = {
  // feeds actions -------------------------------------
  [REGISTER_FEED_ACTION]: {
    start: {
      title: 'Registering feed...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Feed registered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

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
  [GET_MVN_FROM_FAUCET_ACTION]: {
    start: {
      title: 'Requesting MVN...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Received 1,000 MVN...',
      message: 'Enjoy using Maven Finance :)',
    },
  },
  [GET_USDT_FROM_FAUCET_ACTION]: {
    start: {
      title: 'Requesting USDt...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Received 1,000 USDt...',
      message: 'Enjoy using Maven Finance :)',
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
  [CREATE_VAULT_ACTION]: {
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
  [MARK_FOR_LIQUIDATION_ACTION]: {
    start: {
      title: 'Marking vault for Liquidation...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Vault marked for Liquidation.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [LIQUIDATE_VAULT_ACTION]: {
    start: {
      title: 'Liquidating vault...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Vault Liquidated.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // vaults collateral actions -------------------------------------
  [WITHDRAW_COLLATERAL_ACTION]: {
    start: {
      title: 'Withdrawing collateral from the vault...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Collateral withdrawn.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DEPOSIT_COLLATERAL_ACTION]: {
    start: {
      title: 'Depositing collateral in the vault...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Collateral added.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // vault permission actions -------------------------------------
  [CHANGE_BAKER_ACTION]: {
    start: {
      title: 'Changing MVRK Validator...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Validator changed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [MANAGE_PERMISSIONS_ACTION]: {
    start: {
      title: 'Updating depositors...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Depositors updated.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UPDATE_OPERATORS_ACTION]: {
    start: {
      title: 'Updating operators...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Operators updated.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // proposals actions -------------------------------------
  [PROPOSAL_ROUND_VOTE_ACTION]: {
    start: {
      title: 'Proposal Vote executing...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Voting done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [VOTING_ROUND_VOTE_ACTION]: {
    start: {
      title: 'Voting...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Voting done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [EXECUTE_PROPOSAL_ACTION]: {
    start: {
      title: 'Request Execute Proposal round start...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: DEFAULT_REQUEST_COMPLETION_MESSAGE_TEXT,
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [PROCESS_PROPOSAL_ACTION]: {
    start: {
      title: 'Process Proposal Payment round start...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Process Proposal Payment confirmed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // proposal submission actions -------------------------------------
  [SUBMIT_PROPOSAL_ACTION]: {
    // text is different cuz the the button text is related to the current message text __ATTENTION__
    start: {
      title: 'Saving proposal...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Proposal saved.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DROP_PROPOSAL_ACTION]: {
    start: {
      title: 'Drop proposal...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Proposal dropped.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [LOCK_PROPOSAL_ACTION]: {
    // text is different cuz the the button text is related to the current message text  __ATTENTION__
    start: {
      title: 'Submitting proposal...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Proposal submitted.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UPDATE_PROPOSAL_DATA_ACTION]: {
    start: {
      title: 'Updating proposal...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Proposal updated.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // proposal governance interaction actions -------------------------------------
  [START_PROPOSAL_ROUND_ACTION]: {
    start: {
      title: 'Request Proposal round start...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: DEFAULT_REQUEST_COMPLETION_MESSAGE_TEXT,
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [START_VOTING_ROUND_ACTION]: {
    start: {
      title: 'Request Voting round start...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: DEFAULT_REQUEST_COMPLETION_MESSAGE_TEXT,
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [START_NEXT_ROUND_ACTION]: {
    start: {
      title: 'Request Next round start...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: DEFAULT_REQUEST_COMPLETION_MESSAGE_TEXT,
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  // financial requests actions ------------------------
  [FINANCIAL_REQUEST_VOTE_ACTION]: {
    start: {
      title: 'Voting...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Voting done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  // satellites governance actions ------------------------------------
  [SUSPEND_SATELLITE_ACTION]: {
    start: {
      title: 'Triggering Suspend Satellite...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Suspend Satellite vote triggered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UNSUSPEND_SATELLITE_ACTION]: {
    start: {
      title: 'Triggering Unsuspend Satellite...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Unsuspend Satellite vote triggered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [BAN_SATELLITE_ACTION]: {
    start: {
      title: 'Triggering Ban Satellite...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Ban Satellite vote triggered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UNBAN_SATELLITE_ACTION]: {
    start: {
      title: 'Triggering Unban Satellite...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Unban Satellite vote triggered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REMOVE_ORACLES_ACTION]: {
    start: {
      title: 'Remove all Oracles from Satellite...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Remove all Oracles from Satellite done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REMOVE_ORACLES_AGGREGATOR_ACTION]: {
    start: {
      title: 'Removing from aggregator...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Removing from aggregator done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [ADD_ORACLES_AGGREGATOR_ACTION]: {
    start: {
      title: 'Adding Oracle to aggregator...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Adding Oracle to Aggregator done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [SET_AGGREGATOR_MAINTAINER_ACTION]: {
    start: {
      title: 'Set Aggregator Maintainer...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Set Aggregator Maintainer done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DROP_ACTION]: {
    start: {
      title: 'Dropping Action...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Drop Action done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [VOTE_FOR_ACTION]: {
    start: {
      title: 'Voting...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Vote registered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [RESTORE_SATELLITE_ACTION]: {
    start: {
      title: 'Restoring Satellite...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Restore Satellite vote started',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UPDATE_AGGREGATOR_STATUS_ACTION]: {
    start: {
      title: 'Update Aggregator Status...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Aggregator Status Updated',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REGISTER_AGGREGATOR_ACTION]: {
    start: {
      title: 'Registering Aggregator...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Aggregator Registered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [FIX_MISTAKEN_TRANSFER_ACTION]: {
    start: {
      title: 'Fix Mistaken Transfer started...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Fixing Mistaken Transfer triggered',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  // farms actions ------------------------------------
  [HARVEST_FARM_REWARDS_ACTION]: {
    start: {
      title: 'Harvesting...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Harvesting done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DEPOSIT_TO_FARM_ACTION]: {
    start: {
      title: 'Depositing...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Depositing done  ',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [WITHDRAW_FROM_FARM_ACTION]: {
    start: {
      title: 'Withdrawing...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Withdrawing done',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // break glass council actions -------------------------------------------------
  [SET_SELECTED_CONTRACTS_ADMIN_ACTION]: {
    start: {
      title: 'Set Single Contract Admin...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Set Single Contract Admin is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [SIGN_BREAK_GLASS_COUNCIL_ACTION]: {
    start: {
      title: 'Sign...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Sign is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION]: {
    start: {
      title: 'Add Council Member...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Add Council Member is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION]: {
    start: {
      title: 'Update Council Member...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Update Council Member is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION]: {
    start: {
      title: 'Change Council Member...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Change Council Member is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION]: {
    start: {
      title: 'Remove Council Member...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Remove Council Member is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UNPAUSE_ALL_ENTRYPOINTS_ACTION]: {
    start: {
      title: 'Unpausing All Entrypoints...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'All Entrypoints Are Unpaused.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REMOVE_BG_CONTROL_ACTION]: {
    start: {
      title: 'Remove Break Glass Controll...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Break Glass Controll Removed.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [PROPAGATE_BREAK_GLASS_ACTION]: {
    start: {
      title: 'Propagate Break Glass...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Propagate Break Glass is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION]: {
    start: {
      title: 'Drop Action...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Drop Action is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // maven council actions -------------------------------------------------
  [SIGN_MAVEN_COUNCIL_ACTION]: {
    start: {
      title: 'Sign...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Sign is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [ADD_VESTEE_ACTION]: {
    start: {
      title: 'Add Vestee...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Add Vestee is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [ADD_COUNCIL_MEMBER_ACTION]: {
    start: {
      title: 'Add Member...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Add Member is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UPDATE_VESTEE_ACTION]: {
    start: {
      title: 'Update Vestee...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Update Vestee is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [TOGGLE_VESTEE_LOCK_ACTION]: {
    start: {
      title: 'Toggle Vestee Lock...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Toggle Vestee Lock is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [CHANGE_COUNCIL_MEMBER_ACTION]: {
    start: {
      title: 'Change Council Member...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Change Council Member is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REMOVE_COUNCIL_MEMBER_ACTION]: {
    start: {
      title: 'Remove Council Member...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Remove Council Member is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [UPDATE_COUNCIL_MEMBER_INFO_ACTION]: {
    start: {
      title: 'Update Council Member Info...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Update Council Member Info is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [TRANSFER_TOKENS_ACTION]: {
    start: {
      title: 'Transfer Tokens...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Transfer Tokens is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REQUEST_TOKENS_ACTION]: {
    start: {
      title: 'Request Tokens...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Request Tokens is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REQUEST_TOKENS_MINT_ACTION]: {
    start: {
      title: 'Request Token Mint...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Request Token Mint is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DROP_FIN_REQUEST_ACTION]: {
    start: {
      title: 'Drop Financial Request...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Drop Financial Request is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [REMOVE_VESTEE_ACTION]: {
    start: {
      title: 'Remove Vestee Request...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Remove Vestee Request is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [SET_BAKER_ACTION]: {
    start: {
      title: 'Set Validator...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Set Validator is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [SET_CONTRACT_BAKER_ACTION]: {
    start: {
      title: 'Set Contract Validator...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Set Contract Validator is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [DROP_MAVEN_COUNCIL_REQUEST_ACTION]: {
    start: {
      title: 'Drop Request...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Drop Request is done.',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },

  // emergency governance actions ------------------------------------
  [VOTE_FOR_EGOV_PROPOSAL_ACTION]: {
    start: {
      title: 'Voting for emergency proposal...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Emergency Proposal voted',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
  [SUBMIT_EGOV_PROPOSAL_ACTION]: {
    start: {
      title: 'Submitting emergency proposal...',
      message: ACTION_START_MESSAGE_TEXT,
    },
    end: {
      title: 'Emergency Proposal Submitted',
      message: ACTION_COMPLETION_MESSAGE_TEXT,
    },
  },
}
