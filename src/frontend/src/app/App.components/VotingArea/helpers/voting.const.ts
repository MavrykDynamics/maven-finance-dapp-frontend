export enum VotingTypes {
  NAY = 'nay',
  YAY = 'yay',
  PASS = 'pass',
}

// TODO: clarify with Tristan, cuz in indexer schema says: NAY - 0, YAY - 1, PASS - 2
export const VoteList = {
  NAY: 0,
  PASS: 2,
  YAY: 1,
}
