import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import React, { useCallback, useEffect, useMemo } from 'react'
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
import { ADD_COLLATERAL_SCREEN_ID, BORROW_SCREEN_ID } from '../helpers/createNewVault.consts'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ConfirmStatsVaultOverview } from '../createNewVault.style'

export const ConfirmStats = () => {
  const { apolloClient } = useApolloContext()
  const { tokensMetadata, tokensPrices, collateralTokens } = useTokensContext()

  const { bug, info } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { vaultFactoryAddress },
  } = useDappConfigContext()
  const { choosenBaker } = useXtzBakersForDD()
  const {
    selectedCollateralsAddresses,
    selectedCollaterals,
    updateScreenToShow,
    isVaultCreating,
    updateVaultCreating,
    vaultInputState,
    updateNewVault,
    newVault,
    data,
  } = useCreateVaultContext()

  const { marketTokenAddress, setCreatedVaultAddress } = data ?? {}

  useEffect(() => {
    async function ex() {
      // TODO at rhis time vaults provider don't have new vault data - so it will lead to 404 page
      // fix this issue
      updateScreenToShow(BORROW_SCREEN_ID)
    }
    if (newVault) {
      ex()
    }
  }, [newVault])

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

  const totalCollateralDepositedValue = useMemo(
    () =>
      selectedCollateralsAddresses.reduce<number>((acc, address) => {
        const { tokenAddress, amount } = selectedCollaterals[address]
        const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
        if (!token || !token.rate) return acc

        const { rate } = token

        const convertedBalance = Number(amount) * rate

        return acc + convertedBalance
      }, 0),
    [selectedCollaterals, selectedCollateralsAddresses, tokensMetadata, tokensPrices],
  )

  return (
    <div>
      <div>
        <ConfirmStatsVaultOverview>
          <div className="">
            <ThreeLevelListItem>
              <div className="name">Vault name</div>
              <div className="value">{vaultInputState.name}</div>
            </ThreeLevelListItem>
          </div>
          <Table>
            <TableHeader className="treasury">
              <TableRow>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody className="treasury">
              {selectedCollateralsAddresses.map((address) => {
                const { tokenAddress, amount } = selectedCollaterals[address]
                const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                if (!token || !token.rate) return null

                const { symbol, rate, decimals } = token

                const balance = Number(amount)

                return (
                  <TableRow key={symbol} rowHeight={25} borderColor="dataColor" className="add-hover">
                    <TableCell width="33%">{symbol}</TableCell>
                    <TableCell width="33%">
                      <CommaNumber value={balance} decimalsToShow={Number(decimals)} useAccurateParsing={balance < 1} />
                    </TableCell>
                    <TableCell width="33%" contentPosition="right">
                      <CommaNumber
                        value={balance * rate}
                        beginningText={rate ? '$' : symbol}
                        useAccurateParsing={balance < 1}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ConfirmStatsVaultOverview>

        <div className="confirmation-stats">
          <ThreeLevelListItem>
            <div className="name">Selected Baker</div>
            <div className="value">{choosenBaker?.bakerName ?? 'Not relevant'}</div>
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Total Collateral Deposited</div>
            <CommaNumber value={totalCollateralDepositedValue} decimalsToShow={2} className="value" beginningText="$" />
          </ThreeLevelListItem>
          {/* <ThreeLevelListItem className="right">
            <div className="name">
              Available To Borrow
              <CustomTooltip
                iconId="info"
                defaultStrokeColor={silverColor}
                text={AVALIABLE_TO_BORROW}
                className="tooltip"
              />
            </div>
            <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
          </ThreeLevelListItem> */}
        </div>
      </div>
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
