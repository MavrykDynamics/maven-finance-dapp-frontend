import { CodegenConfig } from '@graphql-codegen/cli'
import { visit } from 'graphql'

// mapper of top level tables
const INDEXER_TABLES = {
  // STAKING
  doorman: true,
  smvn_history_data_aggregate: true,
  smvn_history_data: true,
  mvn_token: true,

  // DAPP CONFIG
  // mvn_faucet: false,
  dipdup_index: true,

  // FEEDS
  aggregator: true,
  aggregator_factory: true,
  aggregator_aggregate: true,
  aggregator_oracle_reward_aggregate: true,

  // SATELLITES
  satellite: true,
  satellite_aggregate: true,
  gql_satellite_metrics: true,
  gql_satellite_summary: true,
  satellite_data_view: true,

  // SATELITE GOVERNANCE
  governance_satellite: true,
  governance_satellite_action: true,
  governance_satellite_action_aggregate: true,

  // COUNSIL
  council: true,
  council_action: true,
  break_glass_council_member: true,
  break_glass: true,
  break_glass_action: true,

  // VAULTS
  vault: true,
  vault_factory: true,
  vault_collateral_view_aggregate: true,
  gql_vault_with_balances_aggregate: true,

  // MARKETS
  lending_controller: true,

  // GOVERNANCE
  governance: true,
  governance_proposal: true,
  governance_proposal_aggregate: true,
  governance_financial: true,
  governance_financial_request: true,
  governance_financial_request_aggregate: true,
  emergency_governance: true,
  emergency_governance_record: true,
  governance_proxy: true,
  whitelist_developer: true,

  // TREASURY
  treasury: true,
  treasury_balance: true,
  treasury_factory: true,

  // farms
  farm: true,
  farm_factory: true,

  // VESTING
  vesting: true,

  // USER
  maven_user: true,
  delegation: true,

  // TOKENS
  token: true,
}

// environment prefixes
const INDEXER_ENV_PREFIXES = {
  dev: 'dev_',
  prod: '',
}

const GRAPHQL_SCHEMA = process.env.VITE_GRAPHQL_API ?? process.env.REACT_APP_GRAPHQL_API
const INDEXER_DATA_ENV = process.env.VITE_DATA_ENV === 'dev' || process.env.REACT_APP_DATA_ENV === 'dev' ? 'dev' : 'prod'

if (!GRAPHQL_SCHEMA) {
  throw new Error('VITE_GRAPHQL_API environment variable is not set')
}

const config: CodegenConfig = {
  schema: GRAPHQL_SCHEMA,
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    'src/utils/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
      documentTransforms: [
        {
          transform: ({ documents }) => {
            return documents.map((documentFile) => {
              if (!documentFile?.document) return documentFile

              documentFile.document = visit(documentFile.document, {
                leave(node) {
                  /**
                   * if field has alias (node.alias)
                   * if field has name (node?.name?.value)
                   * if field is in INDEXER_TABLES mapper (INDEXER_TABLES[node.name.value])
                   */
                  // @ts-expect-error
                  if (node.alias && node?.name?.value && INDEXER_TABLES[node.name.value]) {
                    // update table tabe to use prefix based on env
                    // @ts-expect-error
                    node.name.value = `${INDEXER_ENV_PREFIXES[INDEXER_DATA_ENV]}${node.name.value}`
                  }
                  return node
                },
              })
              return documentFile
            })
          },
        },
      ],
    },
  },
  ignoreNoDocuments: true,
}

export default config
