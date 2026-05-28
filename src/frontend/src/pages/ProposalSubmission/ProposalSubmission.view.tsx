import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import QueryString from 'qs'
import { useNavigate } from 'react-router'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { fetchGraphQLData } from 'providers/QueryProvider/useGraphQLQuery'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'

// view
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import {
  MultyProposalsStyled,
  ProposalSubmissionForm,
  ProposalSubmittionButtons,
  SubmitProposalHeader,
} from './ProposalSubmission.style'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

// types
import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { MultyProposalItem, ProposalValidityObj } from './ProposalSubmission.types'

// consts
import {
  BUTTON_NAVIGATION,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'
import {
  DROP_PROPOSAL_ACTION,
  GovPhases,
  LOCK_PROPOSAL_ACTION,
  SUBMIT_PROPOSAL_ACTION,
  UPDATE_PROPOSAL_DATA_ACTION,
} from 'providers/ProposalsProvider/helpers/proposals.const'
import { GOVERNANCE_LATEST_USER_PROPOSAL_QUERY } from 'providers/ProposalsProvider/queries/getLatestUserProposal.query'
import { DEFAULT_PROPOSAL, DEFAULT_PROPOSAL_VALIDATION } from './helpers/proposalSubmission.const'
import {
  DROP_PROPOSAL_BUTTON_TOOLTIP,
  NEXT_STEP_BUTTON_TOOLTIP,
  SAVE_CHANGES_BUTTON_TOOLTIP,
  SUBMIT_PROPOSAL_BUTTON_TOOLTIP,
} from 'texts/tooltips/governance'

// helpers & actions
import {
  dropProposal,
  lockProposal,
  submitProposal,
  updateProposalData,
} from 'providers/ProposalsProvider/actions/proposalsSubmission.actions'
import { getBytesDiff, getPaymentsDiff } from './helpers/ProposalSubmissionDiff.utils'
import { isAbortError, unknownToError } from 'errors/error'
import { api } from 'utils/api/api'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import {
  checkStage1Validation,
  checkStage2Validation,
  checkStage3Validation,
  isProposalHasChange,
} from './helpers/proposalSubmissionValidation.utils'
import { mergeRemoteProposalsWithClient, normalizeProposalsForSubmitProposal } from './helpers/normalizeRemoteProposals'

export const ProposalSubmissionView = memo(({ selectedUserProposalId }: { selectedUserProposalId: number }) => {
  const navigate = useNavigate()

  const { bug } = useToasterContext()
  const { handleQueryError } = useQueryProvider()
  const { tokensMetadata } = useTokensContext()
  const { userAddress, isNewlyRegisteredSatellite } = useUserContext()
  const {
    preferences: { themeSelected },
    contractAddresses: { governanceAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const {
    config: { fee, governancePhase, currentRoundEndLevel },
    proposalsMapper,
    submissionProposalsIds,
  } = useProposalsContext()

  const [activeTab, setActiveTab] = useState(1)
  const [isFormDisabled, setIsFormDisabled] = useState(true)
  const [lastProposalIdFromOperation, setLastProposalIdFromOperation] = useState<null | number>(null)

  useEffect(() => {
    if (governancePhase !== GovPhases.PROPOSAL && governancePhase !== GovPhases.EXECUTION) return
    const abortController = new AbortController()

    ;(async () => {
      try {
        const { data: votingEndTimestamp } = await api(
          getTimestampByLevelUrl(currentRoundEndLevel),
          { signal: abortController.signal, headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )

        // TODO: mb show bug in a future
        if (dayjs(votingEndTimestamp).diff() <= 0) {
          setIsFormDisabled(true)
          console.error('current round is over, move to next round, please')
          return
        }

        setIsFormDisabled(false)
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
          bug('Unexpected error happened occured, please reload the page')
        }
      }
    })()

    return () => abortController.abort()
  }, [currentRoundEndLevel])

  // proposals that user has submitted, reduced to object mapper and arr of keys for this object
  // this object represents ds we can use with stages, to interact with in tables, inputs, etc
  const [proposalKeys, mappedProposals, mappedValidation] = useMemo(
    () => normalizeProposalsForSubmitProposal({ submissionProposalsIds, proposalsMapper }),
    [submissionProposalsIds, proposalsMapper],
  )

  // Proposals user can swith between and modify, and validation to it
  const [proposalState, setProposalsState] = useState<Record<number, ProposalRecordType>>(mappedProposals)
  const [proposalsValidation, setProposalsValidation] = useState<Record<number, ProposalValidityObj>>(mappedValidation)

  // Track proposals update on remote
  useLayoutEffect(() => {
    const { proposals, validation } = mergeRemoteProposalsWithClient({
      mappedProposals,
      mappedValidation,
      proposalKeys,
      proposalState,
      proposalsValidation,
      lastProposalIdFromOperation,
    })

    setProposalsState(proposals)
    setProposalsValidation(validation)
    setLastProposalIdFromOperation(null)
  }, [mappedProposals, mappedValidation, proposalKeys])

  // mapping user created proposals to tabs buttons data
  const usersProposalsToSwitch = useMemo(
    () =>
      proposalKeys.concat(proposalKeys.length < 2 ? [DEFAULT_PROPOSAL.id] : []).map<MultyProposalItem>((id) => ({
        text: id === DEFAULT_PROPOSAL.id ? 'Create new Proposal' : mappedProposals[id].title,
        active: id === selectedUserProposalId,
        value: id,
      })),
    [proposalKeys, selectedUserProposalId, mappedProposals],
  )

  // Current proposal on client validation to it and current proposal on remote (might not exists if it's create new proposal with id -1)
  const currentProposal: ProposalRecordType = proposalState[selectedUserProposalId] ?? DEFAULT_PROPOSAL
  const currentProposalValidation: ProposalValidityObj =
    proposalsValidation[selectedUserProposalId] ?? DEFAULT_PROPOSAL_VALIDATION
  const currentProposalOnRemote: ProposalRecordType | null = proposalsMapper[selectedUserProposalId] ?? null

  // ------ ACTIONS HANDLERDS START ------
  // Change user's vieving proposal
  const changeActiveProposal = useCallback(
    (proposalId: number) => {
      // redirect if id is different from current and user is on the submit proposal page, cuz redirect occurs after an operation, so user can change the page
      if (proposalId !== selectedUserProposalId && window.location.pathname.includes('submit-proposal'))
        navigate(`/submit-proposal?${QueryString.stringify({ proposalId })}`)
    },
    [navigate, selectedUserProposalId],
  )

  const updateLocalProposalData = (newProposalData: Partial<ProposalRecordType>, proposalId: number) => {
    setProposalsState({
      ...proposalState,
      [proposalId]: {
        ...proposalState[proposalId],
        ...newProposalData,
      },
    })
  }

  const updateLocalProposalValidation = (newProposalValidation: Partial<ProposalValidityObj>, proposalId: number) => {
    setProposalsValidation({
      ...proposalsValidation,
      [proposalId]: {
        ...proposalsValidation[proposalId],
        ...newProposalValidation,
      },
    })
  }

  const handleNextStep = (tabId: number) => setActiveTab(tabId)

  // actions helper for dapp data update callback read {README} in useContractHook folder --------------------------------

  // drop proposal action --------------------------------------------------------
  const dropActionFn = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!governanceAddress) {
      bug('Wrong governance address')
      return null
    }
    if (selectedUserProposalId && selectedUserProposalId !== -1) {
      return await dropProposal(governanceAddress, selectedUserProposalId)
    }

    return null
  }, [bug, governanceAddress, selectedUserProposalId, userAddress])

  const dropContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DROP_PROPOSAL_ACTION,
      actionFn: dropActionFn,
      dappActionCallback: () =>
        changeActiveProposal(submissionProposalsIds.find((id) => id !== selectedUserProposalId) ?? DEFAULT_PROPOSAL.id),
    }),
    [changeActiveProposal, dropActionFn, selectedUserProposalId, submissionProposalsIds],
  )

  const { action: handleDropProposal } = useContractAction(dropContractProps)

  // lock proposal action --------------------------------------------------------
  const lockActionFn = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!governanceAddress) {
      bug('Wrong governance address')
      return null
    }

    return await lockProposal(governanceAddress, selectedUserProposalId)
  }, [bug, governanceAddress, selectedUserProposalId, userAddress])

  const lockContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: LOCK_PROPOSAL_ACTION,
      actionFn: lockActionFn,
    }),
    [lockActionFn],
  )

  const { action: handleLockProposal } = useContractAction(lockContractProps)

  // submit proposal action handler ----------------------------------------------
  // submission callback to update data
  const getNewProposalId = useCallback(async () => {
    try {
      const newProposalData = await fetchGraphQLData<{ governance_proposal: Array<{ id: number }> }>(
        GOVERNANCE_LATEST_USER_PROPOSAL_QUERY,
        { userAddress },
      )

      // changeActiveProposal
      if (newProposalData.governance_proposal.length) {
        const { id } = newProposalData.governance_proposal[0]
        changeActiveProposal(id ?? DEFAULT_PROPOSAL.id)

        if (proposalState[DEFAULT_PROPOSAL.id]) {
          setProposalsState((prev) => ({
            ...prev,
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL,
          }))
        }
      }
    } catch (e) {
      bug('Fetch Error', 'Error occured while loading latest proposal id, please reload the page')
    }
  }, [changeActiveProposal, proposalState, userAddress])

  const submitActionFn = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!governanceAddress) {
      bug('Wrong governance address')
      return null
    }

    const bytes = getBytesDiff(
      [],
      currentProposal.proposalData.filter(
        ({ title, encoded_code, code_description }) => title || encoded_code || code_description,
      ),
    )

    const payments = getPaymentsDiff(
      [],
      currentProposal.proposalPayments.filter(({ token_amount, to__id }) => token_amount || to__id),
      tokensMetadata,
    )

    const { title, description, sourceCode, invoice } = currentProposal

    return await submitProposal(
      governanceAddress,
      {
        title,
        description,
        sourceCode,
        invoice,
      },
      fee,
      bytes,
      payments,
    )
  }, [bug, currentProposal, fee, governanceAddress, tokensMetadata, userAddress])

  const submitContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SUBMIT_PROPOSAL_ACTION,
      actionFn: submitActionFn,
      dappActionCallback: getNewProposalId,
    }),
    [getNewProposalId, submitActionFn],
  )

  const { action: handleProposalSubmit } = useContractAction(submitContractProps)

  // update proposal action handler ----------------------------------------------
  const updateActionFn = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!governanceAddress) {
      bug('Wrong governance address')
      return null
    }

    const bytesDiff = getBytesDiff(
      currentProposalOnRemote.proposalData,
      currentProposal.proposalData.filter(
        ({ title, encoded_code, code_description }) => title || encoded_code || code_description,
      ),
    )
    const paymentsDiff = getPaymentsDiff(
      currentProposalOnRemote.proposalPayments,
      currentProposal.proposalPayments.filter(({ token_amount, to__id }) => token_amount || to__id),
      tokensMetadata,
    )

    setLastProposalIdFromOperation(selectedUserProposalId)
    return await updateProposalData(governanceAddress, selectedUserProposalId, bytesDiff, paymentsDiff)
  }, [
    bug,
    currentProposal,
    currentProposalOnRemote,
    governanceAddress,
    tokensMetadata,
    userAddress,
    selectedUserProposalId,
  ])

  const updateContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_PROPOSAL_DATA_ACTION,
      actionFn: updateActionFn,
    }),
    [updateActionFn],
  )

  const { action: handleProposalUpdate } = useContractAction(updateContractProps)

  /**
   *
   * if proposal exists in indexer @currentProposalOnRemote !== null we update it with diff between stage 2 & 3 on client and remote via @updateProposalData method
   * if proposal doesn't exists save it via @submitProposal action call
   */
  const handleUpdateData = async () => {
    try {
      if (!currentProposalOnRemote) {
        await handleProposalSubmit()
      } else {
        await handleProposalUpdate()
      }
    } catch (e) {
      const err = unknownToError(e)
      bug(err.message)
    }
  }

  // ------ ACTIONS HANDLERDS END ------

  // disabling action buttons
  const isProposalSubmitted = selectedUserProposalId >= 0
  const isProposalPeriod = governancePhase === GovPhases.PROPOSAL || governancePhase === GovPhases.EXECUTION

  // Detect whether proposal has smth to save
  const proposalHasChange = useMemo(
    () =>
      isProposalSubmitted && isProposalPeriod && !currentProposal.locked
        ? isProposalHasChange({
            clientProposal: currentProposal,
            remoteProposal: currentProposalOnRemote,
          })
        : false,
    [isProposalSubmitted, isProposalPeriod, currentProposal, currentProposalOnRemote],
  )

  // validate bytes (stage 2)
  const isBytesValid = useMemo(
    () =>
      checkStage2Validation({
        proposalValidation: currentProposalValidation,
        currentProposal,
        remoteProposal: currentProposalOnRemote,
      }),
    [currentProposal, currentProposalOnRemote, currentProposalValidation],
  )

  // validate payments (stage 3)
  const isPaymentsValid = useMemo(
    () =>
      checkStage3Validation({
        proposalValidation: currentProposalValidation,
        currentProposal,
        remoteProposal: currentProposalOnRemote,
      }),
    [currentProposal, currentProposalValidation, currentProposalOnRemote],
  )

  // validate proposal metadata (stage 1)
  const isStageOneDataValid = checkStage1Validation({ proposalValidation: currentProposalValidation })

  const genProposalDisabledState = !isProposalPeriod || isNewlyRegisteredSatellite

  /**
   * save btn is used to create and update proposal
   *
   * create is disabled if stage 1, state 2 or 3 has invalid data
   * or if it's not proposal period or user can not iteract with proposals, cuz he is newly registered
   *
   * update is disabled if state 2 or 3 has invalid data or proposal don't have chanes to save
   * or if it's not proposal period or user can not iteract with proposals, cuz he is newly registered
   * or proposal is locked and can not be modified
   *
   * currentProposal.id === DEFAULT_PROPOSAL.id means we are on "create new proposal" tab creating new proposal that is not exist yet
   */
  const isSaveProposalDisabled =
    !isBytesValid ||
    !isPaymentsValid ||
    genProposalDisabledState ||
    (currentProposal.id === DEFAULT_PROPOSAL.id ? !isStageOneDataValid : currentProposal.locked || !proposalHasChange)

  const isSubmitDisabled =
    !isProposalSubmitted ||
    currentProposal.locked ||
    proposalHasChange ||
    genProposalDisabledState ||
    currentProposal?.proposalData?.filter(({ title, encoded_code }) => title || encoded_code).length < 1

  const isDropDisabled = !isProposalSubmitted || genProposalDisabledState

  return (
    <>
      {usersProposalsToSwitch.length > 1 ? (
        <MultyProposalsStyled>
          {usersProposalsToSwitch.map(({ text, active, value }) => (
            <Button key={value} onClick={() => changeActiveProposal(value)} kind={BUTTON_NAVIGATION} selected={active}>
              {text}
            </Button>
          ))}
        </MultyProposalsStyled>
      ) : null}

      <PropSubmissionTopBar valueCallback={handleNextStep} activeTab={activeTab} />

      <ProposalSubmissionForm>
        <a
          className="info-link"
          href="https://docs.mavenfinance.io/maven-finance/governance/governance-rounds/proposal-round"
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="question" />
        </a>

        <SubmitProposalHeader>
          <H2Title>Step {activeTab}</H2Title>
          <StatusFlag text={currentProposal.status} status={currentProposal.status} />
        </SubmitProposalHeader>

        {activeTab === 1 && (
          <StageOneForm
            proposalId={selectedUserProposalId}
            isFormDisabled={isFormDisabled}
            currentProposal={currentProposal}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
          />
        )}
        {activeTab === 2 && (
          <StageTwoForm
            proposalId={selectedUserProposalId}
            isFormDisabled={isFormDisabled}
            currentProposal={currentProposal}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
          />
        )}
        {activeTab === 3 && (
          <StageThreeForm
            proposalId={selectedUserProposalId}
            isFormDisabled={isFormDisabled}
            currentProposal={currentProposal}
            currentProposalValidation={currentProposalValidation}
            updateLocalProposalValidation={updateLocalProposalValidation}
            updateLocalProposalData={updateLocalProposalData}
          />
        )}

        <ProposalSubmittionButtons>
          {/* Drop proposal drops proposal */}
          <div className="btn-wrapper">
            <Button
              kind={BUTTON_SECONDARY}
              form={BUTTON_WIDE}
              disabled={isDropDisabled || isActionActive}
              onClick={handleDropProposal}
            >
              <Icon id="navigation-menu_close" /> Drop Proposal
            </Button>
            <Tooltip>
              <Tooltip.Trigger className="tooltip-trigger">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{DROP_PROPOSAL_BUTTON_TOOLTIP}</Tooltip.Content>
            </Tooltip>
          </div>

          {/* Submit proposal locks proposal */}
          <div className="btn-wrapper">
            <Button
              kind={BUTTON_SECONDARY}
              form={BUTTON_WIDE}
              disabled={isSubmitDisabled || isActionActive}
              onClick={handleLockProposal}
            >
              <Icon id="submit" /> Submit Proposal
            </Button>
            <Tooltip>
              <Tooltip.Trigger className="tooltip-trigger">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{SUBMIT_PROPOSAL_BUTTON_TOOLTIP}</Tooltip.Content>
            </Tooltip>
          </div>

          {/* save changes btn (it creates if proposal is not created, or updates data if proposal exists) */}
          <div className="btn-wrapper">
            <Button
              kind={activeTab !== 3 ? BUTTON_SECONDARY : BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              disabled={isSaveProposalDisabled || isActionActive}
              onClick={handleUpdateData}
            >
              <Icon id="save" /> {isProposalSubmitted ? 'Save Changes' : 'Save Proposal'}
            </Button>
            <Tooltip>
              <Tooltip.Trigger className="tooltip-trigger">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{SAVE_CHANGES_BUTTON_TOOLTIP}</Tooltip.Content>
            </Tooltip>
          </div>

          {/* if we are not on stage 3 show next step (navigating to thee next stage btn) */}
          {activeTab !== 3 ? (
            <div className="btn-wrapper">
              <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={() => handleNextStep(activeTab + 1)}>
                Next Step <Icon id="full-arrow-right" />
              </Button>
              <Tooltip>
                <Tooltip.Trigger className="tooltip-trigger">
                  <Icon id="info" />
                </Tooltip.Trigger>
                <Tooltip.Content>{NEXT_STEP_BUTTON_TOOLTIP}</Tooltip.Content>
              </Tooltip>
            </div>
          ) : null}
        </ProposalSubmittionButtons>
      </ProposalSubmissionForm>
    </>
  )
})
ProposalSubmissionView.displayName = 'ProposalSubmissionView'
