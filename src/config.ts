export interface RetryPolicy {
  defaultRetryDelay: number;
  exponentialBackoff: boolean;
  maxRetries: number;
  maxRetryAfter: number;
}

export interface Config {
  websiteSiteName: string;
  defaultTimeZone: string;
  local: {
    azureTenantId: string;
    dataLakeClientId: string;
    dataLakeClientSecret: string;
  },
  concurrency: {
    parallelProcessCount: number;
    processInterval: number;
  },
  dataLake: {
    dataLakeStoreBaseUrl: string;
    dataLakeUserAssignedEntityClientId: string;
    dataLakeStoreScope: string;
    dataLakeContainerName: string;
    dataLakeTestSectionsFolder: string;
    dataLakeTestItemsFolder: string;
    dataLakeConnectionString: string;
    dataLakeAccountName: string;
    dataLakeTimeBetweenShapshotsInHours: number;
    dataLakeSnapshotFolder: string;
  },
  identity: {
    azureTenantId: string;
    azureClientId: string;
    azureClientSecret: string;
    scope: string;
    identityUserAssignedEntityClientId: string;
  },
  serviceBus: {
    baseUrl: string;
    connectionString: string;
    functionTimeoutBuffer: number;
    queueArrivalName: string;
    queueArrivalRetrieveCount: number;
    queueArrivalRetrieveCountAdditional: number;
    queueArrivalRetrieveCountMax: number;
  },
}

const config: Config = {
  websiteSiteName: process.env.WEBSITE_SITE_NAME || 'ftts-tr-persister',
  defaultTimeZone: process.env.TZ || 'Europe/London',
  local: {
    azureTenantId: process.env.AZURE_TENANT_ID || '',
    dataLakeClientId: process.env.DATA_LAKE_CLIENTID || '',
    dataLakeClientSecret: process.env.DATA_LAKE_CLIENT_SECRET || '',
  },
  concurrency: {
    parallelProcessCount: Number(process.env.TP_PARALLEL_PROCESS_COUNT) || 5,
    processInterval: Number(process.env.TP_PARALLEL_PROCESS_INTERVAL) || 50, // time in ms between a notification is processed in a single thread
  },
  dataLake: {
    dataLakeStoreBaseUrl: process.env.DATA_LAKE_STORE_BASE_URL || '',
    dataLakeUserAssignedEntityClientId: process.env.DATA_LAKE_USER_ASSIGNED_ENTITY_CLIENT_ID || '',
    dataLakeStoreScope: process.env.DATA_LAKE_STORE_SCOPE || '',
    dataLakeContainerName: process.env.DATA_LAKE_CONTAINER_NAME || '',
    dataLakeTestSectionsFolder: process.env.DATA_LAKE_TEST_SECTIONS_FOLDER || '',
    dataLakeTestItemsFolder: process.env.DATA_LAKE_TEST_ITEMS_FOLDER || '',
    dataLakeConnectionString: process.env.DATA_LAKE_CONNECTION_STRING || '',
    dataLakeAccountName: process.env.DATA_LAKE_ACCOUNT_NAME || '',
    dataLakeTimeBetweenShapshotsInHours: (Number(process.env.DATA_LAKE_TIME_BETWEEN_SNAPSHOTS_IN_HOURS) || 1) * 60 * 60 * 1000, // 1 hour
    dataLakeSnapshotFolder: process.env.DATA_LAKE_SNAPSHOT_FOLDER || '',
  },
  identity: {
    azureTenantId: process.env.TP_STORAGE_TENANT_ID || '',
    azureClientId: process.env.TP_STORAGE_CLIENT_ID || '',
    azureClientSecret: process.env.TP_STORAGE_CLIENT_SECRET || '',
    scope: process.env.TP_STORAGE_API_SCOPE || '',
    identityUserAssignedEntityClientId: process.env.IDENTITY_USER_ASSIGNED_ENTITY_CLIENT_ID || '',
  },
  serviceBus: {
    baseUrl: process.env.SERVICE_BUS_BASE_URL || '',
    connectionString: process.env.SERVICE_BUS_CONNECTION_STRING || '',
    functionTimeoutBuffer: parseInt(process.env.TP_FUNCTION_TIMEOUT_BUFFER || '30', 10),
    queueArrivalName: process.env.QUEUE_ARRIVAL_NAME || '',
    queueArrivalRetrieveCount: Number(process.env.QUEUE_ARRIVAL_RETRIEVE_COUNT) || 1,
    queueArrivalRetrieveCountAdditional: Number(process.env.QUEUE_ARRIVAL_RETRIEVE_COUNT_ADDITIONAL) || 5,
    queueArrivalRetrieveCountMax: Number(process.env.QUEUE_ARRIVAL_RETRIEVE_COUNT_MAX) || 150,
  },
};

export default config;
