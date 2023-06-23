import { gql } from 'utils/__generated__'

export const GLASS_BROKEN_SUB = gql(`
subscription glasssBrokenStatus {
  break_glass {
    glass_broken
  }
}
`)

export const WHITE_LIST_DEVELOPERS_SUB = gql(`
subscription whiteListDevelopers {
  whitelist_developer {
    developer {
      address
    }
  }
}
`)

// contacts status

export const BREAK_GLASS_FARM_SUB = gql(`
  subscription breakGlassfarm($_eq: String) {
    farm(where: {admin: {_neq: ""}}) {
      name
      address
      claim_paused
      deposit_paused
      withdraw_paused
      admin
      last_updated_at
    }
  }
`)

export const BREAK_GLASS_FARM_FACTORY_SUB = gql(`
  subscription breakGlassfarmFactory($_eq: String) {
    farm_factory(where: {admin: {_neq: ""}}) {
      create_farm_paused
      track_farm_paused
      untrack_farm_paused
      address
      admin
      last_updated_at
    }
  }
`)

export const BREAK_GLASS_DELEGATION_SUB = gql(`
  subscription breakGlassDelegation($_eq: String) {
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
  }
`)

export const BREAK_GLASS_DOORMAN_SUB = gql(`
  subscription breakGlassDoorman($_eq: String) {
    doorman(where: {admin: {_neq: ""}}) {
      address
      compound_paused
      farm_claim_paused
      unstake_paused
      admin
      last_updated_at
    }
  }
`)

export const BREAK_GLASS_TREASURY_SUB = gql(`
  subscription breakGlassTreasury($_eq: String) {
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
  }
`)
export const BREAK_GLASS_TREASURY_FACTORY_SUB = gql(`
  subscription breakGlassTreasuryFactory($_eq: String) {
    treasury_factory(where: {admin: {_neq: ""}}) {
      create_treasury_paused
      address
      track_treasury_paused
      untrack_treasury_paused
      admin
      last_updated_at
    }
  }
`)

export const BREAK_GLASS_AGGREGATOR_SUB = gql(`
  subscription breakGlassAggregator($_eq: String) {
    aggregator(where: {admin: {_neq: ""}}) {
      address
      name
      withdraw_reward_smvk_paused
      withdraw_reward_xtz_paused
      admin
      last_updated_at
    }
  }
`)

export const BREAK_GLASS_AGGREGATOR_FACTORY_SUB = gql(`
  subscription breakGlassAggregatorFactory($_eq: String) {
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
