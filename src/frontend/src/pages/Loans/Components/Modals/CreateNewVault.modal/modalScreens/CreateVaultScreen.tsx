import React, { useCallback, useMemo } from 'react'

// components
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'

// consts
import { INPUT_LARGE, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { ADD_COLLATERAL_SCREEN_ID } from '../helpers/createNewVault.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { CREATE_VAULT_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

// providers
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

// utils
import { sleep } from 'utils/api/sleep'
import { validateVaultLength } from '../helpers/createNewVault.helpers'
import { containSpaces } from 'app/App.utils/input'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// hooks
import { useUserVaultsNames } from 'providers/VaultsProvider/hooks/useVaultsNames'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// actions
import { createVault } from 'providers/VaultsProvider/actions/vaults.actions'

// queries
import { GET_NEW_VAULT } from 'providers/VaultsProvider/queries/newVault.query'

export const CreateVaultScreen = () => {
  const { vaultNames } = useUserVaultsNames()
  const { tokensMetadata } = useTokensContext()
  const { bug, info } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { vaultFactoryAddress },
  } = useDappConfigContext()
  const { apolloClient } = useApolloContext()

  const { vaultInputState, updateInputVaultState, updateScreenToShow, updateVaultCreating, updateNewVault, data } =
    useCreateVaultContext()

  const { marketTokenAddress, setCreatedVaultAddress } = data ?? {}

  // Actions --------------------------------------------------------------------
  const getNewVaultData = useCallback(
    async (retries = 1) => {
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
          updateVaultCreating(false)
          updateScreenToShow(ADD_COLLATERAL_SCREEN_ID)
          // TODO remove retry after indexer update
        } else if (retries !== 0) {
          info('Refetching new vault', 'Trying to refetch the new vault data. Plases wait 7 seconds...')
          await sleep(7000)
          await getNewVaultData(retries - 1)
        } else {
          bug(
            'Update Vault Error',
            "Can't fetch new vault data, try reload the page and find your newly created vault in the the list of vaults",
          )
        }
      } catch (e) {
        bug('Fetch Error', 'Error occured while loading latest created vault, please reload the page')
      }
    },
    [
      apolloClient,
      bug,
      info,
      setCreatedVaultAddress,
      updateNewVault,
      updateScreenToShow,
      updateVaultCreating,
      userAddress,
      vaultInputState.name,
    ],
  )

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
      dappActionCallback: async () => {
        await getNewVaultData()
      },
      isSilentAction: true,
    }),
    [createVaultAction, getNewVaultData, updateVaultCreating],
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

  const handleButtonClick = async () => {
    await createVaultHandler()
    // updateScreenToShow(ADD_COLLATERAL_SCREEN_ID)
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
