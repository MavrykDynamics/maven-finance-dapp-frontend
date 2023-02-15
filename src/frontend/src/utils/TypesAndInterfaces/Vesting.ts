// type
import type { Vesting } from '../generated/graphqlTypes'

// helpers
import { normalizeVestingStorage } from 'pages/Treasury/Treasury.helpers'

export type VestingStorage = ReturnType<typeof normalizeVestingStorage>

export type VestingGraphQL = Omit<Vesting, '__typename'>
