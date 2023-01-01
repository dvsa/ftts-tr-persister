/* eslint-disable no-await-in-loop */
import { ServiceBusReceivedMessage } from '@azure/service-bus';
import { dataLakeClient, DataLakeClient, TestType } from './dataLakeClient';
import {
  messageTransformer,
  MessageTransformer,
} from '../transformer/messageTransformer';
import { newQueueClient, QueueClient } from './queueClient';
import { logger } from '../utils/logger';

export class ResultsPersister {
  private sectionsMap: Map<string, Array<string>>;

  private itemsMap: Map<string, Array<string>>;

  constructor(
    private serviceBusQueueClient: QueueClient,
    private dataLakeFilesClient: DataLakeClient,
    private transformer: MessageTransformer,
  ) {
    this.sectionsMap = new Map();
    this.itemsMap = new Map();
  }

  public async processMessages(): Promise<void> {
    const startTime = Date.now();
    while (this.serviceBusQueueClient.canRetrieveMoreMessages(startTime)) {
      const messages = await this.serviceBusQueueClient.retrieveMessages();
      if (messages.length === 0) {
        break;
      }

      messages.forEach((message: ServiceBusReceivedMessage) => {
        this.transformer.transformMessage(message, this.sectionsMap, this.itemsMap);
      });

      // store
      await this.dataLakeFilesClient.saveFile(TestType.Sections, this.sectionsMap);
      await this.dataLakeFilesClient.saveFile(TestType.Items, this.itemsMap);

      await this.completeMessages(messages);

      // clear the maps for next message(s)
      this.sectionsMap.clear();
      this.itemsMap.clear();
    }
  }

  private async completeMessages(
    messages: ServiceBusReceivedMessage[],
  ): Promise<void[] | undefined> {
    let promises: Promise<void>[] = [];
    try {
      promises = messages.map((message: ServiceBusReceivedMessage) => this.completeMessage(message));
    } catch (error) {
      const processedError = error as Error;
      logger.error(processedError, 'ResultsPersister::processMessages');
    }
    return Promise.all(promises);
  }

  private completeMessage(message: ServiceBusReceivedMessage): Promise<void> {
    return this.serviceBusQueueClient.completeMessage(message);
  }
}

export const resultsPersister = new ResultsPersister(
  newQueueClient(),
  dataLakeClient,
  messageTransformer,
);
