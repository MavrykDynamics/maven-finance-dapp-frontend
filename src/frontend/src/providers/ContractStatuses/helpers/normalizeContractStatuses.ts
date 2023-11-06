import { GetAllContractStatusesDataQuery } from 'utils/__generated__/graphql'
import { ContractStatusesStorage } from '../contractStatuses.provider.types'

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
                'farm claim': item.farm_claim_paused,
                unstake: item.unstake_paused,
                stake: item.stake_paused,
                exit: item.exit_paused,
                'on vault deposit stake': item.on_vault_deposit_stake_paused,
                'on vault liquidate stake': item.on_vault_liquidate_stake_paused,
                'on vault withdraw stake': item.on_vault_withdraw_stake_paused,
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
                'take satellites snapshot': item.take_satellites_snapshot_paused,
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
                'create m token farm': item.create_farm_m_token_paused,
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
                'stake tokens': item.stake_tokens_paused,
                transfer: item.transfer_paused,
                'unstake tokens': item.unstake_tokens_paused,
                'update token operators': item.update_token_operators_paused,
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
                'create treasury': item.create_treasury_paused,
                'track treasury': item.track_treasury_paused,
                'untrack treasury': item.untrack_treasury_paused,
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
                'withdraw reward smvk': item.withdraw_reward_smvk_paused,
                'withdraw reward xtz': item.withdraw_reward_xtz_paused,
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
                'distribute reward xtz': item.distribute_reward_xtz_paused,
                'distribute reward smvk': item.distribute_reward_smvk_paused,
                'untrack aggregator': item.untrack_aggregator_paused,
                'track aggregator': item.track_aggregator_paused,
                'create aggregator': item.create_aggregator_paused,
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
                'add liquidity': item.add_liquidity_paused,
                'close vault': item.close_vault_paused,
                'liquidate vault': item.liquidate_vault_paused,
                'mark for liquidation': item.mark_for_liquidation_paused,
                'register deposit': item.register_deposit_paused,
                'register vault creation': item.register_vault_creation_paused,
                'register withdrawal': item.register_withdrawal_paused,
                'remove liquidity': item.remove_liquidity_paused,
                repay: item.repay_paused,
                'set collateral token': item.set_collateral_token_paused,
                'set loan token': item.set_loan_token_paused,
                'vault deposit': item.vault_deposit_paused,
                'vault deposit staked token': item.vault_deposit_staked_token_paused,
                'vault on liquidate': item.vault_on_liquidate_paused,
                'vault withdraw': item.vault_withdraw_paused,
                'vault withdraw staked token': item.vault_withdraw_staked_token_paused,
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
                'create vault': item.create_vault_paused,
              },
            }
          }),
        ]
      : []),
  ]
    .flat()
    .filter(Boolean)
}
