import { ServiceBusMessage, ServiceBusReceivedMessage } from '@azure/service-bus';
import { mock } from 'jest-mock-extended';
import { QueueClient } from '../../../src/resultsPersister/queueClient';
import { MessageTransformer } from '../../../src/transformer/messageTransformer';
import { DataLakeClient, TestType } from '../../../src/resultsPersister/dataLakeClient';
import { ResultsPersister } from '../../../src/resultsPersister/resultsPersister';

jest.mock('../../../src/transformer/messageTransformer');
jest.mock('../../../src/resultsPersister/dataLakeClient');
jest.mock('../../../src/resultsPersister/queueClient');
jest.mock('@azure/storage-file-datalake');
const mockedQueueClient = mock<QueueClient>();
const mockedMessageTransformer = mock<MessageTransformer>();
const mockedDataLakeClient = mock<DataLakeClient>();

describe('ResultsPersister', () => {
  const resultsPersister = new ResultsPersister(
    mockedQueueClient,
    mockedDataLakeClient,
    mockedMessageTransformer,
  );

  beforeEach(() => {
    mockedQueueClient.retrieveMessages.mockReturnValue(
      Promise.resolve([{ body: 'retrievedMessage1' }] as ServiceBusReceivedMessage[]),
    );
    mockedQueueClient.canRetrieveMoreMessages.mockReturnValueOnce(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processMessages', () => {
    test('retrieves, processes and stores the messages', async () => {
      mockedQueueClient.retrieveMessages.mockReturnValue(
        Promise.resolve([{ body: 'retrievedMessage1' }] as ServiceBusReceivedMessage[]),
      );

      await resultsPersister.processMessages();

      expect(mockedQueueClient.canRetrieveMoreMessages).toHaveBeenCalledTimes(2);
      expect(mockedQueueClient.retrieveMessages).toHaveBeenCalledTimes(1);
      expect(mockedMessageTransformer.transformMessage).toHaveBeenCalledTimes(1);
      expect(mockedDataLakeClient.saveFile).toHaveBeenCalledTimes(2);
      expect(mockedQueueClient.completeMessage).toHaveBeenCalledTimes(1);
    });

    test('when multiple messages are retrieved; processes and stores all the messages', async () => {
      mockedQueueClient.retrieveMessages.mockReturnValue(
        Promise.resolve([
          { body: 'retrievedMessage1' },
          { body: 'retrievedMessage2' },
        ] as ServiceBusReceivedMessage[]),
      );

      await resultsPersister.processMessages();

      expect(mockedQueueClient.canRetrieveMoreMessages).toHaveBeenCalledTimes(2);
      expect(mockedQueueClient.retrieveMessages).toHaveBeenCalledTimes(1);
      expect(mockedMessageTransformer.transformMessage).toHaveBeenCalledTimes(2);
      expect(mockedDataLakeClient.saveFile).toHaveBeenCalledTimes(2);
      expect(mockedQueueClient.completeMessage).toHaveBeenCalledTimes(2);
    });

    test('should clear maps after messages are complete', async () => {
      const body1 = { body: 'retrievedMessage1' };
      const body2 = { body: 'retrievedMessage2' };
      mockedQueueClient.retrieveMessages.mockReturnValue(
        Promise.resolve([
          body1,
          body2,
        ] as ServiceBusReceivedMessage[]),
      );

      mockedMessageTransformer.transformMessage = jest.fn((message: ServiceBusMessage, sectionsMap: Map<string, Array<string>>, itemsMap: Map<string, Array<string>>) => {
        sectionsMap.set('2022', ['sectionContent']);
        itemsMap.set('2022', ['itemContent']);
      });

      await resultsPersister.processMessages();
      const emptyMap = new Map();

      expect(mockedQueueClient.canRetrieveMoreMessages).toHaveBeenCalledTimes(2);
      expect(mockedQueueClient.retrieveMessages).toHaveBeenCalledTimes(1);
      expect(mockedMessageTransformer.transformMessage).toHaveBeenCalledTimes(2);
      expect(mockedMessageTransformer.transformMessage).toHaveBeenCalledWith(body1, emptyMap, emptyMap);
      expect(mockedMessageTransformer.transformMessage).toHaveBeenCalledWith(body2, emptyMap, emptyMap);
      expect(mockedDataLakeClient.saveFile).toHaveBeenCalledTimes(2);
      expect(mockedDataLakeClient.saveFile).toHaveBeenCalledWith(TestType.Sections, emptyMap);
      expect(mockedDataLakeClient.saveFile).toHaveBeenCalledWith(TestType.Items, emptyMap);
      expect(mockedQueueClient.completeMessage).toHaveBeenCalledTimes(2);
    });
  });
});
