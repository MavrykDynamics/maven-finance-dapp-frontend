// Proposal statuses
export const ONGOING_PROPOSAL_STATUS_TOOLTIP = 'Proposal is open for voting during this voting round.'
export const UNLOCKED_PROPOSAL_STATUS_TOOLTIP =
  'Proposal is unlocked and can be edited at this time. Can only be voted on once the proposer locks it.'
export const LOCKED_PROPOSAL_STATUS_TOOLTIP =
  'Proposal is locked. Proposal data can no longer be edited. Able to be voted on.'

//	Proposal Submittion Buttons
export const SAVE_CHANGES_BUTTON_TOOLTIP =
  'Save your current progress in the building of your proposal. Note that you have to at least filled out the first step in order to save it.'
export const NEXT_STEP_BUTTON_TOOLTIP = 'Move on to the next step of creating a proposal.'
export const SUBMIT_PROPOSAL_BUTTON_TOOLTIP =
  'Submit proposal for voting. After submission, you are unable to edit your proposal anymore. The only way to fix an issue with it is to drop it and recreate from the start.'
export const DROP_PROPOSAL_BUTTON_TOOLTIP =
  'Drop your proposal from the round, you will be unable to retrieve it afterwards. Please double check yourself before doing this action.'

// Proposal Submission stages description
export const STAGE_1_DESCRIPTION = `Welcome to the first step of creating a governance proposal. In this step you will add basic information to your
proposal. Please note, you have the option to fill out all 3 steps one after the other and then save them or
save as you go. Furthermore, once you have submitted your proposal, you are unable to make any more changes to
it and it is open to voting. So please ensure your proposal is ready before you click Submit Proposal.`
export const STAGE_2_DESCRIPTION = `In this step, you are able to add sets of bytes to your proposal. Each set of bytes can change/add one part of
Mavryk Finance’s smart contracts. For example, a set can create a new farm and another set of bytes can whitelist a
token for one of the treasury contracts. Read more about in the Mavryk Finance Docs`
export const STAGE_3_DESCRIPTION = `In this step, you are able to add a list of payments and treasury transfers to your proposal. This can used to
request payment for the work you have put into your proposal or to rearrange treasury funds. If you are a
business and using an actual invoice in Step 1, please add each required payment to this table also.`
