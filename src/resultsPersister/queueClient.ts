import {
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
} from '@azure/service-bus';
import { Props } from '@dvsa/azure-logger/dist/ILogger';
import Semaphore from 'semaphore-async-await';
import { BusinessTelemetryEvent, logger } from '../utils/logger';
import {
  convertTimespanToSeconds,
  executionTimeoutNearlyReached,
  Milliseconds,
  Seconds,
  Timespan,
} from '../utils/time';
import config from '../config';

export class QueueClient {
  private numberOfMessagesRetrieved: number;

  private timeout: Seconds;

  constructor(private receiver: ServiceBusReceiver, private lock: Semaphore) {
    this.numberOfMessagesRetrieved = 0;
    this.timeout = convertTimespanToSeconds(
      (process.env.AzureFunctionsJobHost__functionTimeout || '00:10:00') as Timespan,
    );
  }

  public async retrieveMessages(): Promise<ServiceBusReceivedMessage[]> {
    const beforeTime = Date.now();

    try {
      await this.lock.acquire();
      const messages = await this.receiver.receiveMessages(
        config.serviceBus.queueArrivalRetrieveCount,
        { maxWaitTimeInMs: config.serviceBus.queueArrivalRetrieveCountMax },
      );
      this.numberOfMessagesRetrieved += messages.length;
      this.lock.release();
      this.logSuccessfulDependency(
        'retrieveMessages',
        `Retrieved ${messages.length} messages from queue`,
        { duration: Date.now() - beforeTime },
      );
      return messages;
    } catch (error) {
      this.logFailedDependency(
        'retrieveMessages',
        'Retrieve messages from queue',
        { duration: Date.now() - beforeTime },
      );
      throw error;
    }
  }

  public async completeMessage(
    message: ServiceBusReceivedMessage,
  ): Promise<void> {
    const beforeTime: Milliseconds = Date.now();
    try {
      await this.receiver.completeMessage(message);
      this.logSuccessfulDependency(
        'completeMessage',
        'Complete message in queue',
        { duration: Date.now() - beforeTime },
        message,
      );
    } catch (error) {
      this.logFailedDependency(
        'completeMessage',
        'Complete message in queue',
        { duration: Date.now() - beforeTime },
        message,
      );
      throw error;
    }
  }

  public canRetrieveMoreMessages(startTime: number): boolean {
    if (
      executionTimeoutNearlyReached(
        new Date(startTime),
        this.timeout,
        config.serviceBus.functionTimeoutBuffer,
      )
    ) {
      logger.event(
        BusinessTelemetryEvent.TR_PERSISTER_TIMEOUT_REACHED,
        'QueueClient::canRetrieveMoreMessages: execution timeout nearly reached',
        {
          startTime,
          functionTimeout: this.timeout,
          functionTimeoutBuffer: config.serviceBus.functionTimeoutBuffer,
        },
      );
      return false;
    }

    if (
      this.numberOfMessagesRetrieved >= config.serviceBus.queueArrivalRetrieveCountMax
    ) {
      logger.event(
        BusinessTelemetryEvent.TR_MAX_MESSAGES_PROCESSED,
        'QueueClient::canRetrieveMoreMessages: maximum number of messages retrieved',
        {
          numberOfMessagesRetrieved: this.numberOfMessagesRetrieved,
          queueArrivalRetrieveCountMax: config.serviceBus.queueArrivalRetrieveCountMax,
        },
      );
      return false;
    }

    return true;
  }

  private logSuccessfulDependency(
    method: string,
    data?: string,
    properties?: Props,
    message?: ServiceBusReceivedMessage,
  ): void {
    logger.dependency(`QueueClient::${method}`, data, {
      ...message,
      dependencyTypeName: 'AMQP',
      target: 'Queue Client',
      resultCode: 200,
      success: true,
      ...properties,
    });
  }

  private logFailedDependency(
    method: string,
    data?: string,
    properties?: Props,
    message?: ServiceBusReceivedMessage,
  ): void {
    logger.dependency(`QueueClient::${method}`, data, {
      ...message,
      dependencyTypeName: 'AMQP',
      target: 'Queue Client',
      resultCode: 500,
      success: false,
      ...properties,
    });
  }
}

const serviceBusClient = new ServiceBusClient(
  config.serviceBus.connectionString,
);

export const newQueueClient = (): QueueClient => new QueueClient(
  serviceBusClient.createReceiver(config.serviceBus.queueArrivalName),
  new Semaphore(1),
);
