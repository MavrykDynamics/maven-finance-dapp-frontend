import { dappClient } from './WalletCore'

const mockGetActiveAccount = jest.fn()
const mockRequestPermissions = jest.fn()
const mockClearActiveAccount = jest.fn()
const mockDisconnect = jest.fn()
const mockSetActiveAccount = jest.fn()

jest.mock('@mavrykdynamics/webmavryk-mavlet-wallet', () => ({
  MavletWallet: jest.fn().mockImplementation(() => ({
    client: {
      getActiveAccount: mockGetActiveAccount,
      requestPermissions: mockRequestPermissions,
      clearActiveAccount: mockClearActiveAccount,
      setActiveAccount: mockSetActiveAccount,
    },
    disconnect: mockDisconnect,
    clearActiveAccount: mockClearActiveAccount,
  })),
}))

jest.mock('utils/storage', () => ({
  getItemFromStorage: jest.fn(),
}))

const { getItemFromStorage } = require('utils/storage') as {
  getItemFromStorage: jest.Mock
}

describe('WalletCore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getItemFromStorage.mockReturnValue(null)
  })

  it('restores an active account without requesting permissions', async () => {
    mockGetActiveAccount.mockResolvedValue({ address: 'tz1-restored-user' })

    const userAddress = await dappClient().getActiveAccountAddress()

    expect(userAddress).toBe('tz1-restored-user')
    expect(mockRequestPermissions).not.toHaveBeenCalled()
  })

  it('requests permissions only during explicit connect when there is no active account', async () => {
    mockGetActiveAccount.mockResolvedValueOnce(null).mockResolvedValueOnce({ address: 'tz1-connected-user' })

    const userAddress = await dappClient().connectAccount()

    expect(userAddress).toBe('tz1-connected-user')
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1)
  })
})
