import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import QueryString from 'qs'
import { useHistory } from 'react-router'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// view
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
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// types
import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { MultyProposalItem, ProposalValidityObj, SubmittedProposalsMapper } from './ProposalSubmission.types'

// consts
import {
  DEFAULT_PROPOSAL,
  DEFAULT_PROPOSAL_VALIDATION,
  checkStage1Validation,
  checkStage2Validation,
  checkStage3Validation,
  isProposalHasChange,
} from './ProposalSubmission.helpers'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_NAVIGATION,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'
import {
  DROP_PROPOSAL_ACTION,
  LOCK_PROPOSAL_ACTION,
  SUBMIT_PROPOSAL_ACTION,
  UPDATE_PROPOSAL_DATA_ACTION,
} from 'providers/ProposalsProvider/helpers/proposals.const'
import { GOVERNANCE_LATEST_USER_PROPOSAL_QUERY } from 'providers/ProposalsProvider/queries/getLatestUserProposal.query'
import colors from 'styles/colors'
import {
  DROP_PROPOSAL_BUTTON_TOOLTIP,
  SUBMIT_PROPOSAL_BUTTON_TOOLTIP,
  SAVE_CHANGES_BUTTON_TOOLTIP,
  NEXT_STEP_BUTTON_TOOLTIP,
} from 'texts/tooltips/governance'

// helpers & actions
import {
  submitProposal,
  updateProposalData,
  lockProposal,
  dropProposal,
} from 'providers/ProposalsProvider/actions/proposalsSubmission.actions'
import { getBytesDiff, getPaymentsDiff } from './ProposalSubmission.helpers'
import { unknownToError } from 'errors/error'
import { isAbortError } from 'errors/error'
import { api } from 'utils/api/api'
import {
  getTimestampByLevelUrl,
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
} from 'utils/api/api-helpers/getTimestampByLevel'

export const ProposalSubmissionView = ({ selectedUserProposalId }: { selectedUserProposalId: number }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { bug } = useToasterContext()
  const { apolloClient } = useApolloContext()

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

  useEffect(() => {
    const abortController = new AbortController()

    ;(async () => {
      try {
        const { data: votingEndTimestamp } = await api(
          getTimestampByLevelUrl(currentRoundEndLevel),
          { signal: abortController.signal, headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )

        setIsFormDisabled(dayjs(votingEndTimestamp).diff() <= 0)
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
        }
        bug('Unexpected error happened occured, please reload the page')
      }
    })()

    return () => abortController.abort()
  }, [currentRoundEndLevel])

  // proposals that user has submitted, reduced to object mapper and arr of keys for this object
  // this object represents ds we can use with stages, to interact with in tables, inputs, etc
  const [proposalKeys, mappedProposals, mappedValidation] = useMemo(() => {
    const { keys, mapper, validityObj } = submissionProposalsIds
      .filter((proposalId) => proposalsMapper[proposalId].proposerId === userAddress)
      .reduce<SubmittedProposalsMapper>(
        (acc, proposalId) => {
          const proposal = proposalsMapper[proposalId]
          acc.mapper[proposalId] = proposal
          acc.validityObj[proposalId] = {
            ...DEFAULT_PROPOSAL_VALIDATION,
            bytesValidation: proposal.proposalData.map((bytesPair) => ({
              validBytes: '',
              validTitle: '',
              validDescr: '',
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

    if (keys.length < 2) {
      return [
        keys.concat(DEFAULT_PROPOSAL.id),
        { ...mapper, [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL },
        { ...validityObj, [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL_VALIDATION },
      ]
    }
    return [keys, mapper, validityObj]
  }, [userAddress, submissionProposalsIds, proposalsMapper])

  // mapping user created proposals to tabs buttons data
  const usersProposalsToSwitch = useMemo(
    () =>
      proposalKeys.map<MultyProposalItem>((id) => ({
        text: id === DEFAULT_PROPOSAL.id ? 'Create new Proposal' : mappedProposals[id].title,
        active: id === selectedUserProposalId,
        value: id,
      })),
    [proposalKeys, selectedUserProposalId, mappedProposals],
  )

  // Proposals user can swith between and modify, and validation to it
  const [proposalState, setProposalsState] = useState<Record<number, ProposalRecordType>>(mappedProposals)
  const [proposalsValidation, setProposalsValidation] = useState<Record<number, ProposalValidityObj>>(mappedValidation)

  // Track proposals update on remote
  useEffect(() => {
    // if we have user's proposals on remote set them to view/update, else set default proposal
    setProposalsState(mappedProposals)
    // set validation for proposals above
    setProposalsValidation(mappedValidation)
  }, [mappedProposals, mappedValidation, proposalKeys])

  // Current proposal on client validation to it and current proposal on remote (might not exists if it's create new proposal with id -1)
  const currentProposal: ProposalRecordType | null = proposalState[selectedUserProposalId] ?? null
  const currentProposalValidation: ProposalValidityObj | null = proposalsValidation[selectedUserProposalId] ?? null
  const currentProposalOnRemote: ProposalRecordType | null = proposalsMapper[selectedUserProposalId] ?? null

  // ------ ACTIONS HANDLERDS START ------
  // Change user's vieving proposal
  const changeActiveProposal = useCallback(
    (proposalId: number) => {
      if (proposalId !== selectedUserProposalId)
        history.replace(`/submit-proposal?${QueryString.stringify({ proposalId })}`)
    },
    [history, selectedUserProposalId],
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
    }),
    [dropActionFn],
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
      const newProposalData = await apolloClient.query({
        query: GOVERNANCE_LATEST_USER_PROPOSAL_QUERY,
        variables: {
          userAddress,
        },
      })

      if (newProposalData.error) {
        console.error('loading new proposal error', newProposalData.error)
        throw new Error(newProposalData.error.message)
      }

      if (newProposalData.data.governance_proposal.length) {
        const { id } = newProposalData.data.governance_proposal[0]
        changeActiveProposal(id ?? DEFAULT_PROPOSAL.id)
      }

      // changeActiveProposal
    } catch (e) {
      bug('Fetch Error', 'Error occured while loading latest proposal id, please reload the page')
    }
  }, [bug, changeActiveProposal, userAddress])

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

    return await submitProposal(
      governanceAddress,
      {
        title: currentProposal.title,
        description: currentProposal.description,
        sourceCode: currentProposal.sourceCode,
        invoice: currentProposal.invoice,
      },
      fee,
      bytes,
      payments,
    )
  }, [
    bug,
    currentProposal.description,
    currentProposal.invoice,
    currentProposal.proposalData,
    currentProposal.proposalPayments,
    currentProposal.sourceCode,
    currentProposal.title,
    fee,
    governanceAddress,
    tokensMetadata,
    userAddress,
  ])

  const submissionDappCallback = useCallback(async () => {
    await getNewProposalId() // update proposal id after successful action
  }, [getNewProposalId])

  const submitContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SUBMIT_PROPOSAL_ACTION,
      actionFn: submitActionFn,
      dappCallback: submissionDappCallback,
    }),
    [submissionDappCallback, submitActionFn],
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

    return await updateProposalData(governanceAddress, selectedUserProposalId, bytesDiff, paymentsDiff)
  }, [
    bug,
    currentProposal.proposalData,
    currentProposal.proposalPayments,
    currentProposalOnRemote.proposalData,
    currentProposalOnRemote.proposalPayments,
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
  const isProposalPeriod = governancePhase === 'PROPOSAL'

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
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
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
            <CustomTooltip
              className="tooltip"
              iconId="info"
              text={DROP_PROPOSAL_BUTTON_TOOLTIP}
              defaultStrokeColor={colors[themeSelected]['valueColor']}
            />
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
            <CustomTooltip
              className="tooltip"
              iconId="info"
              text={SUBMIT_PROPOSAL_BUTTON_TOOLTIP}
              defaultStrokeColor={colors[themeSelected]['valueColor']}
            />
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
            <CustomTooltip
              className="tooltip"
              iconId="info"
              text={SAVE_CHANGES_BUTTON_TOOLTIP}
              defaultStrokeColor={colors[themeSelected]['valueColor']}
            />
          </div>

          {/* if we are not on stage 3 show next step (navigating to thee next stage btn) */}
          {activeTab !== 3 ? (
            <div className="btn-wrapper">
              <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={() => handleNextStep(activeTab + 1)}>
                Next Step <Icon id="full-arrow-right" />
              </Button>
              <CustomTooltip
                className="tooltip"
                iconId="info"
                text={NEXT_STEP_BUTTON_TOOLTIP}
                defaultStrokeColor={colors[themeSelected]['valueColor']}
              />
            </div>
          ) : null}
        </ProposalSubmittionButtons>
      </ProposalSubmissionForm>
    </>
  )
}
