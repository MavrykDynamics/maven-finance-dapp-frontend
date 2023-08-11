import { gql } from 'utils/__generated__'

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
//       mint_mvk_and_transfer_paused
//       stake_mvk_paused
//       transfer_paused
//       address
//       unstake_mvk_paused
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
//       withdraw_reward_smvk_paused
//       withdraw_reward_xtz_paused
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
//       distribute_reward_xtz_paused
//       distribute_reward_smvk_paused
//       create_aggregator_paused
//       admin
//       last_updated_at
//     }
//   }
// `)

export const CONTRACT_STATUSES_ALL_DATA_QUERY = gql(`
  query getAllContractStatusesData {
    farm(where: {admin: {_neq: ""}}) {
      name
      address
      claim_paused
      deposit_paused
      withdraw_paused
      admin
      last_updated_at
    }

    farm_factory(where: {admin: {_neq: ""}}) {
      create_farm_paused
      track_farm_paused
      untrack_farm_paused
      address
      admin
      last_updated_at
    }

    delegation(where: {admin: {_neq: ""}}) {
      delegate_to_satellite_paused
      distribute_reward_paused
      register_as_satellite_paused
      undelegate_from_satellite_paused
      unregister_as_satellite_paused
      update_satellite_record_paused
      address
      admin
      last_updated_at
    }

    doorman(where: {admin: {_neq: ""}}) {
      address
      compound_paused
      farm_claim_paused
      unstake_paused
      admin
      last_updated_at
    }

    treasury(where: {admin: {_neq: ""}}) {
      name
      mint_mvk_and_transfer_paused
      stake_mvk_paused
      transfer_paused
      address
      unstake_mvk_paused
      admin
      last_updated_at
    }

    treasury_factory(where: {admin: {_neq: ""}}) {
      create_treasury_paused
      address
      track_treasury_paused
      untrack_treasury_paused
      admin
      last_updated_at
    }

    aggregator(where: {admin: {_neq: ""}}) {
      address
      name
      withdraw_reward_smvk_paused
      withdraw_reward_xtz_paused
      admin
      last_updated_at
    }

    aggregator_factory(where: {admin: {_neq: ""}}) {
      address
      untrack_aggregator_paused
      track_aggregator_paused
      distribute_reward_xtz_paused
      distribute_reward_smvk_paused
      create_aggregator_paused
      admin
      last_updated_at
    }
  }
`)
