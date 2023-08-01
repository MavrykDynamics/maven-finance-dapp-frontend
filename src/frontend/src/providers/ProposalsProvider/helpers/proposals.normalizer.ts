export const normalizeProposal = (
  item: GovernanceProposalGraphQL,
  { governancePhase, cycleHighestVotedProposalId, timelockProposalId }: State['governance']['config'],
) => {
  const proposalConvertedStatus = getProposalStatus(
    item,
    governancePhase,
    cycleHighestVotedProposalId,
    timelockProposalId,
  )

  const anyCanExecute = !item.current_round_proposal && timelockProposalId === item.id && !item.executed
  const anyCanPay =
    !item.current_round_proposal &&
    timelockProposalId === item.id &&
    item.executed &&
    item.payments.length &&
    !item.payment_processed

  return {
    id: item.id,
    proposerId: item.proposer.address,
    governanceId: item.governance.address,

    status: proposalConvertedStatus,
    anyCanExecute,
    anyCanPay,

    title: item.title,
    description: item.description,
    invoice: item.invoice,

    paymentProcessed: item.payment_processed,
    executed: item.executed,
    locked: item.locked,
    currentRoundProposal: item.current_round_proposal,

    currentCycleEndLevel: item.current_cycle_end_level,
    droppedTime: item?.dropped_datetime,
    defeatedTime: item?.defeated_datetime,
    executionTime: item?.execution_datetime,
    cycle: item.cycle,
    successReward: item.success_reward,
    sourceCode: item.source_code,

    // voting data
    passVoteMvkTotal: convertNumberForClient({ number: item.proposal_vote_smvk_total, grade: MVK_DECIMALS }),
    upvoteMvkTotal: convertNumberForClient({ number: item.yay_vote_smvk_total, grade: MVK_DECIMALS }),
    downvoteMvkTotal: convertNumberForClient({ number: item.nay_vote_smvk_total, grade: MVK_DECIMALS }),
    abstainMvkTotal: convertNumberForClient({ number: item.pass_vote_smvk_total, grade: MVK_DECIMALS }),
    quorumMvkTotal: convertNumberForClient({ number: item.quorum_smvk_total, grade: MVK_DECIMALS }),
    votes: item.votes.reduce<
      Array<{ vote: SatelliteVoteType; address: string; name: string; avatar: string; round: number }>
    >((acc, vote) => {
      try {
        const voteValue = satelliteVoteSchema.parse(vote.vote)
        acc.push({
          round: vote.round,
          address: vote.voter.address,
          name: vote.voter.satellites[0].name,
          vote: voteValue,
          avatar: vote.voter.satellites[0].image,
        })
      } catch (e) {
        console.error('governance_votes vote parse error: ', { e })
      } finally {
        return acc
      }
    }, []),
    minQuorumPercentage: convertNumberForClient({ number: item.min_quorum_percentage, grade: 4 }),

    proposalData: item.data.map((byte, idx) => ({
      ...byte,
      order: idx,
      isUnderTheDrop: false,
      isLocalBytes: false,
    })),

    proposalPayments: item.payments
      .map(({ to_, title, id, token_id, token_amount, token }) => ({
        id,
        to__id: to_?.address,
        title,
        token_address: token?.token_address,
        token_id,
        token_amount,
      }))
      .filter(({ token_address, to__id, token_amount }) => token_address && to__id && token_amount),
  }
}

export const normalizeGovernanceProposals = (
  indexerData: ProposalsDataSubscriptionSubscription,
  governanceConfig: State['governance']['config'],
): Omit<Omit<State['governance'], 'isLoaded'>, 'config'> => {
  const { governancePhase, timelockProposalId } = governanceConfig
  const isProposalRound = governancePhase === GovPhases.PROPOSAL

  return proposals.reduce<Omit<Omit<State['governance'], 'isLoaded'>, 'config'>>(
    (acc, proposalFromGQL) => {
      const normalizedProposal = normalizeProposal(proposalFromGQL, governanceConfig)

      const { id, executed, status, currentRoundProposal, paymentProcessed } = normalizedProposal

      acc.proposalsMapper[id] = normalizedProposal
      acc.allProposalsIds.push(id)

      const isPastProposal =
        status === ProposalStatus.DROPPED || status === ProposalStatus.EXECUTED || status === ProposalStatus.DEFEATED

      // Add id of proposal to be executed proposal
      if (isProposalRound && !executed && timelockProposalId === id && !isPastProposal) {
        acc.waitingProposalsIdsToBeExecuted.push(id)
        return acc
      }

      // Add id of proposal to be paid proposal
      if (isProposalRound && !executed && timelockProposalId === id && !paymentProcessed && !isPastProposal) {
        acc.waitingProposalsIdsToBePaid.push(id)
        return acc
      }

      // Add id of past proposal
      if (isPastProposal) {
        acc.pastProposalsIds.push(id)
        return acc
      }

      // Add id of current round proposal
      if (currentRoundProposal) {
        acc.currentRoundProposalsIds.push(id)
        return acc
      }

      return acc
    },
    {
      currentRoundProposalsIds: [],
      pastProposalsIds: [],
      waitingProposalsIdsToBeExecuted: [],
      waitingProposalsIdsToBePaid: [],
      allProposalsIds: [],
      proposalsMapper: {},
    },
  )
}
