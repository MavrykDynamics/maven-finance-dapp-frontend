import { UserContextStateType } from '../user.provider.types'

export const DEFAULT_USER: UserContextStateType = {
  userAddress: null,
  satelliteMvkIsDelegatedTo: null,
  userAvatars: {
    mainAvatar: null,
    satelliteAvatar: null,
    counsilAvatar: null,
    breakGlassAvatar: null,
  },
  isNewlyRegisteredSatellite: false,
  isSatellite: false,
  isVestee: false,
  actionsHistory: [],
  govActionsCount: 0,
  gatheredDoormanRewards: 0,
  gatheredFarmRewards: 0,
  gatheredSatellitesRewards: 0,
  userTokensBalances: {},
}
