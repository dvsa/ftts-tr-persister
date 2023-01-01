import { ServiceBusClient, ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import Semaphore from 'semaphore-async-await';
import { mock } from 'jest-mock-extended';
import { BusinessTelemetryEvent, logger } from '../../../src/utils/logger';
import { QueueClient } from '../../../src/resultsPersister/queueClient';
import { mockedLogger } from '../../mocks/logger.mock';
import { executionTimeoutNearlyReached } from '../../../src/utils/time';
import config from '../../../src/config';

jest.mock('@azure/service-bus');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/utils/time');

describe('QueueClient', () => {
  const receiver = mock<ServiceBusReceiver>();
  const semaphoreMock = mock<Semaphore>();
  const data: ServiceBusReceivedMessage[] = [
    {
      state: 'active',
      body: {},
    } as ServiceBusReceivedMessage,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const mockedConstructor = jest.mocked(ServiceBusClient);
    const serviceBusClientMock = mock<ServiceBusClient>();
    mockedConstructor.mockReturnValue(serviceBusClientMock);
    serviceBusClientMock.createReceiver.mockReturnValue(receiver);

    mockedLogger.getOperationId.mockImplementation(() => 'testOpId');
  });

  afterAll(() => {
    config.serviceBus.queueArrivalRetrieveCountMax = 150;
  });

  describe('retrieveMessages', () => {
    test('can receive messages', async () => {
      receiver.receiveMessages.mockResolvedValue(data);

      const queueClient = new QueueClient(
        receiver,
        semaphoreMock,
      );
      const messages = await queueClient.retrieveMessages();
      expect(messages).toStrictEqual(data);
      expect(receiver.receiveMessages).toHaveBeenCalledWith(1, { maxWaitTimeInMs: 150 });
      expect(semaphoreMock.acquire).toHaveBeenCalled();
      expect(semaphoreMock.release).toHaveBeenCalled();
      expect(logger.dependency).toHaveBeenCalledWith(
        'QueueClient::retrieveMessages',
        'Retrieved 1 messages from queue',
        expect.objectContaining({ success: true }),
      );
    });

    test('when receiveMessages fails, then log failed dependency and throw error', async () => {
      const error = new Error('err');
      receiver.receiveMessages.mockRejectedValue(error);

      const queueClient = new QueueClient(
        receiver,
        semaphoreMock,
      );

      await expect(() => queueClient.retrieveMessages()).rejects.toThrow();

      expect(receiver.receiveMessages).toHaveBeenCalledWith(1, { maxWaitTimeInMs: 150 });
      expect(logger.dependency).toHaveBeenCalledWith(
        'QueueClient::retrieveMessages',
        'Retrieve messages from queue',
        expect.objectContaining({ success: false }),
      );
    });
  });

  describe('completeMessage', () => {
    test('can complete a message', async () => {
      const queueClient = new QueueClient(
        receiver,
        semaphoreMock,
      );

      await queueClient.completeMessage(data[0]);

      expect(receiver.completeMessage).toHaveBeenCalledWith(
        data[0],
      );
      expect(logger.dependency).toHaveBeenCalledWith(
        'QueueClient::completeMessage',
        'Complete message in queue',
        expect.objectContaining({ success: true, ...data[0] }),
      );
    });

    test('when completing result records fails, log a failed dependency and throw the error', async () => {
      const error = new Error('err');
      receiver.completeMessage.mockRejectedValue(error);

      const queueClient = new QueueClient(
        receiver,
        semaphoreMock,
      );

      await expect(() => queueClient.completeMessage(data[0]))
        .rejects
        .toThrow();

      expect(receiver.completeMessage).toHaveBeenCalledWith(data[0]);
      expect(logger.dependency).toHaveBeenCalledWith(
        'QueueClient::completeMessage',
        'Complete message in queue',
        expect.objectContaining({ success: false, ...data[0] }),
      );
    });
  });

  describe('canRetrieveMoreMessages', () => {
    const mockExecutionTimeoutNearlyReached = jest.mocked(executionTimeoutNearlyReached, true);
    const queueClient = new QueueClient(
      receiver,
      semaphoreMock,
    );

    beforeEach(() => {
      mockExecutionTimeoutNearlyReached.mockReturnValue(false);
      config.serviceBus.queueArrivalRetrieveCountMax = 150;
    });

    test('when executionTimeoutNearlyReached is true, returns false', () => {
      mockExecutionTimeoutNearlyReached.mockReturnValue(true);

      expect(
        queueClient.canRetrieveMoreMessages(),
      ).toBeFalsy();
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvent.TR_PERSISTER_TIMEOUT_REACHED,
        'QueueClient::canRetrieveMoreMessages: execution timeout nearly reached',
        expect.objectContaining({ functionTimeoutBuffer: 30 }),
      );
    });

    test('when executionTimeoutNearlyReached is false, returns true', () => {
      expect(
        queueClient.canRetrieveMoreMessages(),
      ).toBeTruthy();
    });

    test('when numberOfMessagesRetrieved less than queueArrivalRetrieveCountMax, returns true', () => {
      expect(
        queueClient.canRetrieveMoreMessages(),
      ).toBeTruthy();
    });

    test('when numberOfMessagesRetrieved equal to queueArrivalRetrieveCountMax, returns false', () => {
      config.serviceBus.queueArrivalRetrieveCountMax = 0;
      expect(
        queueClient.canRetrieveMoreMessages(),
      ).toBeFalsy();
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvent.TR_MAX_MESSAGES_PROCESSED,
        'QueueClient::canRetrieveMoreMessages: maximum number of messages retrieved',
        { numberOfMessagesRetrieved: 0, queueArrivalRetrieveCountMax: 0 },
      );
    });
  });
});
