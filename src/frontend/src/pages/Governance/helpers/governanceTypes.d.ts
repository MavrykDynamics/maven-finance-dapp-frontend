export type ProposalVotersType = Array<{
  vote: number
  name: string
  avatar: string
  address: string
}>

export type ProposalsListType = Array<{
  title: string
  proposalsIds: Array<number>
  type: string
  listName: string
}>
