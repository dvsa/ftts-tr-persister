/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzureFunction, Context } from '@azure/functions';
import { nonHttpTriggerContextWrapper } from '@dvsa/azure-logger';
import { withEgressFiltering } from '@dvsa/egress-filtering';
import { ALLOWED_ADDRESSES, ON_INTERNAL_ACCESS_DENIED_ERROR } from '../security/egress';
import { logger } from '../utils/logger';
import '../dayjs-config';
import { resultsPersister } from './resultsPersister';

export const resultPersisterTimerTrigger: AzureFunction = async (): Promise<void> => {
  await resultsPersister.processMessages();
};

export const index = (context: Context): Promise<void> => nonHttpTriggerContextWrapper(
  withEgressFiltering(
    resultPersisterTimerTrigger,
    ALLOWED_ADDRESSES(),
    ON_INTERNAL_ACCESS_DENIED_ERROR,
    logger,
  ),
  context,
);
