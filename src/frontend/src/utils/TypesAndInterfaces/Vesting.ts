// type
import type { Vesting } from '../__generated__/graphql'

// helpers
import { normalizeVestingStorage } from 'pages/Treasury/Treasury.normalizer'

export type VestingStorage = ReturnType<typeof normalizeVestingStorage>

export type VestingGraphQL = Omit<Vesting, '__typename'>
