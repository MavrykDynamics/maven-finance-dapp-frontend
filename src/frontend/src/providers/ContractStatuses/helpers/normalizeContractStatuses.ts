import { GetAllContractStatusesDataQuery } from 'utils/__generated__/graphql'
import { ContractStatusesStorage } from '../contractStatuses.types'

export function normalizeContractStatuses(storage: GetAllContractStatusesDataQuery): ContractStatusesStorage {
  return [
    // doorman
    ...(storage?.doorman?.length
      ? [
          storage.doorman.map((item) => {
            return {
              title: 'Doorman',
              type: 'General Contracts',
              address: item.address,
              admin: item.admin,
              lastUpdated: item.last_updated_at,
              methods: {
                compound: item.compound_paused,
                'farm claimed': item.farm_claim_paused,
                unstake: item.unstake_paused,
              },
            }
          }),
        ]
      : []),
    // delegation
    ...(storage?.delegation?.length
      ? [
          storage.delegation.map((item) => {
            return {
              title: 'Delegation',
              type: 'General Contracts',
              address: item.address,
              admin: item.admin,
              lastUpdated: item.last_updated_at,
              methods: {
                'delegate to satellite': item.delegate_to_satellite_paused,
                'distribute reward': item.distribute_reward_paused,
                'register as satellite': item.register_as_satellite_paused,
                'undelegate from satellite': item.undelegate_from_satellite_paused,
                'unregister as satellite': item.unregister_as_satellite_paused,
                'update satellite record': item.update_satellite_record_paused,
              },
            }
          }),
        ]
      : []),
    // farm_factory
    ...(storage?.farm_factory?.length
      ? [
          storage.farm_factory.map((item) => {
            return {
              title: 'Farm factory',
              type: 'Farms',
              address: item.address,
              admin: item.admin,
              lastUpdated: item.last_updated_at,
              methods: {
                'create farm': item.create_farm_paused,
                'track farm': item.track_farm_paused,
                'untrack farm': item.untrack_farm_paused,
              },
            }
          }),
        ]
      : []),
    // farm
    ...(storage?.farm?.length
      ? [
          storage.farm.map((item) => {
            return {
              title: item.name,
              type: 'Farms',
              address: item.address,
              admin: item.admin,
              lastUpdated: item.last_updated_at,
              methods: {
                claim: item.claim_paused,
                deposit: item.deposit_paused,
                withdraw: item.withdraw_paused,
              },
            }
          }),
        ]
      : []),
    // treasury
    ...(storage?.treasury?.length
      ? [
          storage.treasury.map((item) => {
            return {
              title: item.name,
              type: 'Treasury',
              address: item.address,
              admin: item.admin,
              lastUpdated: item.last_updated_at,
              methods: {
                'mint mvk and transfer': item.mint_mvk_and_transfer_paused,
                'stake mvk': item.stake_tokens_paused,
                transfer: item.transfer_paused,
                'unstake mvk': item.unstake_tokens_paused,
              },
            }
          }),
        ]
      : []),
    // treasury_factory
    ...(storage?.treasury_factory?.length
      ? [
          storage.treasury_factory.map((item) => {
            return {
              title: 'Treasury Factory',
              type: 'Treasury',
              address: item.address,
              lastUpdated: item.last_updated_at,
              admin: item.admin,
              methods: {
                'create treasury paused': item.create_treasury_paused,
                'track treasury paused': item.track_treasury_paused,
                'untrack treasury paused': item.untrack_treasury_paused,
              },
            }
          }),
        ]
      : []),
    // aggregator
    ...(storage?.aggregator?.length
      ? [
          storage.aggregator.map((item) => {
            return {
              title: `${item.name} Aggregator`,
              type: 'Oracles',
              address: item.address,
              lastUpdated: item.last_updated_at,
              admin: item.admin,
              methods: {
                'withdraw reward smvk paused': item.withdraw_reward_smvk_paused,
                'withdraw reward xtz paused': item.withdraw_reward_xtz_paused,
              },
            }
          }),
        ]
      : []),
    // aggregator_factory
    ...(storage?.aggregator_factory?.length
      ? [
          storage.aggregator_factory.map((item) => {
            return {
              title: 'Aggregator Factory',
              type: 'Oracles',
              address: item.address,
              lastUpdated: item.last_updated_at,
              admin: item.admin,
              methods: {
                'untrack aggregator paused': item.untrack_aggregator_paused,
                'track aggregator paused': item.track_aggregator_paused,
                'distribute reward xtz paused': item.distribute_reward_xtz_paused,
                'distribute reward smvk paused': item.distribute_reward_smvk_paused,
                'create aggregator paused': item.create_aggregator_paused,
              },
            }
          }),
        ]
      : []),
    // lending_controller
    ...(storage?.lending_controller?.length
      ? [
          storage.lending_controller.map((item) => {
            return {
              title: 'Lending Controller',
              type: 'Lending',
              address: item.address,
              lastUpdated: item.last_updated_at,
              admin: item.admin,
              methods: {
                'add liquidity paused': item.add_liquidity_paused,
                'close vault paused': item.close_vault_paused,
                'liquidate vault paused': item.liquidate_vault_paused,
                'mark for liquidation paused': item.mark_for_liquidation_paused,
                'register deposit paused': item.register_deposit_paused,
                'register vault creation paused': item.register_vault_creation_paused,
                'register withdrawal paused': item.register_withdrawal_paused,
                'remove liquidity paused': item.remove_liquidity_paused,
                'repay paused': item.repay_paused,
                'set collateral token paused': item.set_collateral_token_paused,
                'set loan token paused': item.set_loan_token_paused,
                'vault deposit paused': item.vault_deposit_paused,
                'vault deposit staked token paused': item.vault_deposit_staked_token_paused,
                'vault on liquidate paused': item.vault_on_liquidate_paused,
                'vault withdraw paused': item.vault_withdraw_paused,
                'vault withdraw staked token paused': item.vault_withdraw_staked_token_paused,
              },
            }
          }),
        ]
      : []),
    // vault_factory
    ...(storage?.vault_factory?.length
      ? [
          storage.vault_factory.map((item) => {
            return {
              title: 'Vault Factory',
              type: 'Lending',
              address: item.address,
              lastUpdated: item.last_updated_at,
              admin: item.admin,
              methods: {
                'create vault paused': item.create_vault_paused,
              },
            }
          }),
        ]
      : []),
  ]
    .flat()
    .filter(Boolean)
}
