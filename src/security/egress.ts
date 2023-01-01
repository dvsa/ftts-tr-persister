import { Address, InternalAccessDeniedError, addressParser } from '@dvsa/egress-filtering';
import config from '../config';
import { BusinessTelemetryEvent, logger } from '../utils/logger';

export const ALLOWED_ADDRESSES = (): Array<Address> => [
  addressParser.parseUri(config.serviceBus.baseUrl),
  addressParser.parseUri(config.dataLake.dataLakeStoreBaseUrl),
  addressParser.parseSbConnectionString(config.serviceBus.connectionString),
  addressParser.parseUri(`https://${config.dataLake.dataLakeAccountName}.dfs.core.windows.net`),
];

export const ON_INTERNAL_ACCESS_DENIED_ERROR = (error: InternalAccessDeniedError): void => {
  logger.event(
    BusinessTelemetryEvent.NOT_WHITELISTED_URL_CALL,
    error.message,
    {
      host: error.host,
      port: error.port,
      allowed: ALLOWED_ADDRESSES(),
    },
  );
};
