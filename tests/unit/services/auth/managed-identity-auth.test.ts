import { ChainedTokenCredential, ManagedIdentityCredential, ClientSecretCredential } from '@dvsa/ftts-auth-client';
import { mock } from 'jest-mock-extended';
import { ManagedIdentityAuth, ManagedIdentityAuthConfig } from '../../../../src/services/auth/managed-identity-auth';

jest.mock('@dvsa/ftts-auth-client');
const mockedChainedTokenCredential = jest.mocked(ChainedTokenCredential);
const mockedChainedTokenCredentialInstance = mock<ChainedTokenCredential>();
const mockedManagedIdentityCredential = jest.mocked(ManagedIdentityCredential);
const mockedManagedIdentityCredentialInstance = mock<ManagedIdentityCredential>();
const mockedClientSecretCredential = jest.mocked(ClientSecretCredential);
const mockedClientSecretCredentialInstance = mock<ClientSecretCredential>();

describe('ManagedIdentityAuth', () => {
  let managedIdentityAuth: ManagedIdentityAuth;

  beforeEach(() => {
    mockedChainedTokenCredential.mockReturnValue(mockedChainedTokenCredentialInstance);
    mockedManagedIdentityCredential.mockReturnValue(mockedManagedIdentityCredentialInstance);
    mockedClientSecretCredential.mockReturnValue(mockedClientSecretCredentialInstance);
    managedIdentityAuth = new ManagedIdentityAuth({} as ManagedIdentityAuthConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('when configured with client id and secret should use ChainedTokenCredential with two items array', () => {
    const config: ManagedIdentityAuthConfig = {
      userAssignedEntityClientId: 'uaid',
      scope: 'ntf',
      azureClientId: 'client-id',
      azureClientSecret: 'secret-1',
      azureTenantId: 'tenant-id',
    };

    const authService = new ManagedIdentityAuth(config);

    expect(mockedManagedIdentityCredential).toHaveBeenCalledWith(config.userAssignedEntityClientId);
    expect(mockedClientSecretCredential).toHaveBeenCalledWith(config.azureTenantId, config.azureClientId, config.azureClientSecret);
    expect(mockedChainedTokenCredential).toHaveBeenCalledWith(mockedManagedIdentityCredentialInstance, mockedClientSecretCredentialInstance);
    expect(authService).toBeInstanceOf(ManagedIdentityAuth);
  });

  test('when configured without client id and secret should use ChainedTokenCredential with ManagedIdentityCredential only', () => {
    const config: ManagedIdentityAuthConfig = {
      userAssignedEntityClientId: 'uaid',
      scope: 'ntf',
      azureClientId: '',
      azureClientSecret: '',
      azureTenantId: '',
    };

    const authService = new ManagedIdentityAuth(config);

    expect(mockedManagedIdentityCredential).toHaveBeenCalledWith(config.userAssignedEntityClientId);
    expect(mockedClientSecretCredential).not.toHaveBeenCalled();
    expect(mockedChainedTokenCredential).toHaveBeenCalledWith(mockedManagedIdentityCredentialInstance);
    expect(authService).toBeInstanceOf(ManagedIdentityAuth);
  });

  test('gets the auth header', async () => {
    mockedChainedTokenCredentialInstance.getToken.mockImplementationOnce(() => Promise.resolve({ token: 'mockTestToken', expiresOnTimestamp: 1 }));

    const authHeader = await managedIdentityAuth.getAuthHeader();

    expect(authHeader).toStrictEqual({
      headers: {
        Authorization: 'Bearer mockTestToken',
      },
    });
    expect(mockedChainedTokenCredentialInstance.getToken).toHaveBeenCalled();
  });

  test('throws an error if unable to get token', async () => {
    mockedChainedTokenCredentialInstance.getToken.mockRejectedValue('Unknown error');

    await expect(managedIdentityAuth.getAuthHeader()).rejects.toBe('Unknown error');
    expect(mockedChainedTokenCredentialInstance.getToken).toHaveBeenCalled();
  });

  test('throws an error if response object does not have token assigned', async () => {
    mockedChainedTokenCredentialInstance.getToken.mockResolvedValueOnce({ token: '', expiresOnTimestamp: 1 });

    await expect(managedIdentityAuth.getAuthHeader()).rejects.toThrow(new Error('ManagedIdentityAuth::getToken: empty token'));
    expect(mockedChainedTokenCredentialInstance.getToken).toHaveBeenCalled();
  });
});
