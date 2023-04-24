export const GOVERNANCE_CONFIG_QUERY = `
  query GetGovernanceConfigQuery {
    governance(where: {active: {_eq: true}}) {
      address
      current_round
      success_reward
      cycle_id

      proposal_invoice_max_length
      proposal_metadata_title_max_length
      proposal_description_max_length
      proposal_source_code_max_length
      proposal_title_max_length

      proposal_submission_fee_mutez
      timelock_proposal_id
      cycle_highest_voted_proposal_id
    }
  }
`

export const GOVERNANCE_CONFIG_QUERY_NAME = 'GetGovernanceConfigQuery'
export const GOVERNANCE_CONFIG_QUERY_VARIABLE = {}

export const GOVERNANCE_PROPOSALS_QUERY = `
  query GetGovernanceProposalsQuery {
    governance_proposal(order_by: {start_datetime: desc}) {
      current_cycle_end_level
      cycle
      success_reward
      
      id
      proposer_id
      governance_id
      
      description
      title
      
      current_round_proposal
      locked
      executed
      status
      payment_processed
      
      min_quorum_percentage
      quorum_smvk_total
      nay_vote_smvk_total
      pass_vote_smvk_total
      yay_vote_smvk_total
      proposal_vote_smvk_total
      
      source_code

      votes {
        round
        vote
        voter_id
      }

      data {
        encoded_code
        governance_proposal_id
        code_description
        id
        title
      }

      payments {
        governance_proposal_id
        id
        internal_id
        title
        to__id
        token_amount
        token_address
      }
    }
  }
`

export const GOVERNANCE_PROPOSALS_QUERY_NAME = 'GetGovernanceProposalsQuery'
export const GOVERNANCE_PROPOSALS_QUERY_VARIABLE = {}
