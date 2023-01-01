import {
  DataLakeFileSystemClient, DataLakeServiceClient, DataLakeFileClient, DataLakeDirectoryClient,
} from '@azure/storage-file-datalake';
import { BusinessTelemetryEvent, logger } from '../utils/logger';
import { newDataLakeServiceClient } from '../services/auth/newDataLakeServiceClient';
import config from '../config';

export class DataLakeClient {
  constructor(
    private dataLakeServiceClient: DataLakeServiceClient,
  ) {}

  public async saveFile(testType: TestType, entries: Map<string, Array<string>>): Promise<void> {
    if (entries.size === 0) {
      logger.warn('DataLakeClient::saveFile: Empty map');
      return;
    }

    try {
      const testFolder = (testType === TestType.Sections) ? config.dataLake.dataLakeTestSectionsFolder : config.dataLake.dataLakeTestItemsFolder;
      const snapshotDirectoryPath = `${testFolder}/${config.dataLake.dataLakeSnapshotFolder}`;

      logger.debug('DataLakeClient::saveFile: Opening Data Lake Container', { containerName: config.dataLake.dataLakeContainerName, testFolder, snapshotDirectory: snapshotDirectoryPath });

      const filesContent = this.formatCsvStringByFile(entries);
      const fileSystemClient: DataLakeFileSystemClient = await this.getSystemClient();
      await this.createTestFolderIfNotExist(fileSystemClient, testFolder);
      const snapshotDirectoryClient: DataLakeDirectoryClient = fileSystemClient.getDirectoryClient(snapshotDirectoryPath);

      // eslint-disable-next-line no-restricted-syntax
      for await (const [key, value] of filesContent) {
        const content = value;
        const fileName = `${key}.csv`;
        if (!content) {
          logger.warn(`DataLakeClient::saveFile: Empty content for file ${fileName}, nothing to save to file`);
          return;
        }
        logger.debug(`DataLakeClient::saveFile: Saving ${fileName} file`);

        const fileClient: DataLakeFileClient = fileSystemClient.getFileClient(`${testFolder}/${fileName}`);

        if (await this.checkFileExists(fileClient)) {
          if (await this.checkIfShouldCreateSnapshot(snapshotDirectoryClient, fileSystemClient, snapshotDirectoryPath)) {
            await this.createSnapshot(fileClient, fileName, snapshotDirectoryPath);
            await this.saveDataToFile(fileClient, content, fileName);
          } else {
            await this.appendDataToFile(fileClient, content, fileName);
          }
        } else {
          await this.saveDataToFile(fileClient, content, fileName);
        }
      }
    } catch (error) {
      const dataLakeError = error as Error;
      logger.error(
        dataLakeError,
        'DataLakeClient::saveFile: failed to save to data lake',
        { message: dataLakeError.message },
      );
      throw error;
    }
  }

  private async getSystemClient(): Promise<DataLakeFileSystemClient> {
    const fileSystemClient = this.dataLakeServiceClient.getFileSystemClient(config.dataLake.dataLakeContainerName);
    await fileSystemClient.createIfNotExists();
    return fileSystemClient;
  }

  private async createTestFolderIfNotExist(fileSystemClient: DataLakeFileSystemClient, testFolder: string) {
    const directoryClient = fileSystemClient.getDirectoryClient(testFolder);
    await directoryClient.createIfNotExists();
  }

  private async appendDataToFile(fileClient: DataLakeFileClient, content: string, fileName: string) {
    const appendContent = `\n${content}`;

    logger.debug(`DataLakeClient::appendDataToFile: append ${appendContent.length} chars to ${fileName}`);
    const currentLengthOfFile = (await fileClient.getProperties()).contentLength ?? 0;

    await fileClient.append(appendContent, currentLengthOfFile, appendContent.length);
    await fileClient.flush(appendContent.length + currentLengthOfFile);
  }

  private async createSnapshot(fileClient: DataLakeFileClient, fileName: string, snapshotDirectoryPath: string) {
    const timeStamp = Date.now();
    logger.info(`DataLakeClient::createSnapshot: Moving file ${fileName} to snapshots with timestamp ${timeStamp}`);
    const snapshotPath = `${snapshotDirectoryPath}/${fileName.split('.')[0]}-${timeStamp}.csv`;
    await fileClient.move(snapshotPath);
    logger.event(BusinessTelemetryEvent.TR_SNAPSHOT_CREATED, 'DataLakeClient::createSnapshot: snapshot created', { fileName });
  }

  private async checkIfShouldCreateSnapshot(directoryClient: DataLakeDirectoryClient, fileSystemClient: DataLakeFileSystemClient, snapshotDirectoryPath: string): Promise<boolean> {
    if ((await directoryClient.createIfNotExists()).succeeded) {
      logger.warn('DataLakeClient::checkIfShouldCreateSnapshot: No snapshots folder was found. Created empty folder');
      return true;
    }

    const latestTimeStamp = await this.getLatestSnapshot(fileSystemClient, snapshotDirectoryPath);
    const latestSnapshotTimestamp = this.extractTimestamp(latestTimeStamp);
    if (latestSnapshotTimestamp === '') {
      logger.warn('DataLakeClient::checkIfShouldCreateSnapshot: Could not find a valid snapshot');
      return true;
    }
    const latestSnapshotTimestampNumber: number = parseInt(latestSnapshotTimestamp, 10);

    if (this.checkIfSnapshotIsOutdated(latestSnapshotTimestampNumber)) {
      logger.debug(`DataLakeClient::checkIfShouldCreateSnapshot: Last snapshot was taken more than ${config.dataLake.dataLakeTimeBetweenShapshotsInHours} h ago`);
      return true;
    }
    return false;
  }

  private checkIfSnapshotIsOutdated(latestSnapshotTimeStampNumber: number) {
    const currentTimeStamp = Date.now();
    return (currentTimeStamp - latestSnapshotTimeStampNumber) > config.dataLake.dataLakeTimeBetweenShapshotsInHours;
  }

  private extractTimestamp(latestTimeStamp: string) {
    const snapshotTimeStampRegex = `${config.dataLake.dataLakeSnapshotFolder}/\\d{4}-(\\d*).csv`;
    // eslint-disable-next-line security/detect-non-literal-regexp
    const latestSnapshotTimeStamp = latestTimeStamp.match(new RegExp(snapshotTimeStampRegex, 'i'));
    return latestSnapshotTimeStamp ? latestSnapshotTimeStamp[1] : '';
  }

  public async getLatestSnapshot(fileSystemClient: DataLakeFileSystemClient, snapshotDirectoryPath: string) {
    const iter = fileSystemClient.listPaths({ path: `${snapshotDirectoryPath}`, recursive: true });
    let latestTimeStamp = '';
    // eslint-disable-next-line no-restricted-syntax
    for await (const path of iter) {
      if (path.name && latestTimeStamp < path.name) {
        latestTimeStamp = path.name;
      }
    }
    return latestTimeStamp;
  }

  private async checkFileExists(fileClient: DataLakeFileClient): Promise<boolean> {
    const fileExists = await fileClient.exists();
    logger.debug(`DataLakeClient::checkFileExists: file: ${(fileExists) ? 'Exists' : 'Does not exist'}`);
    return fileExists;
  }

  private formatCsvStringByFile(entries: Map<string, string[]>) {
    const filesNameToContentMap: Map<string, string> = new Map<string, string>();
    entries.forEach((value: Array<string>, key: string) => {
      filesNameToContentMap.set(key, value.join('\n'));
    });
    return filesNameToContentMap;
  }

  private async saveDataToFile(fileClient: DataLakeFileClient, content: string, fileName: string) {
    logger.debug(`DataLakeClient::saveDataToFile: Writing ${content.length} chars to ${fileName}`);
    await fileClient.create();
    await fileClient.append(content, 0, content.length);
    await fileClient.flush(content.length);
  }
}

export enum TestType {
  Sections,
  Items,
}

export const dataLakeClient = new DataLakeClient(
  newDataLakeServiceClient(),
);
