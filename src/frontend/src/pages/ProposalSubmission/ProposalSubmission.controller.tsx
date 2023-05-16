import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { MultyProposalItem, ProposalValidityObj, SubmittedProposalsMapper } from './ProposalSubmittion.types'
import { ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'

// consts
import {
  DEFAULT_PROPOSAL,
  DEFAULT_PROPOSAL_VALIDATION,
  checkStage1Validation,
  checkStage2Validation,
  checkStage3Validation,
  isProposalHasChange,
} from './ProposalSubmition.helpers'
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
import { Info } from 'app/App.components/Info/Info.view'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'
import { UNREGISTERED_SATELLITE_BANNER_TEXT } from 'texts/banners/satellite.text'

export const ProposalSubmission = () => {
  const lastSelectedProposalId = useRef(-1)
  const dispatch = useDispatch()

  const {
    accountPkh,
    user: { isNewlyRegisteredSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    currentRoundProposalsIds,
    proposalsMapper,
    config: { fee, governancePhase },
    isLoaded: isGovernanceLoaded,
  } = useSelector((state: State) => state.governance)
  const { whitelistTokens, dipDupTokens } = useSelector((state: State) => state.tokens)

  const [activeTab, setActiveTab] = useState(1)
  const [selectedUserProposalId, setSeletedUserProposalId] = useState(lastSelectedProposalId.current)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      if (!isGovernanceLoaded || isDepsChanged) {
        await dispatch(getGovernanceStorage())
      }
    } catch (e) {}
  }, [])

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
    return [keys, mapper, validityObj]
  }, [accountPkh, currentRoundProposalsIds, proposalsMapper])

  // mapping user created proposals to tabs buttons data
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

  // Proposals user can swith between and modify, and validation to it
  const [proposalState, setProposalsState] = useState(mappedProposals)
  const [proposalsValidation, setProposalsValidation] = useState<Record<number, ProposalValidityObj>>({})

  // Track proposals update on remote
  useEffect(() => {
    // if we have user's proposals on remote set them to view/update, else set default proposal
    setProposalsState(
      proposalKeys.length
        ? mappedProposals
        : {
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL,
          },
    )
    // set validation for proposals above
    setProposalsValidation(
      proposalKeys.length
        ? mappedValidation
        : {
            [DEFAULT_PROPOSAL.id]: DEFAULT_PROPOSAL_VALIDATION,
          },
    )

    // If last selected proposal by user is not exists
    if (!proposalKeys.includes(lastSelectedProposalId.current)) {
      // set first remote we have
      if (proposalKeys.length) {
        setSeletedUserProposalId(proposalKeys[0])
        lastSelectedProposalId.current = proposalKeys[0]
      } else {
        // else set "Create new" proposal as initial seleced
        setSeletedUserProposalId(DEFAULT_PROPOSAL.id)
        lastSelectedProposalId.current = DEFAULT_PROPOSAL.id
      }
    }
  }, [mappedProposals, mappedValidation, proposalKeys])

  // Current proposal on client, used to show proposal data in stages
  const [currentProposal, currentProposalValidation] = useMemo(
    () => [proposalState[selectedUserProposalId] ?? {}, proposalsValidation[selectedUserProposalId] ?? {}],
    [proposalState, proposalsValidation, selectedUserProposalId],
  )

  // ------ ACTIONS HANDLERDS START ------
  // Change proposal stage
  const handleChangeTab = (tabId?: number) => setActiveTab(tabId ?? 0)

  // Change user's vieving proposal
  const changeActiveProposal = (proposalId: number) => {
    setSeletedUserProposalId(proposalId)
    lastSelectedProposalId.current = proposalId

    // it means that we choose create new proposal
    if (proposalId === -1 && !proposalState[-1]) {
      setProposalsState({
        ...proposalState,
        [DEFAULT_PROPOSAL.id - 1]: { ...DEFAULT_PROPOSAL },
      })
    }
  }

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
    const currentOriginalProposal = selectedUserProposalId ? proposalsMapper[selectedUserProposalId] : null
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
    const bytes = getBytesDiff(
      [],
      currentProposal.proposalData.filter(({ title, encoded_code }) => title || encoded_code),
    )

    const payments = getPaymentsDiff(
      [],
      currentProposal.proposalPayments.filter(({ token_amount, to__id }) => token_amount || to__id),
      whitelistTokens,
      dipDupTokens,
    )

    await dispatch(
      submitProposal(
        {
          title: currentProposal.title,
          description: currentProposal.description,
          sourceCode: currentProposal.sourceCode,
          ipfs: '',
        },
        fee,
        bytes,
        payments,
      ),
    )
  }
  // ------ ACTIONS HANDLERDS END ------

  // action buttons stuff for disabling
  const isProposalSubmitted = selectedUserProposalId >= 0
  const isProposalPeriod = governancePhase === 'PROPOSAL'

  const proposalHasChange = useMemo(
    () =>
      isProposalSubmitted && isProposalPeriod && !currentProposal.locked
        ? isProposalHasChange({
            clientProposal: proposalState[selectedUserProposalId],
            remoteProposal: mappedProposals[selectedUserProposalId],
          })
        : false,
    [
      selectedUserProposalId,
      currentProposal.locked,
      isProposalPeriod,
      isProposalSubmitted,
      mappedProposals,
      proposalState,
    ],
  )

  // Validate bytes
  const isBytesValid = useMemo(
    () =>
      checkStage2Validation({
        proposalValidation: currentProposalValidation,
        currentProposal,
        remoteProposal: mappedProposals[currentProposal.id],
      }),
    [currentProposal, currentProposalValidation, mappedProposals],
  )

  // Validate payments
  const isPaymentsValid = useMemo(
    () =>
      checkStage3Validation({
        proposalValidation: currentProposalValidation,
        currentProposal,
        remoteProposal: mappedProposals[currentProposal.id],
      }),
    [currentProposal, currentProposalValidation, mappedProposals],
  )

  // Validate stage 1, if porposal is submitted we can't change anything here
  const isStageOneDataValid = isProposalSubmitted
    ? checkStage1Validation({ proposalValidation: currentProposalValidation })
    : true

  const isSubmitDisabled =
    !isProposalPeriod ||
    !isNewlyRegisteredSatellite ||
    !isStageOneDataValid ||
    !isBytesValid ||
    currentProposal.proposalData.filter(({ title, encoded_code }) => title || encoded_code).length > 0

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

            {isNewlyRegisteredSatellite && <Info text={UNREGISTERED_SATELLITE_BANNER_TEXT} type={INFO_DEFAULT} />}

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
                disabled={!isProposalSubmitted || !isProposalPeriod || isNewlyRegisteredSatellite}
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
                  !mappedProposals[selectedUserProposalId]?.proposalData.length ||
                  isNewlyRegisteredSatellite
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
                  disabled={
                    !proposalHasChange ||
                    currentProposal.locked ||
                    !isBytesValid ||
                    !isPaymentsValid ||
                    isNewlyRegisteredSatellite
                  }
                  onClick={() => handleUpdateData(selectedUserProposalId)}
                >
                  <Icon id="bytes" /> Save Changes
                </Button>
              ) : (
                <Button
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  disabled={isSubmitDisabled}
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
