export enum VotingTypes {
  NO = 'nay',
  YES = 'yay',
  PASS = 'pass',
}

// TODO: clarify with Tristan, cuz in indexer schema says: no - 0, yes - 1, pass 2
export const VoteList = {
  // NO: 0,
  PASS: 0,
  YES: 1,
  // PASS: 2,
  NO: 2,
}
