import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import {
  ProposalSubmittionButtons,
  MultyProposalsStyled,
  ProposalSubmissionForm,
  SubmitProposalHeader,
} from './ProposalSubmission.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { Page } from 'styles'

// types
import { State } from 'reducers'
import { MultyProposalItem, ProposalValidityObj, SubmittedProposalsMapper } from './ProposalSybmittion.types'
import { ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'

// consts
import { DEFAULT_PROPOSAL, DEFAULT_PROPOSAL_VALIDATION } from './ProposalSubmition.helpers'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_NAVIGATION,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'

// helpers
import { getBytesDiff, getPaymentsDiff } from './ProposalSubmition.helpers'
import { dropProposal, lockProposal, submitProposal, updateProposalData } from './ProposalSubmission.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    currentRoundProposalsIds,
    proposalsMapper,
    config: { fee, governancePhase },
    isLoaded: isGovernanceLoaded,
  } = useSelector((state: State) => state.governance)
  const { whitelistTokens, dipDupTokens } = useSelector((state: State) => state.tokens)

  const [activeTab, setActiveTab] = useState(1)
  const [selectedUserProposalId, setSeletedUserProposalId] = useState(-1)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      if (!isGovernanceLoaded || isDepsChanged) {
        await dispatch(getGovernanceStorage())
      }
    } catch (e) {}
  }, [])

  // proposals that user has submitted, reduced to object mapper and arr of keys for this object
  const [proposalKeys, mappedProposals, mappedValidation] = useMemo(() => {
    const { keys, mapper, validityObj } = currentRoundProposalsIds
      .filter((proposalId) => proposalsMapper[proposalId].proposerId === accountPkh)
      .reduce<SubmittedProposalsMapper>(
        (acc, proposalId) => {
          const proposal = proposalsMapper[proposalId]
          acc.mapper[proposalId] = proposal
          acc.validityObj[proposalId] = {
            title: '',
            description: '',
            sourceCode: '',
            ipfs: '',
            successMVKReward: '',
            invoiceTable: '',
            bytesValidation: proposal.proposalData.map((bytesPair) => ({
              validBytes: '',
              validTitle: '',
              byteId: bytesPair.id,
            })),
            paymentsValidation: proposal.proposalPayments.map((payment) => ({
              token_amount: '',
              title: '',
              to__id: '',
              paymentId: payment.id,
            })),
          }
          acc.keys.push(proposal.id)
          return acc
        },
        { keys: [], mapper: {}, validityObj: {} },
      )
    setSeletedUserProposalId(keys?.[0])
    return [keys, mapper, validityObj]
  }, [accountPkh, currentRoundProposalsIds, proposalsMapper])

  // mapping user created proposals to buttons data
  const usersProposalsToSwitch = useMemo(
    () =>
      (proposalKeys || [])
        .map<MultyProposalItem>((id) => ({
          text: mappedProposals[id].title,
          active: id === selectedUserProposalId,
          value: id,
        }))
        .concat(
          proposalKeys.length < 2 && governancePhase === 'PROPOSAL'
            ? [{ text: 'Create new Proposal', active: selectedUserProposalId === -1, value: -1 }]
            : [],
        ),
    [proposalKeys, governancePhase, selectedUserProposalId, mappedProposals],
  )

  const [proposalState, setProposalsState] = useState(mappedProposals)
  const [proposalsValidation, setProposalsValidation] = useState<Record<number, ProposalValidityObj>>({})

  const currentOriginalProposalId = useMemo(
    () => currentRoundProposalsIds.find((id) => selectedUserProposalId === id),
    [selectedUserProposalId, currentRoundProposalsIds],
  )

  const proposalHasChange = useMemo(() => {
    const submitProposalBody = proposalState[currentOriginalProposalId ?? -1]
    const remoteProposal = mappedProposals[currentOriginalProposalId ?? -1]

    const isTitleDiff = submitProposalBody?.title !== remoteProposal?.title,
      isDescrDiff = submitProposalBody?.description !== remoteProposal?.description,
      isSourceLinkDiff = submitProposalBody?.sourceCode !== remoteProposal?.sourceCode

    const filteredBytes = submitProposalBody?.proposalData.filter(({ title, encoded_code }) => title || encoded_code)

    const isBytesDiff =
      filteredBytes?.length === 0 && remoteProposal?.proposalData?.length === 0
        ? false
        : filteredBytes?.length !== remoteProposal?.proposalData?.length
        ? true
        : filteredBytes?.every(({ title, encoded_code }, idx) => {
            const remoteProposalByte = remoteProposal?.proposalData?.[idx]
            return title !== remoteProposalByte?.title || encoded_code !== remoteProposalByte?.encoded_code
          })

    const filteredPayments = submitProposalBody?.proposalPayments.filter(
      ({ token_amount, to__id }) => token_amount || to__id,
    )

    const isPaymentsDiff =
      filteredPayments?.length === 0 && remoteProposal?.proposalPayments?.length === 0
        ? false
        : filteredPayments?.length !== remoteProposal?.proposalPayments?.length
        ? true
        : filteredPayments?.every(({ token_amount, token_address, to__id }, idx) => {
            const remoteProposalPayment = remoteProposal?.proposalPayments?.[idx]
            return (
              to__id !== remoteProposalPayment?.to__id ||
              token_amount !== remoteProposalPayment?.token_amount ||
              token_address !== remoteProposalPayment?.token_address
            )
          })

    return isTitleDiff || isDescrDiff || isSourceLinkDiff || isBytesDiff || isPaymentsDiff
  }, [currentOriginalProposalId, mappedProposals, proposalState])

  const handleChangeTab = useCallback((tabId?: number) => {
    setActiveTab(tabId ?? 0)
  }, [])

  const changeActiveProposal = useCallback(
    (proposalId: number) => {
      setSeletedUserProposalId(proposalId)

      // it means that we choose create new proposal
      if (proposalId === -1 && !proposalState[-1]) {
        setProposalsState({
          ...proposalState,
          ...(proposalState[DEFAULT_PROPOSAL.id]
            ? { [DEFAULT_PROPOSAL.id - 1]: DEFAULT_PROPOSAL }
            : { [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL }),
        })
      }
    },
    [proposalState],
  )

  const updateLocalProposalData = useCallback(
    (newProposalData: Partial<ProposalRecordType>, proposalId: number) => {
      setProposalsState({
        ...proposalState,
        [proposalId]: {
          ...proposalState[proposalId],
          ...newProposalData,
        },
      })
    },
    [proposalState],
  )

  const updateLocalProposalValidation = useCallback(
    (newProposalValidation: Partial<ProposalValidityObj>, proposalId: number) => {
      setProposalsValidation({
        ...proposalsValidation,
        [proposalId]: {
          ...proposalsValidation[proposalId],
          ...newProposalValidation,
        },
      })
    },
    [proposalsValidation],
  )

  const handleLockProposal = async (proposalId: number) => {
    await dispatch(lockProposal(proposalId))
  }

  const handleDropProposal = async (proposalId: number) => {
    if (proposalId && proposalId !== -1) await dispatch(dropProposal(proposalId))
  }

  const handleUpdateData = async (proposalId: number) => {
    const currentOriginalProposal = currentOriginalProposalId ? proposalsMapper[currentOriginalProposalId] : null
    if (currentOriginalProposal) {
      const bytesDiff = getBytesDiff(
        currentOriginalProposal.proposalData ?? [],
        currentProposal.proposalData.filter(({ title, encoded_code }) => title || encoded_code),
      )
      const paymentsDiff = getPaymentsDiff(
        currentOriginalProposal?.proposalPayments ?? [],
        currentProposal.proposalPayments.filter(({ token_amount, to__id }) => token_amount || to__id),
        whitelistTokens,
        dipDupTokens,
      )
      await dispatch(updateProposalData(proposalId, bytesDiff, paymentsDiff))
    }
  }

  const handleSubmitProposal = async () => {
    // TODO: add also setting stage 2 and stage 3 stuff when submitting proposal
    await dispatch(
      submitProposal(
        {
          title: currentProposal.title,
          description: currentProposal.description,
          sourceCode: currentProposal.sourceCode,
          ipfs: '',
        },
        fee,
      ),
    )
  }

  // if user removed all his submitted proposals, show him create proposal tab with empty proposal form to fill up
  useEffect(() => {
    setProposalsState(
      proposalKeys.length
        ? mappedProposals
        : {
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL,
          },
    )
    setProposalsValidation(
      proposalKeys.length
        ? mappedValidation
        : {
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL_VALIDATION,
          },
    )
    setSeletedUserProposalId(proposalKeys?.[0] ?? DEFAULT_PROPOSAL.id)
  }, [mappedProposals, mappedValidation, proposalKeys])

  const [currentProposal, currentProposalValidation] = useMemo(
    () => [proposalState[selectedUserProposalId] ?? {}, proposalsValidation[selectedUserProposalId] ?? {}],
    [proposalState, proposalsValidation, selectedUserProposalId],
  )

  // action buttons stuff for disabling
  const isProposalSubmitted = selectedUserProposalId >= 0
  const isProposalPeriod = governancePhase === 'PROPOSAL'

  // Validate bytes, validate only non empty bytes
  const isBytesValid = useMemo(
    () =>
      currentProposalValidation.bytesValidation
        ?.filter(({ byteId }) => {
          return !mappedProposals?.[currentOriginalProposalId ?? -1]?.proposalData?.find(({ id }) => id === byteId)
        })
        .every(({ validBytes, validTitle, byteId }) => {
          const isSavedBytes = currentOriginalProposalId
            ? proposalsMapper[currentOriginalProposalId]?.proposalData?.find(({ id }) => id === byteId)
            : false
          return isSavedBytes
            ? validBytes !== INPUT_STATUS_ERROR
            : validBytes === INPUT_STATUS_SUCCESS && validTitle === INPUT_STATUS_SUCCESS
        }) ?? true,
    [currentOriginalProposalId, currentProposalValidation.bytesValidation, mappedProposals, proposalsMapper],
  )

  // Validate payments, validate only non empty payments
  const isPaymentsValid = useMemo(
    () =>
      currentProposalValidation.paymentsValidation
        ?.filter(({ paymentId }) => {
          return !mappedProposals?.[currentOriginalProposalId ?? -1]?.proposalPayments?.find(
            ({ id }) => id === paymentId,
          )
        })
        .every(
          ({ to__id, title, token_amount }) =>
            to__id === INPUT_STATUS_SUCCESS ||
            (title === INPUT_STATUS_SUCCESS && token_amount === INPUT_STATUS_SUCCESS),
        ) ?? true,
    [currentOriginalProposalId, currentProposalValidation.paymentsValidation, mappedProposals],
  )

  const isStageOneDataValid = useMemo(
    () =>
      currentProposalValidation.description === INPUT_STATUS_SUCCESS &&
      currentProposalValidation.title === INPUT_STATUS_SUCCESS &&
      currentProposalValidation.sourceCode === INPUT_STATUS_SUCCESS,
    [currentProposalValidation.description, currentProposalValidation.title, currentProposalValidation.sourceCode],
  )

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading your proposals</div>
        </DataLoaderWrapper>
      ) : (
        <>
          {usersProposalsToSwitch.length > 1 ? (
            <MultyProposalsStyled>
              {usersProposalsToSwitch.map(({ text, active, value }) => (
                <Button
                  key={value}
                  onClick={() => changeActiveProposal(value)}
                  kind={BUTTON_NAVIGATION}
                  selected={active}
                >
                  {text}
                </Button>
              ))}
            </MultyProposalsStyled>
          ) : null}

          <PropSubmissionTopBar valueCallback={handleChangeTab} />

          <ProposalSubmissionForm>
            <a
              className="info-link"
              href="https://mavryk.finance/litepaper#governance"
              target="_blank"
              rel="noreferrer"
            >
              <Icon id="question" />
            </a>

            <SubmitProposalHeader>
              <H2Title>Stage {activeTab}</H2Title>
              <StatusFlag
                text={currentProposal.locked ? ProposalStatus.LOCKED : ProposalStatus.UNLOCKED}
                status={currentProposal.locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
              />
            </SubmitProposalHeader>

            {activeTab === 1 && (
              <StageOneForm
                proposalId={selectedUserProposalId}
                currentProposal={currentProposal}
                currentProposalValidation={currentProposalValidation}
                updateLocalProposalValidation={updateLocalProposalValidation}
                updateLocalProposalData={updateLocalProposalData}
              />
            )}
            {activeTab === 2 && (
              <StageTwoForm
                proposalId={selectedUserProposalId}
                currentProposal={currentProposal}
                currentProposalValidation={currentProposalValidation}
                updateLocalProposalValidation={updateLocalProposalValidation}
                updateLocalProposalData={updateLocalProposalData}
              />
            )}
            {activeTab === 3 && (
              <StageThreeForm
                proposalId={selectedUserProposalId}
                currentProposal={currentProposal}
                currentProposalValidation={currentProposalValidation}
                updateLocalProposalValidation={updateLocalProposalValidation}
                updateLocalProposalData={updateLocalProposalData}
              />
            )}

            <ProposalSubmittionButtons>
              <Button
                kind={BUTTON_SECONDARY}
                form={BUTTON_WIDE}
                disabled={!isProposalSubmitted || !isProposalPeriod}
                onClick={() => handleDropProposal(selectedUserProposalId)}
              >
                <Icon id="navigation-menu_close" /> Drop Proposal
              </Button>
              <Button
                disabled={
                  !isProposalSubmitted ||
                  !isProposalPeriod ||
                  currentProposal.locked ||
                  proposalHasChange ||
                  !mappedProposals[currentOriginalProposalId ?? -1]?.proposalData.length
                }
                onClick={() => handleLockProposal(selectedUserProposalId)}
                kind={BUTTON_SECONDARY}
                form={BUTTON_WIDE}
              >
                <Icon id="lock" /> Lock Proposal
              </Button>
              {isProposalSubmitted ? (
                <Button
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  disabled={!proposalHasChange || currentProposal.locked || !isBytesValid || !isPaymentsValid}
                  onClick={() => handleUpdateData(selectedUserProposalId)}
                >
                  <Icon id="bytes" /> Save Changes
                </Button>
              ) : (
                <Button
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  // TODO: when add stage 2 and 3 to submit, add validation checking here
                  disabled={!isStageOneDataValid}
                  onClick={handleSubmitProposal}
                >
                  <Icon id="auction" /> Submit Proposal
                </Button>
              )}
            </ProposalSubmittionButtons>
          </ProposalSubmissionForm>
        </>
      )}
    </Page>
  )
}
