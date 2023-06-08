import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import QueryString from 'qs'
import { useHistory } from 'react-router'

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
import { State } from 'reducers'
import { MultyProposalItem, ProposalValidityObj, SubmittedProposalsMapper } from './ProposalSubmission.types'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'

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

import colors from 'styles/colors'
import {
  DROP_PROPOSAL_BUTTON_TOOLTIP,
  SUBMIT_PROPOSAL_BUTTON_TOOLTIP,
  SAVE_CHANGES_BUTTON_TOOLTIP,
  NEXT_STEP_BUTTON_TOOLTIP,
} from 'texts/tooltips/governance'

// helpers & actions
import { getBytesDiff, getPaymentsDiff } from './ProposalSubmission.helpers'
import { dropProposal, lockProposal, submitProposal, updateProposalData } from './ProposalSubmission.actions'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

export const ProposalSubmissionView = ({ selectedUserProposalId }: { selectedUserProposalId: number }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { tokensMetadata } = useTokensContext()

  const {
    accountPkh,
    user: { isNewlyRegisteredSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    currentRoundProposalsIds,
    proposalsMapper,
    config: { fee, governancePhase },
  } = useSelector((state: State) => state.governance)
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const [activeTab, setActiveTab] = useState(1)

  // proposals that user has submitted, reduced to object mapper and arr of keys for this object
  // this object represents ds we can use with stages, to interact with in tables, inputs, etc
  const [proposalKeys, mappedProposals, mappedValidation] = useMemo(() => {
    const { keys, mapper, validityObj } = currentRoundProposalsIds
      .filter((proposalId) => proposalsMapper[proposalId].proposerId === accountPkh)
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
  }, [accountPkh, currentRoundProposalsIds, proposalsMapper])

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
  const changeActiveProposal = (proposalId: number) => {
    if (proposalId !== selectedUserProposalId)
      history.replace(`/submit-proposal?${QueryString.stringify({ proposalId })}`)
  }

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
  const handleLockProposal = async (proposalId: number) => await dispatch(lockProposal(proposalId))
  const handleDropProposal = async (proposalId: number) =>
    proposalId && proposalId !== -1 ? await dispatch(dropProposal(proposalId)) : null

  /**
   * @param proposalId id of proposal to save | update
   *
   * if proposal exists in indexer @currentProposalOnRemote !== null we update it with diff between stage 2 & 3 on client and remote via @updateProposalData method
   * if proposal doesn't exists save it via @submitProposal action call
   */
  const handleUpdateData = async (proposalId: number) => {
    if (!currentProposalOnRemote) {
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

      await dispatch(
        submitProposal(
          {
            title: currentProposal.title,
            description: currentProposal.description,
            sourceCode: currentProposal.sourceCode,
            invoice: currentProposal.invoice,
          },
          fee,
          bytes,
          payments,
          changeActiveProposal,
        ),
      )
    } else {
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
      await dispatch(updateProposalData(proposalId, bytesDiff, paymentsDiff))
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
          {/* Drop proposal drops proposal */}
          <div className="btn-wrapper">
            <Button
              kind={BUTTON_SECONDARY}
              form={BUTTON_WIDE}
              disabled={isDropDisabled || isActionActive}
              onClick={() => handleDropProposal(selectedUserProposalId)}
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
              onClick={() => handleLockProposal(selectedUserProposalId)}
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
              onClick={() => handleUpdateData(selectedUserProposalId)}
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
