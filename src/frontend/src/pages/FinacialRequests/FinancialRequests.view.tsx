import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router'

// helpers
import { getRequestStatus } from 'providers/FinancialRequestsProvider/helpers/financialRequests.utils'
import { parseDate } from 'utils/time'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// consts
import {
  calculateSlicePositions,
  getPageNumber,
  ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST,
  PAGINATION_SIDE_RIGHT,
  PAST_REQUESTS_FINANCIAL_REQUESTS_LIST,
} from '../../app/App.components/Pagination/pagination.consts'
import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'
import { FINANCIAL_REQUEST_VOTE_ACTION } from 'providers/FinancialRequestsProvider/helpers/financialRequests.consts'

// actions
import { votingFinancialRequestVote } from 'providers/FinancialRequestsProvider/actions/financialRequests.actions'

// types
import { FinancialRequestsContext } from 'providers/FinancialRequestsProvider/financialRequests.provider.types'

// view
import { StatusFlag } from '../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { FRSListItem } from './FRSListItem.view'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'
import {
  FinancialRequestsRightContainer,
  FinancialRequestsStyled,
  InfoBlockValue,
  InfoBlockTitle,
  InfoBlockName,
} from './FinancialRequests.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const FinancialRequestsView = ({
  ongoingFinancialRequestsIds: ongoing,
  pastFinancialRequestsIds: past,
  financialRequestsMapper,
}: {
  ongoingFinancialRequestsIds: FinancialRequestsContext['ongoingFinRequestsIds']
  pastFinancialRequestsIds: FinancialRequestsContext['pastFinRequestsIds']
  financialRequestsMapper: FinancialRequestsContext['financialRequestsMapper']
}) => {
  const { search } = useLocation()

  const { tokensMetadata } = useTokensContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { governanceFinancialAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { userAddress, isSatellite: isUserSatellite } = useUserContext()

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

  const [rightSideContentId, setRightSideContentId] = useState<
    keyof FinancialRequestsContext['financialRequestsMapper']
  >(ongoing[0] ?? past[0] ?? '-1')
  const rightSideContent = financialRequestsMapper[rightSideContentId] ?? null

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

  // financial request voting action -------------------------------------------------
  const finVotingRoundVoteActionFn = useCallback(
    async (vote: `${VotingTypes}`) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!governanceFinancialAddress) {
        bug('Wrong governanceFinancial address')
        return null
      }

      return await votingFinancialRequestVote(governanceFinancialAddress, vote, rightSideContent.id)
    },
    [bug, governanceFinancialAddress, rightSideContent.id, userAddress],
  )

  const contractActionProps: HookContractActionArgs<`${VotingTypes}`> = useMemo(
    () => ({
      actionType: FINANCIAL_REQUEST_VOTE_ACTION,
      actionFn: finVotingRoundVoteActionFn,
    }),
    [finVotingRoundVoteActionFn],
  )

  const { actionWithArgs: handleVotingRoundVote } = useContractAction<`${VotingTypes}`>(contractActionProps)

  const RightSideBlock = () => {
    if (!rightSideContent) return null

    const requestedToken = getTokenDataByAddress({ tokenAddress: rightSideContent.tokenAddress, tokensMetadata })
    // TODO add empty screen
    if (!requestedToken) return null

    const { decimals, symbol } = requestedToken

    // -1 in cases there are NOT any votes or it's past fin request, so all buttons will be active if user satisfies all conditions for voting
    const userVote = ongoing.includes(String(rightSideContent.id))
      ? rightSideContent.votes.find(({ voter }) => voter === userAddress)?.vote ?? -1
      : -1

    return (
      <FinancialRequestsRightContainer>
        <div className="title-status">
          <H2Title>{rightSideContent.type}</H2Title>
          <StatusFlag text={rightItemStatus} status={rightItemStatus} />
        </div>

        <div className="voting_ending">
          {rightSideContent.droppedTime ? (
            <>
              Request was dropped on {parseDate({ time: rightSideContent.droppedTime, timeFormat: 'MMM DD, HH:mm' })}{' '}
              CEST
            </>
          ) : (
            <>
              Voting {rightItemStatus === ProposalStatus.ONGOING ? 'ending' : 'ended'} on{' '}
              {parseDate({ time: rightSideContent.votingTillTime, timeFormat: 'MMM DD, HH:mm' })} CEST
            </>
          )}
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
          disableButtonByVote={userVote}
          disableVotingButtons={isActionActive}
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
              <TzAddress tzAddress={rightSideContent.requesterAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
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
                <CommaNumber
                  value={convertNumberForClient({ number: rightSideContent.tokensAmount, grade: decimals })}
                  endingText={symbol}
                />
              </InfoBlockValue>
            </div>

            <div className="list_item">
              <InfoBlockName>Type</InfoBlockName>
              <InfoBlockValue>{symbol}</InfoBlockValue>
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
                <TzAddress tzAddress={rightSideContent.governanceContract} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </InfoBlockValue>
            </div>

            <div className="list_item">
              <InfoBlockName>Governance Financial Contract</InfoBlockName>
              <InfoBlockValue>
                <TzAddress tzAddress={rightSideContent.governanceFinId} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </InfoBlockValue>
            </div>

            <div className="list_item">
              <InfoBlockName>Treasury Contract</InfoBlockName>
              <InfoBlockValue>
                <TzAddress tzAddress={rightSideContent.treasuryContract} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
              </InfoBlockValue>
            </div>
          </div>
        </div>
      </FinancialRequestsRightContainer>
    )
  }

  return (
    <FinancialRequestsStyled>
      {/* TODO add empty screen when no requests at all */}
      <div className="list-container">
        {ongoing.length ? (
          <>
            <H2Title>Ongoing Requests</H2Title>
            <div className="list">
              {paginatedOngoingItemsList.map((frId, idx) => (
                <FRSListItem
                  key={frId}
                  id={idx + 1}
                  onClickHandler={() => setRightSideContentId(frId)}
                  request={financialRequestsMapper[frId]}
                  selected={rightSideContent?.id.toString() === frId}
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
            <H2Title>Past Requests</H2Title>
            <div className="list">
              {paginatedPastItemsList.map((frId, idx) => (
                <FRSListItem
                  key={frId}
                  id={idx + 1}
                  onClickHandler={() => setRightSideContentId(frId)}
                  request={financialRequestsMapper[frId]}
                  selected={rightSideContent?.id.toString() === frId}
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
