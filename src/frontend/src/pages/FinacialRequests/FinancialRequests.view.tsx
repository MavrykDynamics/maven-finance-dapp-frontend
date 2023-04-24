import { useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

// helpers, actions, consts
import { distinctRequestsByExecuting, getRequestStatus } from './FinancialRequests.helpers'
import {
  calculateSlicePositions,
  getPageNumber,
  ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST,
  PAGINATION_SIDE_RIGHT,
  PAST_REQUESTS_FINANCIAL_REQUESTS_LIST,
} from '../../app/App.components/Pagination/pagination.consts'
import { votingFinancialRequestVote } from './FinancialRequest.actions'
import { parseDate } from 'utils/time'

// types
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { State } from 'reducers'
import { FinancialRequestStoreType } from 'reducers/financialRequests'

// view
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { FRSListItem } from './FRSListItem.view'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'

// styles
import {
  FinancialRequestsRightContainer,
  FinancialRequestsStyled,
  InfoBlockValue,
  InfoBlockTitle,
  InfoBlockName,
} from './FinancialRequests.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

export const FinancialRequestsView = ({
  financialRequestsIds,
  financialRequestMapper,
}: {
  financialRequestsIds: FinancialRequestStoreType['financialRequestsIds']
  financialRequestMapper: FinancialRequestStoreType['financialRequestMapper']
}) => {
  const dispatch = useDispatch()
  const { search } = useLocation()

  const {
    accountPkh,
    user: { isSatellite: isUserSatellite },
  } = useSelector((state: State) => state.wallet)

  // Handling lists data
  const { ongoing, past } = distinctRequestsByExecuting(financialRequestsIds, financialRequestMapper)

  const currentOngoingPage = getPageNumber(search, ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST)
  const currentPastPage = getPageNumber(search, PAST_REQUESTS_FINANCIAL_REQUESTS_LIST)

  const paginatedPastItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPastPage, PAST_REQUESTS_FINANCIAL_REQUESTS_LIST)
    return past.slice(from, to)
  }, [currentPastPage, past])

  const paginatedOngoingItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentOngoingPage, ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST)
    return ongoing.slice(from, to)
  }, [currentOngoingPage, ongoing])

  const [rightSideContentId, setRightSideContentId] = useState(ongoing[0] ?? past[0] ?? 0)
  const rightSideContent = financialRequestMapper[rightSideContentId]

  // Full view item data handling
  const rightItemStatus = rightSideContent && getRequestStatus(rightSideContent)

  // Do not show voting buttons for past requests
  const isActiveVotingButtons = rightItemStatus === ProposalStatus.ONGOING

  const votingStats = {
    forVotesMVKTotal: rightSideContent.forVotesMVKTotal,
    againstVotesMVKTotal: rightSideContent.againstVotesMVKTotal,
    unusedVotesMVKTotal: Math.round(
      rightSideContent.sMVKTotakSupply - rightSideContent.forVotesMVKTotal - rightSideContent.againstVotesMVKTotal,
    ),
    quorum: rightSideContent.quorum,
  }

  const handleVotingRoundVote = (vote: string) => {
    dispatch(votingFinancialRequestVote(vote, rightSideContent.id))
  }

  const RightSideBlock = () =>
    rightSideContent ? (
      <FinancialRequestsRightContainer>
        <GovRightContainerTitleArea className="financial-request">
          <h1>{rightSideContent.type}</h1>
          <StatusFlag text={rightItemStatus} status={rightItemStatus} />
        </GovRightContainerTitleArea>

        <div className="voting_ending">
          Voting {rightItemStatus !== ProposalStatus.ONGOING ? 'ended' : 'ending'} on{' '}
          {parseDate({
            time: rightSideContent.votingTillTime,
            timeFormat: 'MMM DD, HH:mm:ss',
          })}
        </div>

        <VotingArea
          voteStatistics={votingStats}
          isVotingActive={rightItemStatus === ProposalStatus.ONGOING && Boolean(isUserSatellite)}
          handleVote={handleVotingRoundVote}
          buttonsToShow={
            isActiveVotingButtons
              ? { forBtn: { text: 'Approve' }, againsBtn: { text: 'Disapprove' } }
              : { forBtn: undefined, againsBtn: undefined }
          }
          className={'fr-voting'}
          disableVotingButtons={Boolean(rightSideContent?.votes?.find(({ voter_id }) => voter_id === accountPkh))}
        />

        <hr />

        <div className="info_section_wrapper">
          <div className="info_section">
            <InfoBlockTitle>Type</InfoBlockTitle>
            <InfoBlockName>{rightSideContent.type}</InfoBlockName>
          </div>

          <div className="info_section">
            <InfoBlockTitle>Requester</InfoBlockTitle>
            <InfoBlockValue>
              <TzAddress tzAddress={rightSideContent.requesterAddress} hasIcon />
            </InfoBlockValue>
          </div>
        </div>

        <div className="info_section">
          <InfoBlockTitle>Purpose</InfoBlockTitle>
          <InfoBlockName>{rightSideContent.purpose}</InfoBlockName>
        </div>

        <div className="info_section">
          <InfoBlockTitle>Token Info</InfoBlockTitle>
          <div className="list">
            <div className="list_item">
              <InfoBlockName>Amount Requested</InfoBlockName>
              <InfoBlockValue>
                <CommaNumber value={rightSideContent.tokensAmount} endingText={rightSideContent.tokenName} />
              </InfoBlockValue>
            </div>

            <div className="list_item">
              <InfoBlockName>Type</InfoBlockName>
              <InfoBlockValue>{rightSideContent.tokenName}</InfoBlockValue>
            </div>
          </div>
        </div>

        <div className="info_section">
          <InfoBlockTitle>Date Requested</InfoBlockTitle>
          <InfoBlockName>
            {parseDate({ time: rightSideContent.requestedTime, timeFormat: 'MMM DD, HH:mm:ss' })}
          </InfoBlockName>
        </div>

        <hr />

        <div className="info_section">
          <InfoBlockTitle>Governance Info</InfoBlockTitle>
          <div className="list">
            <div className="list_item">
              <InfoBlockName>Governance Contract</InfoBlockName>
              <InfoBlockValue>
                <TzAddress tzAddress={rightSideContent.governanceContract} />
              </InfoBlockValue>
            </div>

            <div className="list_item">
              <InfoBlockName>Governance Financial Contract</InfoBlockName>
              <InfoBlockValue>
                <TzAddress tzAddress={rightSideContent.governanceFinId} />
              </InfoBlockValue>
            </div>

            <div className="list_item">
              <InfoBlockName>Treasury Contract</InfoBlockName>
              <InfoBlockValue>
                <TzAddress tzAddress={rightSideContent.treasuryContract} />
              </InfoBlockValue>
            </div>
          </div>
        </div>
      </FinancialRequestsRightContainer>
    ) : null

  return (
    <FinancialRequestsStyled>
      <div className="list-container">
        {ongoing.length ? (
          <>
            <GovRightContainerTitleArea>
              <h1>Ongoing Requests</h1>
            </GovRightContainerTitleArea>
            <div className="list">
              {paginatedOngoingItemsList.map((frId, idx) => (
                <FRSListItem
                  key={frId}
                  id={idx + 1}
                  onClickHandler={() => setRightSideContentId(frId)}
                  request={financialRequestMapper[frId]}
                  selected={rightSideContent?.id === frId}
                />
              ))}

              <Pagination
                itemsCount={ongoing.length}
                side={PAGINATION_SIDE_RIGHT}
                listName={ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST}
              />
            </div>
          </>
        ) : null}

        {past.length ? (
          <>
            <GovRightContainerTitleArea>
              <h1>Past Requests</h1>
            </GovRightContainerTitleArea>
            <div className="list">
              {paginatedPastItemsList.map((frId, idx) => (
                <FRSListItem
                  key={frId}
                  id={idx + 1}
                  onClickHandler={() => setRightSideContentId(frId)}
                  request={financialRequestMapper[frId]}
                  selected={rightSideContent?.id === frId}
                />
              ))}

              <Pagination
                itemsCount={past.length}
                side={PAGINATION_SIDE_RIGHT}
                listName={PAST_REQUESTS_FINANCIAL_REQUESTS_LIST}
              />
            </div>
          </>
        ) : null}
      </div>
      <RightSideBlock />
    </FinancialRequestsStyled>
  )
}
