import { useEffect, useMemo, useState } from 'react'
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
} from '../../app/Pagination/pagination.consts'
import { calcWithoutMu, calcWithoutPrecision } from 'utils/calcFunctions'
import { votingRinancialRequestVote } from 'pages/Governance/Governance.actions'
import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'
import { parseDate } from 'utils/time'

// types
import { FinancialRequestRecord, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { State } from 'reducers'

// view
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'app/Pagination/Pagination.view'
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
  financialRequestsList = [],
}: {
  financialRequestsList: Array<FinancialRequestRecord>
}) => {
  const dispatch = useDispatch()
  const { search } = useLocation()

  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const {
    accountPkh,
    user: { isSatellite: isUserSatellite },
  } = useSelector((state: State) => state.wallet)

  // Handling lists data
  const { ongoing, past } = distinctRequestsByExecuting(financialRequestsList)

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

  const [rightSideContent, setRightSideContent] = useState(ongoing[0] ?? past[0])

  // Full view item data handling
  const rightItemStatus = rightSideContent && getRequestStatus(rightSideContent)

  const [votingStats, setVoteStatistics] = useState({
    forVotesMVKTotal: 0,
    againstVotesMVKTotal: 0,
    unusedVotesMVKTotal: 0,
    quorum: 0,
  })

  useEffect(() => {
    setVoteStatistics({
      forVotesMVKTotal: rightSideContent.forVotesMVKTotal,
      againstVotesMVKTotal: rightSideContent.againstVotesMVKTotal,
      unusedVotesMVKTotal: Math.round(
        rightSideContent.sMVKTotakSupply - rightSideContent.forVotesMVKTotal - rightSideContent.againstVotesMVKTotal,
      ),
      quorum: rightSideContent.quorum,
    })
  }, [rightSideContent])

  const handleVotingRoundVote = (vote: string) => {
    switch (vote) {
      case VotingTypes.YES:
        setVoteStatistics({
          ...votingStats,
          forVotesMVKTotal: +votingStats.forVotesMVKTotal + 1,
          unusedVotesMVKTotal: +votingStats.unusedVotesMVKTotal - 1,
        })
        break
      case VotingTypes.NO:
        setVoteStatistics({
          ...votingStats,
          againstVotesMVKTotal: +votingStats.againstVotesMVKTotal + 1,
          unusedVotesMVKTotal: +votingStats.unusedVotesMVKTotal - 1,
        })
        break
      default:
        return
    }

    dispatch(votingRinancialRequestVote(vote, rightSideContent.id))
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
          buttonsToShow={{ forBtn: { text: 'Approve' }, againsBtn: { text: 'Disapprove' } }}
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
              {paginatedOngoingItemsList.map((item, idx) => (
                <FRSListItem
                  key={item.id}
                  id={idx + 1}
                  onClickHandler={() => setRightSideContent(item)}
                  request={item}
                  selected={rightSideContent?.id === item.id}
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
              {paginatedPastItemsList.map((item, idx) => (
                <FRSListItem
                  key={item.id}
                  id={idx + 1}
                  onClickHandler={() => setRightSideContent(item)}
                  request={item}
                  selected={rightSideContent?.id === item.id}
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
