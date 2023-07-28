import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { INPUT_LARGE, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { Input } from 'app/App.components/Input/NewInput'
import React, { useCallback, useMemo } from 'react'
import { ADD_COLLATERAL_SCREEN_ID } from '../helpers/createNewVault.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { validateVaultLength } from '../helpers/createNewVault.helpers'
import { useUserVaultsNames } from 'providers/VaultsProvider/hooks/useVaultsNames'
import { containSpaces } from 'app/App.utils/input'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { createVault } from 'providers/VaultsProvider/actions/vaults.actions'
import { GET_NEW_VAULT } from 'providers/VaultsProvider/queries/newVault.query'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { CREATE_VAULT_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

type CreateVaultScreenProps = {
  marketTokenAddress: string | undefined
  setCreatedVaultAddress?: (address: string) => void
}

export const CreateVaultScreen = ({ marketTokenAddress, setCreatedVaultAddress }: CreateVaultScreenProps) => {
  const { vaultNames } = useUserVaultsNames()
  const { tokensMetadata } = useTokensContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { vaultFactoryAddress },
  } = useDappConfigContext()
  const { apolloClient } = useApolloContext()

  const { vaultInputState, updateInputVaultState, updateScreenToShow, updateVaultCreating, updateNewVault } =
    useCreateVaultContext()

  // Actions --------------------------------------------------------------------
  const getNewVaultData = useCallback(async () => {
    try {
      const newVaultData = await apolloClient.query({
        query: GET_NEW_VAULT,
        variables: {
          userAddress,
          vaultName: vaultInputState.name,
        },
      })

      if (newVaultData.error) {
        console.error('loading new vault error', newVaultData.error)
        throw new Error(newVaultData.error.message)
      }

      if (newVaultData.data.vault.length) {
        const { address, id } = newVaultData.data.vault[0]
        setCreatedVaultAddress?.(address)
        updateNewVault({
          address,
          id,
        })
      }
    } catch (e) {
      bug('Fetch Error', 'Error occured while loading latest created vault, please reload the page')
    }
  }, [bug, setCreatedVaultAddress, userAddress, vaultInputState.name])

  //   create vault action
  const createVaultAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    const loanToken = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata })

    if (loanToken && checkWhetherTokenIsLoanToken(loanToken) && vaultFactoryAddress) {
      updateVaultCreating(true)
      return await createVault(loanToken.loanData.indexerName, vaultInputState.name, vaultFactoryAddress)
    }

    return null
  }, [bug, marketTokenAddress, tokensMetadata, userAddress, vaultFactoryAddress, vaultInputState.name])

  const createVaultActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CREATE_VAULT_ACTION,
      actionFn: createVaultAction,
      dappActionCallback: () => {
        getNewVaultData()
        updateVaultCreating(false)
      },
      isSilentAction: true,
    }),
    [createVaultAction, getNewVaultData],
  )

  const { action: createVaultHandler } = useContractAction(createVaultActionProps)

  // handlers
  const handleVaultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const validationStatus = validateVaultLength(value, vaultNames)

    updateInputVaultState({ name: value, validationStatus })
  }

  const handleVaultNameOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (containSpaces(e.target.value)) {
      const trimmedValue = e.target.value.trim()
      const validationStatus = validateVaultLength(trimmedValue, vaultNames)
      updateInputVaultState({ validationStatus, name: trimmedValue })
    }
  }

  const handleButtonClick = () => {
    updateScreenToShow(ADD_COLLATERAL_SCREEN_ID)
    // createVaultHandler()
  }

  return (
    <>
      <Input
        inputProps={{
          value: vaultInputState.name,
          type: 'text',
          onChange: handleVaultNameChange,
          onBlur: handleVaultNameOnBlur,
          placeholder: 'e.g. Satoshi’s Personal Vault',
        }}
        settings={{
          inputStatus: vaultInputState.validationStatus,
          inputSize: INPUT_LARGE,
          errorMessage: vaultInputState.errorMessage,
        }}
      />
      <div className="manage-btn">
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={handleButtonClick}
          disabled={vaultInputState.validationStatus !== INPUT_STATUS_SUCCESS}
        >
          Continue
          <Icon id="arrowRight" />
        </NewButton>
      </div>
    </>
  )
}
