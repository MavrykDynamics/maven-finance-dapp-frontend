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
