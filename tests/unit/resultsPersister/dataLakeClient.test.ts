import {
  DataLakeDirectoryClient, DataLakeFileClient, DataLakeFileSystemClient, DataLakeServiceClient,
} from '@azure/storage-file-datalake';
import { mock } from 'jest-mock-extended';
import { DataLakeClient, TestType } from '../../../src/resultsPersister/dataLakeClient';
import config from '../../../src/config';

jest.mock('@azure/storage-file-datalake');
jest.mock('../../../src/services/auth/newDataLakeServiceClient');
const mockedDataLakeServiceClient = mock<DataLakeServiceClient>();
const mockedDataLakeFileSystemClient = mock<DataLakeFileSystemClient>();
const mockedDataLakeFileClient = mock<DataLakeFileClient>();
const mockedDataLakeDirectoryClient = mock<DataLakeDirectoryClient>();

jest.mock('../../../src/config');
config.dataLake.dataLakeContainerName = 'dataLakeContainerName';

const oneFileMap = new Map<string, string[]>();
oneFileMap.set('2022', ['row1', 'row2']);
const oldSnapshotName = '2022-1669649640290.csv';

describe('dataLakeClient', () => {
  const filePrefix = 'file-prefix';

  beforeEach(() => {
    mockedDataLakeServiceClient.getFileSystemClient.mockReturnValue(mockedDataLakeFileSystemClient);
    mockedDataLakeFileSystemClient.getFileClient.mockReturnValue(mockedDataLakeFileClient);
    mockedDataLakeFileSystemClient.getDirectoryClient.mockReturnValue(mockedDataLakeDirectoryClient);
    const asyncIterableListPath = {
      [Symbol.asyncIterator]() {
        return {
          next() {
            return {
              value: {
                name: oldSnapshotName,
              },
              done: true,
            };
          },
        };
      },
    };
    mockedDataLakeFileSystemClient.listPaths.mockReturnValue(asyncIterableListPath);
    mockedDataLakeFileClient.exists.mockReturnValue(false);
    mockedDataLakeDirectoryClient.createIfNotExists.mockReturnValue({ succeeded: false });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('saved 1 file to data lake', async () => {
    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    const expectedTestItemsFolder = 'ftts_testitem';
    config.dataLake.dataLakeTestItemsFolder = expectedTestItemsFolder;

    const expectedFileName = `${expectedTestItemsFolder}/2022.csv`;
    const expectedContent = 'row1\nrow2';
    await dataLakeClient.saveFile(TestType.Items, oneFileMap);

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledWith(expectedFileName);
    expect(mockedDataLakeFileClient.append).toHaveBeenCalledWith(expectedContent, 0, expectedContent.length);
    expect(mockedDataLakeFileClient.flush).toHaveBeenCalledWith(expectedContent.length);
  });

  test('saved multiple files to data lake', async () => {
    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    const expectedTestSectionsFolder = 'ftts_testsection';
    const expectedTestItemsFolder = 'ftts_testitem';
    config.dataLake.dataLakeTestSectionsFolder = expectedTestSectionsFolder;
    config.dataLake.dataLakeTestItemsFolder = expectedTestItemsFolder;

    const expectedFileName1 = `${expectedTestSectionsFolder}/2021.csv`;
    const expectedFileName2 = `${expectedTestItemsFolder}/2022.csv`;
    const sections = new Map<string, string[]>();
    sections.set('2021', ['2021_row1', '2021_row2']);
    const expectedContent1 = '2021_row1\n2021_row2';

    const items = new Map<string, string[]>();
    const expectedContent2 = '2022_row1\n2022_row2';
    items.set('2022', ['2022_row1', '2022_row2']);

    await dataLakeClient.saveFile(TestType.Sections, sections);
    await dataLakeClient.saveFile(TestType.Items, items);

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(2);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledTimes(2);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledWith(expectedFileName1);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledWith(expectedFileName2);
    expect(mockedDataLakeFileClient.append).toHaveBeenCalledWith(expectedContent1, 0, expectedContent1.length);
    expect(mockedDataLakeFileClient.flush).toHaveBeenCalledWith(expectedContent1.length);
    expect(mockedDataLakeFileClient.append).toHaveBeenCalledWith(expectedContent2, 0, expectedContent2.length);
    expect(mockedDataLakeFileClient.flush).toHaveBeenCalledWith(expectedContent2.length);
  });

  test('when upload fails the DataLake throws an error', async () => {
    const errorMessage = 'Failed to get fileSystemClient';
    const expectedError = new Error(errorMessage);
    mockedDataLakeServiceClient.getFileSystemClient.mockImplementation(() => { throw expectedError; });
    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);

    const fileName = '2022';
    const sections = new Map<string, string[]>();
    sections.set(fileName, ['row1', 'row2']);

    await expect(dataLakeClient.saveFile(filePrefix, sections)).rejects.toThrow(expectedError);
    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledWith(config.dataLake.dataLakeContainerName);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledTimes(0);
  });

  test('empty content should not be written to data lake', async () => {
    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    const sections = new Map<string, string[]>();
    sections.set('2022', []);
    await dataLakeClient.saveFile(filePrefix, sections);

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledTimes(0);
  });

  test('empty map should not be written to data lake', async () => {
    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    await dataLakeClient.saveFile(filePrefix, new Map<string, string[]>());

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(0);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledTimes(0);
  });

  test('should not create a snapshot if the last was less then an hour ago, but should append to the file', async () => {
    const expectedCurrentFileLength = 12;
    const expectedSnapshotFolder = 'snapshot';
    const expectedTestFolder = 'ftts_testitem';
    config.dataLake.dataLakeSnapshotFolder = expectedSnapshotFolder;
    config.dataLake.dataLakeTestItemsFolder = expectedTestFolder;
    const expectedFileName = '2022.csv';
    const expectedContent = '\nrow1\nrow2';

    mockedDataLakeFileClient.getProperties.mockReturnValue({ contentLength: expectedCurrentFileLength });
    mockedDataLakeFileClient.exists.mockReturnValue(true);

    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    const underHourAgoTimestamp = Date.now() - (59 * 60 * 1000);
    dataLakeClient.getLatestSnapshot = jest.fn().mockReturnValue(`${expectedSnapshotFolder}/2022-${underHourAgoTimestamp}.csv`);

    await dataLakeClient.saveFile(TestType.Items, oneFileMap);

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileSystemClient.getDirectoryClient).toHaveBeenCalledWith(`${expectedTestFolder}/${expectedSnapshotFolder}`);
    expect(mockedDataLakeFileSystemClient.getFileClient).toHaveBeenCalledWith(`${expectedTestFolder}/${expectedFileName}`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(mockedDataLakeFileClient.exists).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileClient.move).not.toHaveBeenCalled();
    expect(mockedDataLakeFileClient.append).toHaveBeenCalledWith(expectedContent, expectedCurrentFileLength, expectedContent.length);
    expect(mockedDataLakeFileClient.flush).toHaveBeenCalledWith(expectedContent.length + expectedCurrentFileLength);
  });

  test('should create a snapshot if the last was more than an hour ago', async () => {
    config.dataLake.dataLakeTimeBetweenShapshotsInHours = 1;
    const expectedSnapshotFolder = 'snapshot';
    const expectedTestFolder = 'ftts_testitem';
    config.dataLake.dataLakeSnapshotFolder = expectedSnapshotFolder;
    config.dataLake.dataLakeTestItemsFolder = expectedTestFolder;

    mockedDataLakeFileClient.exists.mockReturnValue(true);

    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    const hourAgoTimestamp = Date.now() - (61 * 60 * 1000);
    dataLakeClient.getLatestSnapshot = jest.fn().mockReturnValue(`${expectedSnapshotFolder}/2022-${hourAgoTimestamp}.csv`);

    await dataLakeClient.saveFile(TestType.Items, oneFileMap);

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileSystemClient.getDirectoryClient).toHaveBeenCalledWith(`${expectedTestFolder}/${expectedSnapshotFolder}`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(mockedDataLakeFileClient.exists).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileClient.move).toHaveBeenCalled();
  });

  test('should create a snapshot if could not find a valid snapshot', async () => {
    const expectedSnapshotFolder = 'snapshot';
    const expectedTestFolder = 'ftts_testitem';
    config.dataLake.dataLakeSnapshotFolder = expectedSnapshotFolder;
    config.dataLake.dataLakeTestItemsFolder = expectedTestFolder;

    mockedDataLakeFileClient.exists.mockReturnValue(true);

    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    dataLakeClient.getLatestSnapshot = jest.fn().mockReturnValue('');

    await dataLakeClient.saveFile(TestType.Items, oneFileMap);

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileSystemClient.getDirectoryClient).toHaveBeenCalledWith(`${expectedTestFolder}/${expectedSnapshotFolder}`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(mockedDataLakeFileClient.exists).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileClient.move).toHaveBeenCalled();
  });

  test('snapshot folder does not exists, create snapshot', async () => {
    const expectedSnapshotFolder = 'snapshot';
    const expectedTestFolder = 'ftts_testsection';
    config.dataLake.dataLakeSnapshotFolder = expectedSnapshotFolder;
    config.dataLake.dataLakeTestSectionsFolder = expectedTestFolder;

    mockedDataLakeDirectoryClient.createIfNotExists.mockReturnValue({ succeeded: true });
    mockedDataLakeFileClient.exists.mockReturnValue(true);

    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    await dataLakeClient.saveFile(TestType.Sections, oneFileMap);

    expect(mockedDataLakeServiceClient.getFileSystemClient).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileSystemClient.getDirectoryClient).toHaveBeenCalledWith(`${expectedTestFolder}/${expectedSnapshotFolder}`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(mockedDataLakeFileClient.exists).toHaveBeenCalledTimes(1);
    expect(mockedDataLakeFileClient.move).toHaveBeenCalled();
  });

  test('does not find latest snapshot', async () => {
    const dataLakeClient = new DataLakeClient(mockedDataLakeServiceClient);
    const expectedSnapshotFolder = 'snapshot';
    config.dataLake.dataLakeSnapshotFolder = expectedSnapshotFolder;
    const expectedSnapshotDirectoryPath = `testType/${expectedSnapshotFolder}`;

    expect(await dataLakeClient.getLatestSnapshot(mockedDataLakeFileSystemClient, expectedSnapshotDirectoryPath)).toBe('');
    expect(mockedDataLakeFileSystemClient.listPaths).toHaveBeenCalledWith({ path: expectedSnapshotDirectoryPath, recursive: true });
  });
});
