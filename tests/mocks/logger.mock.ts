import { logger } from '../../src/utils/logger';

export const mockedLogger = jest.mocked(logger, true);
