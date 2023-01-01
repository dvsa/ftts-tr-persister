import { Context } from '@azure/functions';
import { getOperationId, Logger as AzureLogger } from '@dvsa/azure-logger';
import config from '../config';

export class Logger extends AzureLogger {
  constructor() {
    super('FTTS', config.websiteSiteName);
  }

  getOperationId(context: Context): string {
    return getOperationId(context);
  }
}

export enum BusinessTelemetryEvent {
  NOT_WHITELISTED_URL_CALL = 'NOT_WHITELISTED_URL_CALL',

  // The following are only used in TelemetryEvents to capture various stages/status of Test Result Persister Messages
  TR_MESSAGE_PROCESSING_FAILED = 'TR_MESSAGE_PROCESSING_FAILED',
  TR_NO_MESSAGES = 'TR_NO_MESSAGES',
  TR_PERSISTER_TIMEOUT_REACHED = 'TR_PERSISTER_TIMEOUT_REACHED',
  TR_MAX_MESSAGES_PROCESSED = 'TR_MAX_MESSAGES_PROCESSED',
  TR_SNAPSHOT_CREATED = 'TR_SNAPSHOT_CREATED',
}

export const logger = new Logger();
