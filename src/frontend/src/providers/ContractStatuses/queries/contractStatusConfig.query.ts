import { gql } from 'utils/__generated__'

export const CONTRACT_STATUSES_CONFIG_QUERY = gql(`
query glassBrokenStatusAndWhiteListDevs {
  break_glass: break_glass {
    glass_broken
  }
  
  whitelist_developer: whitelist_developer {
    developer {
      address
    }
  }
}
`)
