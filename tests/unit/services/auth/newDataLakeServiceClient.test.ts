import { ManagedIdentityCredential } from '@dvsa/ftts-auth-client';
import { mock } from 'jest-mock-extended';
import { DataLakeServiceClient } from '@azure/storage-file-datalake';
import { newDataLakeServiceClient } from '../../../../src/services/auth/newDataLakeServiceClient';
import config from '../../../../src/config';

jest.mock('@dvsa/ftts-auth-client');
const mockedManagedIdentityCredential = jest.mocked(ManagedIdentityCredential);
const mockedManagedIdentityCredentialInstance = mock<ManagedIdentityCredential>();

jest.mock('@azure/storage-file-datalake');
const mockedDataLakeServiceClient = jest.mocked(DataLakeServiceClient);
const mockedDataLakeServiceClientInstance = jest.mock<DataLakeServiceClient>();

jest.mock('../../../../src/config');
const mockConfig = jest.mocked(config, true);
config.dataLake.dataLakeStoreBaseUrl = 'dataLakeStoreBaseUrl';

describe('newDataLakeServiceClient', () => {
  beforeEach(() => {
    mockedManagedIdentityCredential.mockReturnValue(mockedManagedIdentityCredentialInstance);
    mockedDataLakeServiceClient.mockReturnValue(mockedDataLakeServiceClientInstance);
    mockedDataLakeServiceClient.fromConnectionString.mockReturnValue(mockedDataLakeServiceClientInstance);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return DataLake Client instance with ManagedIdentityCredential', () => {
    mockConfig.dataLake.dataLakeConnectionString = null;

    expect(newDataLakeServiceClient()).toBe(mockedDataLakeServiceClientInstance);
    expect(mockedDataLakeServiceClient).toHaveBeenCalledWith(mockConfig.dataLake.dataLakeStoreBaseUrl, mockedManagedIdentityCredentialInstance);
    expect(mockedDataLakeServiceClient.fromConnectionString).toHaveBeenCalledTimes(0);
  });

  test('should return DataLake Client instance with connection string', () => {
    mockConfig.dataLake.dataLakeConnectionString = 'DefaultEndpointsProtocol=https;AccountName=cloud;AccountKey=x+y==';

    expect(newDataLakeServiceClient()).toBe(mockedDataLakeServiceClientInstance);
    expect(mockedDataLakeServiceClient.fromConnectionString).toHaveBeenCalledWith(mockConfig.dataLake.dataLakeConnectionString);
    expect(mockedDataLakeServiceClient).toHaveBeenCalledTimes(0);
  });

  test('invalid connectionString throws an error', () => {
    const errorMessage = 'Invalid EndpointSuffix in the provided Connection String';
    mockConfig.dataLake.dataLakeConnectionString = 'DefaultEndpointsProtocol=https;AccountName=cloud;AccountKey=x+y==';
    mockedDataLakeServiceClient.fromConnectionString = () => { throw new Error(errorMessage); };
    const expectedError = new Error(errorMessage);

    expect(() => newDataLakeServiceClient()).toThrow(expectedError);
  });
});
