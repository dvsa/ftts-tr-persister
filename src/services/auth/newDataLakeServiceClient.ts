import { DataLakeServiceClient } from '@azure/storage-file-datalake';
import { ManagedIdentityCredential } from '@dvsa/ftts-auth-client';
import config from '../../config';
import { logger } from '../../utils/logger';

export function newDataLakeServiceClient(): DataLakeServiceClient {
  try {
    if (config.dataLake.dataLakeConnectionString) {
      return DataLakeServiceClient.fromConnectionString(config.dataLake.dataLakeConnectionString);
    }
    return new DataLakeServiceClient(
      config.dataLake.dataLakeStoreBaseUrl,
      new ManagedIdentityCredential(config.identity.identityUserAssignedEntityClientId),
    );
  } catch (error) {
    logger.error(error as Error, 'newDataLakeServiceClient:: Failed to get DataLake Client');
    throw error;
  }
}
