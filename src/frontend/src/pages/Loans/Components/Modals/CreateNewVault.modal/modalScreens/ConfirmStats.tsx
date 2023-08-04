import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import React, { useCallback, useMemo } from 'react'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { GET_NEW_VAULT } from 'providers/VaultsProvider/queries/newVault.query'
import { sleep } from 'utils/api/sleep'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { createVault } from 'providers/VaultsProvider/actions/vaults.actions'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { CREATE_VAULT_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { ADD_COLLATERAL_SCREEN_ID } from '../helpers/createNewVault.consts'

export const ConfirmStats = () => {
  const { apolloClient } = useApolloContext()
  const { tokensMetadata, tokensPrices, collateralTokens } = useTokensContext()

  console.log({ tokensMetadata, tokensPrices, collateralTokens })
  const { bug, info } = useToasterContext()
  const { userAddress, userTokensBalances } = useUserContext()
  const {
    preferences: { themeSelected },
    contractAddresses: { vaultFactoryAddress },
  } = useDappConfigContext()
  const { bakers, choosenBaker, setChoosenBaker } = useXtzBakersForDD()
  const {
    selectedCollateralsAddresses,
    selectedCollaterals,
    updateSelectedCollaterals,
    updateScreenToShow,
    isVaultCreating,
    hasXTZTokenSelected,
    borrowCapacity,
    newVault,
    updateVaultCreating,
    vaultInputState,
    updateNewVault,
    data,
  } = useCreateVaultContext()

  const { marketTokenAddress, setCreatedVaultAddress } = data ?? {}

  // Actions --------------------------------------------------------------------
  const getNewVaultData = useCallback(
    async (retries = 1) => {
      try {
        const newVaultData = await apolloClient.query({
          query: GET_NEW_VAULT,
          fetchPolicy: 'no-cache',
          variables: {
            userAddress: userAddress,
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
          // updateScreenToShow(ADD_COLLATERAL_SCREEN_ID)
          // TODO remove retry after indexer update
        } else if (retries !== 0) {
          info('Refetching new vault', 'Trying to refetch the new vault data. Plases wait 7 seconds...')
          await sleep(7000)
          await getNewVaultData(retries - 1)
        } else {
          bug(
            "Can't fetch new vault data, try reload the page and find your newly created vault in the the list of vaults",
            'Update Vault Error',
          )
        }
      } catch (e) {
        bug('Fetch Error', 'Error occured while loading latest created vault, please reload the page')
      }
    },
    [apolloClient, bug, info, setCreatedVaultAddress, userAddress, vaultInputState.name],
  )

  //   create vault action -----------------------------------------------------------------------
  const createVaultAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    console.log(selectedCollaterals, 'selectedCollaterals')

    const loanToken = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata })

    if (loanToken && checkWhetherTokenIsLoanToken(loanToken) && vaultFactoryAddress) {
      updateVaultCreating(true)

      const tokensArr = selectedCollateralsAddresses.reduce<
        Array<
          LoansCollateralTokenMetadataType & {
            amount: number
          }
        >
      >((acc, address) => {
        const { amount } = selectedCollaterals[address]
        const collateralToken = getTokenDataByAddress({
          tokenAddress: address,
          tokensMetadata,
          tokensPrices,
        })

        if (!collateralToken) return acc

        // TODO fix type

        acc.push({
          ...collateralToken,
          amount: convertNumberForContractCall({
            number: Number(amount),
            grade: collateralToken?.decimals,
          }),
        } as LoansCollateralTokenMetadataType & {
          amount: number
        })
        return acc
      }, [])

      return await createVault(
        userAddress,
        loanToken.loanData.indexerName,
        vaultInputState.name,
        vaultFactoryAddress,
        tokensArr,
        choosenBaker?.bakerAddress ?? null,
      )
    }

    return null
  }, [
    bug,
    choosenBaker?.bakerAddress,
    marketTokenAddress,
    selectedCollaterals,
    selectedCollateralsAddresses,
    tokensMetadata,
    tokensPrices,
    userAddress,
    vaultFactoryAddress,
    vaultInputState.name,
  ])

  const createVaultActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CREATE_VAULT_ACTION,
      actionFn: createVaultAction,
      dappActionCallback: async () => {
        await getNewVaultData()
      },
      isSilentAction: true,
    }),
    [createVaultAction, getNewVaultData],
  )

  const { action: createVaultHandler } = useContractAction(createVaultActionProps)

  return (
    <div>
      <div className="buttons-wrapper" style={{ marginTop: '30px' }}>
        <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={() => updateScreenToShow(ADD_COLLATERAL_SCREEN_ID)}>
          <Icon id="arrowLeft" />
          Back
        </Button>
        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={isVaultCreating} onClick={createVaultHandler}>
          <Icon id="sign" />
          Create Vault
        </Button>
      </div>
      {isVaultCreating ? (
        <div className="creating-vault-loader-wrapper">
          Creating Vault
          <SpinnerCircleLoaderStyled />
        </div>
      ) : null}
    </div>
  )
}
