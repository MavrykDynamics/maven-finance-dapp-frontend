import { gql } from 'utils/__generated__' // TODO for future separate queries and subs

// TODO for future separate queries and subs
// DO NOT REMOVE IT!

// export const CONTRACT_STATUSES_FARM_SUB = gql(`
//   subscription breakGlassfarm {
//     farm(where: {admin: {_neq: ""}}) {
//       name
//       address
//       claim_paused
//       deposit_paused
//       withdraw_paused
//       admin
//       last_updated_at
//     }
//   }
// `)

// export const CONTRACT_STATUSES_FARM_FACTORY_SUB = gql(`
//   subscription breakGlassfarmFactory {
//     farm_factory(where: {admin: {_neq: ""}}) {
//       create_farm_paused
//       track_farm_paused
//       untrack_farm_paused
//       address
//       admin
//       last_updated_at
//     }
//   }
// `)

// export const CONTRACT_STATUSES_DELEGATION_SUB = gql(`
//   subscription breakGlassDelegation {
//     delegation(where: {admin: {_neq: ""}}) {
//       delegate_to_satellite_paused
//       distribute_reward_paused
//       register_as_satellite_paused
//       undelegate_from_satellite_paused
//       unregister_as_satellite_paused
//       update_satellite_record_paused
//       address
//       admin
//       last_updated_at
//     }
//   }
// `)

// export const CONTRACT_STATUSES_DOORMAN_SUB = gql(`
//   subscription breakGlassDoorman {
//     doorman(where: {admin: {_neq: ""}}) {
//       address
//       compound_paused
//       farm_claim_paused
//       unstake_paused
//       admin
//       last_updated_at
//     }
//   }
// `)

// export const CONTRACT_STATUSES_TREASURY_SUB = gql(`
//   subscription breakGlassTreasury {
//     treasury(where: {admin: {_neq: ""}}) {
//       name
//       mint_mvn_and_transfer_paused
//       stake_mvn_paused
//       transfer_paused
//       address
//       unstake_mvn_paused
//       admin
//       last_updated_at
//     }
//   }
// `)
// export const CONTRACT_STATUSES_TREASURY_FACTORY_SUB = gql(`
//   subscription breakGlassTreasuryFactory {
//     treasury_factory(where: {admin: {_neq: ""}}) {
//       create_treasury_paused
//       address
//       track_treasury_paused
//       untrack_treasury_paused
//       admin
//       last_updated_at
//     }
//   }
// `)

// export const CONTRACT_STATUSES_AGGREGATOR_SUB = gql(`
//   subscription breakGlassAggregator {
//     aggregator(where: {admin: {_neq: ""}}) {
//       address
//       name
//       withdraw_reward_smvn_paused
//       withdraw_reward_mvrk_paused
//       admin
//       last_updated_at
//     }
//   }
// `)

// export const CONTRACT_STATUSES_AGGREGATOR_FACTORY_SUB = gql(`
//   subscription breakGlassAggregatorFactory {
//     aggregator_factory(where: {admin: {_neq: ""}}) {
//       address
//       untrack_aggregator_paused
//       track_aggregator_paused
//       distribute_reward_mvrk_paused
//       distribute_reward_smvn_paused
//       create_aggregator_paused
//       admin
//       last_updated_at
//     }
//   }
// `)

export const CONTRACT_STATUSES_ALL_DATA_QUERY = gql(`
query getAllContractStatusesData {
  farm: farm(where: {admin: {_neq: ""}}) {
    name
    address
    claim_paused
    deposit_paused
    withdraw_paused
    admin
    last_updated_at
  }
  farm_factory: farm_factory(where: {admin: {_neq: ""}}) {
    create_farm_paused
    create_farm_m_token_paused
    track_farm_paused
    untrack_farm_paused
    address
    admin
    last_updated_at
  }
  delegation: delegation(where: {admin: {_neq: ""}}) {
    delegate_to_satellite_paused
    distribute_reward_paused
    register_as_satellite_paused
    undelegate_from_satellite_paused
    unregister_as_satellite_paused
    update_satellite_record_paused
    take_satellites_snapshot_paused
    address
    admin
    last_updated_at
  }
  doorman: doorman(where: {admin: {_neq: ""}}) {
    address
    compound_paused
    farm_claim_paused
    stake_mvn_paused
    unstake_mvn_paused
    exit_paused
    on_vault_deposit_stake_paused
    on_vault_liquidate_stake_paused
    on_vault_withdraw_stake_paused
    admin
    last_updated_at
  }
  treasury: treasury(where: {admin: {_neq: ""}}) {
    name
    address
    admin
    mint_mvn_and_transfer_paused
    stake_tokens_paused
    transfer_paused
    unstake_tokens_paused
    update_token_operators_paused
    admin
    last_updated_at
  }
  treasury_factory: treasury_factory(where: {admin: {_neq: ""}}) {
    create_treasury_paused
    track_treasury_paused
    untrack_treasury_paused
    address
    admin
    last_updated_at
  }
  aggregator: aggregator(where: {admin: {_neq: ""}}) {
    address
    name
    withdraw_reward_smvn_paused
    withdraw_reward_mvrk_paused
    admin
    last_updated_at
  }
  aggregator_factory: aggregator_factory(where: {admin: {_neq: ""}}) {
    address
    admin
    untrack_aggregator_paused
    track_aggregator_paused
    distribute_reward_mvrk_paused
    distribute_reward_smvn_paused
    create_aggregator_paused
    last_updated_at
  }
  lending_controller: lending_controller {
    address
    admin
    last_updated_at
    add_liquidity_paused
    close_vault_paused
    liquidate_vault_paused
    mark_for_liquidation_paused
    register_deposit_paused
    register_vault_creation_paused
    register_withdrawal_paused
    remove_liquidity_paused
    repay_paused
    set_collateral_token_paused
    set_loan_token_paused
    vault_deposit_paused
    vault_deposit_staked_token_paused
    vault_on_liquidate_paused
    vault_withdraw_paused
    vault_withdraw_staked_token_paused
  }
  vault_factory: vault_factory {
    address
    admin
    create_vault_paused
    last_updated_at
  }
}
`)
