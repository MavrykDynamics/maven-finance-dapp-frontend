import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://api-v2.mavryk.finance/v1/graphql',
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    'src/utils/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
