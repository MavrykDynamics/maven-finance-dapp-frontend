import { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

// types
import { ProposalRecordType, GovPhases, GovernancePhaseType } from '../../utils/TypesAndInterfaces/Governance'

// helpers
import {
  WAITING_PROPOSALS_LIST_NAME,
  WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME,
  ONGOING_VOTING_PROPOSALS_LIST_NAME,
  ONGOING_PROPOSALS_LIST_NAME,
  NEXT_PROPOSALS_LIST_NAME,
  HISTORY_PROPOSALS_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'

// components
import { Proposals } from './components/Proposals/Proposals.controller'

// styles
import { GovernanceLeftContainer, GovernanceStyled, EmptyContainer } from './Governance.style'
import { ProposalDetails } from './components/ProposalDetails/ProposalDetails'

type GovernanceViewProps = {
  currentProposals: Array<number>
  governancePhase: GovernancePhaseType
  handleExecuteProposal: (arg: number) => void
}

const emptyContainer = (
  <EmptyContainer className="empty">
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No proposals to show</figcaption>
  </EmptyContainer>
)

export const GovernanceView = ({ currentProposals, handleExecuteProposal }: GovernanceViewProps) => {
  const { pathname } = useLocation()

  // const { governanceStorage, currentRoundProposals } = useSelector((state: State) => state.governance)

  const [rightSideContent, setRightSideContent] = useState<ProposalRecordType | undefined>(undefined)

  const onProposalHistoryPage = useMemo(() => pathname === '/proposal-history', [pathname])

  const _handleItemSelect = (chosenProposal: ProposalRecordType | undefined) => {
    setRightSideContent(chosenProposal)
  }

  // const isVisibleOngoingVoting =
  //   !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === GovPhases.VOTING
  // const isVisibleOngoingTimeLock =
  //   !onProposalHistoryPage && Boolean(ongoingProposals?.length) && governancePhase === GovPhases.TIMELOCK
  // const isVisibleNextProposal =
  //   !onProposalHistoryPage && Boolean(nextProposals?.length) && governancePhase === GovPhases.PROPOSAL
  // const isVisibleHistoryProposal = onProposalHistoryPage && Boolean(pastProposals?.length)

  const [visibleLists, setVisibleLists] = useState<Record<string, boolean>>({
    wating: false,
    ongoingVoiting: false,
    ongoingTimeLock: false,
    next: false,
    history: false,
  })

  // const isVisibleWating = !onProposalHistoryPage && Boolean(watingProposals?.length)
  // const isVisibleWatingPayment = !onProposalHistoryPage && Boolean(waitingForPaymentToBeProcessed?.length)

  const someVisible = Object.values(visibleLists).some((item) => item)

  // useEffect(() => {
  //   const visibleTypes: Record<string, boolean> = {
  //     wating: isVisibleWating,
  //     ongoingVoiting: isVisibleOngoingVoting,
  //     ongoingTimeLock: isVisibleOngoingTimeLock,
  //     next: isVisibleNextProposal,
  //     history: isVisibleHistoryProposal,
  //   }
  //   setVisibleLists(visibleTypes)

  //   const defaultProposalSelectedListName = Object.keys(visibleTypes).find((key: string) =>
  //     Boolean(visibleTypes[key]),
  //   ) as 'wating' | 'ongoingVoiting' | 'ongoingTimeLock' | 'next' | 'history' | undefined

  //   switch (defaultProposalSelectedListName) {
  //     case 'wating':
  //       setRightSideContent(watingProposals[0])
  //       break
  //     case 'ongoingVoiting':
  //       setRightSideContent(ongoingProposals[0])
  //       break
  //     case 'ongoingTimeLock':
  //       setRightSideContent(ongoingProposals[0])
  //       break
  //     case 'next':
  //       setRightSideContent(nextProposals[0])
  //       break
  //     case 'history':
  //       setRightSideContent(pastProposals[0])
  //       break
  //   }
  // }, [
  //   isVisibleWating,
  //   isVisibleOngoingVoting,
  //   isVisibleOngoingTimeLock,
  //   isVisibleNextProposal,
  //   isVisibleHistoryProposal,
  //   watingProposals,
  //   ongoingProposals,
  //   nextProposals,
  //   pastProposals,
  // ])

  useEffect(() => {
    if (!someVisible) {
      setRightSideContent(undefined)
    }
  }, [someVisible])

  return (
    <GovernanceStyled>
      {/* {someVisible ? ( */}
      <GovernanceLeftContainer>
        {/* {isVisibleWating && (
            <Proposals
              proposalsList={watingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              title="Waiting for Execution"
              type="wating"
              listName={WAITING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleWatingPayment && (
            <Proposals
              proposalsList={waitingForPaymentToBeProcessed}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              title="Waiting For Payment To Be Processed"
              type="wating"
              listName={WAITING_FOR_PAYMENT_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleOngoingVoting && (
            <Proposals
              proposalsList={ongoingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="ongoingVoiting"
              listName={ONGOING_VOTING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleOngoingTimeLock && (
            <Proposals
              proposalsList={ongoingProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="ongoingTimeLock"
              listName={ONGOING_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleNextProposal && (
            <Proposals
              proposalsList={nextProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="next"
              listName={NEXT_PROPOSALS_LIST_NAME}
            />
          )}
          {isVisibleHistoryProposal && (
            <Proposals
              proposalsList={pastProposals}
              handleItemSelect={_handleItemSelect}
              selectedProposal={rightSideContent}
              type="history"
              listName={HISTORY_PROPOSALS_LIST_NAME}
            />
          )} */}
        {/* <Proposals
          proposalsList={currentProposals}
          handleItemSelect={_handleItemSelect}
          selectedProposal={rightSideContent}
          type="ongoingTimeLock"
          listName={ONGOING_PROPOSALS_LIST_NAME}
        /> */}
      </GovernanceLeftContainer>
      {/*  ) : (
        emptyContainer
       )} */}
      {rightSideContent && rightSideContent.id !== 0 ? <ProposalDetails proposal={rightSideContent} /> : null}
    </GovernanceStyled>
  )
}

// (
//   <GovernanceRightContainer isAuthorized={Boolean(accountPkh)}>
//     <GovRightContainerTitleArea>
//       <h1>{rightSideContent.title}</h1>
//       <StatusFlag text={statusFlag} status={statusFlag} />
//     </GovRightContainerTitleArea>

//     {votingEnding ? (
//       <RightSideSubContent id="votingDeadline">
//         Voting {isEndedVotingTime ? 'ended' : 'ending'} on{' '}
//         {parseDate({ time: votingTime, timeFormat: 'MMMM Do HH:mm Z' })} CEST
//       </RightSideSubContent>
//     ) : null}

//     {statusFlag === 'UNLOCKED' ? (
//       <InfoBlock className="info-block">
//         <Icon id="info" />
//         {userIsSatellite ? (
//           <p>
//             Your proposal isn’t locked yet and can’t be voted on. You can lock it on the proposal submission page.
//           </p>
//         ) : (
//           <p>
//             This proposal isn’t locked yet and can’t be voted on until then. The proposer is still building it and
//             will lock it in the coming days
//           </p>
//         )}
//       </InfoBlock>
//     ) : null}

//     <div className="voting-proposal">
//       <VotingProposalsArea
//         voteStatistics={voteStatistics}
//         currentProposalStage={{
//           isPastProposals: isVisibleHistoryProposal,
//           isTimeLock: isVisibleOngoingTimeLock,
//           isAbleToMakeProposalRoundVote,
//           isVotingPeriod: isVisibleOngoingVoting,
//         }}
//         votingPhaseHandler={handleVotingRoundVote}
//         handleProposalVote={handleProposalRoundVote}
//         selectedProposal={rightSideContent}
//         vote={rightSideContent.votes.find(
//           ({ voter_id, round }) =>
//             voter_id === accountPkh && round === (governancePhase === GovPhases.PROPOSAL ? 0 : 1),
//         )}
//       />

//       {isExecuteProposal ? (
//         <Button
//           className="execute-proposal"
//           text="Execute Proposal"
//           onClick={handleClickExecuteProposal}
//           kind="actionPrimary"
//         />
//       ) : null}
//       {isPaymentProposal ? (
//         <Button
//           className="execute-proposal"
//           text="Process Payment"
//           onClick={handleClickProcessPayment}
//           kind="actionPrimary"
//         />
//       ) : null}
//     </div>
//     <hr />

//     {rightSideContent.description ? (
//       <article>
//         <RightSideSubHeader>Description</RightSideSubHeader>
//         <RightSideSubContent>{rightSideContent.description}</RightSideSubContent>
//       </article>
//     ) : null}

//     <article>
//       <RightSideSubHeader>Source Code</RightSideSubHeader>
//       <RightSideSubContent>
//         {rightSideContent.sourceCode ? (
//           <a href={rightSideContent.sourceCode} target="_blank" rel="noreferrer">
//             {rightSideContent.sourceCode}
//           </a>
//         ) : (
//           'No link to source code given'
//         )}
//       </RightSideSubContent>
//     </article>

//     <article>
//       <RightSideSubHeader>Meta-Data</RightSideSubHeader>
//       {rightSideContent.proposalData?.length ? (
//         <ol className="proposal-list">
//           {rightSideContent.proposalData.map((item) => {
//             if (!item || !item.encoded_code) return null
//             const unique = `proposalDataItem${item.id}`
//             return (
//               <li key={item.id}>
//                 <div>
//                   <div>
//                     <b className="proposal-list-title">Title: {item.title}</b>
//                   </div>
//                   <div>
//                     <b className="proposal-list-title">Bytes: </b>
//                     <span className="proposal-list-bites">
//                       {visibleMeta === unique ? (
//                         <span className="byte">
//                           <button onClick={() => handleCopyToClipboard(item.encoded_code ?? '')}>
//                             {item.encoded_code} <Icon id="copyToClipboard" />
//                           </button>
//                           <br />
//                           <button onClick={() => setVisibleMeta('')} className="visible-button">
//                             hide
//                           </button>
//                         </span>
//                       ) : (
//                         <span className="short-byte">
//                           {getShortByte(item.encoded_code)}{' '}
//                           <button onClick={() => setVisibleMeta(unique)} className="visible-button">
//                             see all
//                           </button>
//                         </span>
//                       )}
//                     </span>
//                   </div>
//                 </div>
//               </li>
//             )
//           })}
//         </ol>
//       ) : (
//         <RightSideSubContent>No proposal meta-data given</RightSideSubContent>
//       )}
//     </article>

//     <article className="payment-data">
//       <RightSideSubHeader>Payment Data</RightSideSubHeader>
//       {rightSideContent.proposalPayments?.length ? (
//         <Table className="editable-table">
//           <TableHeader className="editable-head">
//             <TableRow>
//               <TableHeaderCell className="no-right-border">Address</TableHeaderCell>
//               <TableHeaderCell>Purpose</TableHeaderCell>
//               <TableHeaderCell>Amount</TableHeaderCell>
//               <TableHeaderCell className="right-border">Payment Type (XTZ/MVK)</TableHeaderCell>
//             </TableRow>
//           </TableHeader>
//           <TableBody className="editable-body">
//             {rightSideContent.proposalPayments.map((payment) => {
//               const { symbol: selectedSymbol = 'MVK' } =
//                 paymentMethods.find(({ address }) => address === payment.token_address) ??
//                 paymentMethods?.[0] ??
//                 {}

//               return (
//                 <TableRow className="editable-row">
//                   <TableCell width="25%">
//                     <TzAddress
//                       tzAddress={String(payment.to__id)}
//                       type={BLUE}
//                       hasIcon={true}
//                       className="table-cell-tzAddress"
//                     />
//                   </TableCell>
//                   <TableCell width="25%">{String(payment.title)}</TableCell>
//                   <TableCell width="25%">
//                     <CommaNumber value={Number(payment.token_amount)} endingText={selectedSymbol} />
//                   </TableCell>
//                   <TableCell className="no-right-border" width="25%">
//                     {selectedSymbol}
//                   </TableCell>
//                 </TableRow>
//               )
//             })}
//           </TableBody>
//         </Table>
//       ) : (
//         <RightSideSubContent>No payment data given</RightSideSubContent>
//       )}
//     </article>

//     {rightSideContent.proposerId ? (
//       <article>
//         <RightSideSubHeader>Proposer</RightSideSubHeader>
//         <RightSideSubContent>
//           <div className="address">
//             <TzAddress tzAddress={rightSideContent.proposerId} hasIcon={true} isBold={true} />
//           </div>
//         </RightSideSubContent>
//       </article>
//     ) : null}

//     {rightSideContent.governanceId ? (
//       <article>
//         <RightSideSubHeader>Governance Info</RightSideSubHeader>
//         <div className="governance-contract">
//           <p>Governance Contract</p>
//           <TzAddress tzAddress={rightSideContent.governanceId} hasIcon={true} isBold={true} />
//         </div>
//       </article>
//     ) : null}
//     {userIsSatellite &&
//     !isVisibleHistoryProposal &&
//     canDropPhase &&
//     rightSideContent.proposerId === accountPkh ? (
//       <div className="drop-proposal">
//         <Button icon="close-stroke" text="Drop Proposal" kind="actionSecondary" onClick={handleDeleteProposal} />
//       </div>
//     ) : null}
//   </GovernanceRightContainer>
// )
