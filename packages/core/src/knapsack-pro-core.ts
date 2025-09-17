import { KnapsackProAPI } from './knapsack-pro-api.js';
import { QueueApiResponseCodes } from './api-response-codes.js';
import { KnapsackProEnvConfig } from './config/index.js';
import { KnapsackProLogger } from './knapsack-pro-logger.js';
import { FallbackTestDistributor } from './fallback-test-distributor.js';
import { TestFilesFinder } from './test-files-finder.js';
import { TestFile } from './models/index.js';
import {
  onQueueFailureType,
  onQueueSuccessType,
  testFilesToExecuteType,
} from './types/index.js';
import * as Urls from './urls.js';

export class KnapsackProCore {
  private knapsackProAPI: KnapsackProAPI;

  private knapsackProLogger: KnapsackProLogger;

  // test files with recorded time execution
  private recordedTestFiles: TestFile[];

  // list of test files in whole user's test suite
  private allTestFiles: TestFile[];

  private isTestSuiteGreen: boolean;

  constructor(
    clientName: string,
    clientVersion: string,
    testFilesToExecute: testFilesToExecuteType,
  ) {
    this.recordedTestFiles = [];
    this.allTestFiles =
      TestFilesFinder.testFilesFromSourceFile() ?? testFilesToExecute();

    this.knapsackProAPI = new KnapsackProAPI(clientName, clientVersion);
    this.knapsackProLogger = new KnapsackProLogger();
    this.isTestSuiteGreen = true;
  }

  public runQueueMode(
    onSuccess: onQueueSuccessType,
    onFailure: onQueueFailureType,
  ) {
    this.fetchTestsFromQueue(true, true, onSuccess, onFailure);
  }

  private fetchTestsFromQueue(
    // eslint-disable-next-line default-param-last
    initializeQueue = false,
    // eslint-disable-next-line default-param-last
    attemptConnectToQueue = false,
    onSuccess: onQueueSuccessType,
    onFailure: onQueueFailureType,
  ) {
    this.knapsackProAPI
      .fetchTestsFromQueue(
        this.allTestFiles,
        initializeQueue,
        attemptConnectToQueue,
      )
      .then((response) => {
        const apiCode: QueueApiResponseCodes = response.data.code;

        if (apiCode === QueueApiResponseCodes.AttemptConnectToQueueFailed) {
          this.fetchTestsFromQueue(true, false, onSuccess, onFailure);
          return;
        }

        const queueTestFiles = response.data.test_files as TestFile[];
        const isQueueEmpty = queueTestFiles.length === 0;

        if (isQueueEmpty) {
          this.finishQueueMode();
          return;
        }

        onSuccess(queueTestFiles).then(
          ({ recordedTestFiles, isTestSuiteGreen }) => {
            this.updateRecordedTestFiles(
              recordedTestFiles,
              isTestSuiteGreen,
              queueTestFiles,
            );
            this.fetchTestsFromQueue(false, false, onSuccess, onFailure);
          },
        );
      })
      .catch((error) => {
        if (this.knapsackProAPI.isExpectedErrorStatus(error)) {
          // when API returned expected error then CI node should fail
          // this should prevent from running tests in Fallback Mode
          process.exitCode = 1;
          throw new Error(
            'Knapsack Pro API returned an error. See the above logs.',
          );
        }

        onFailure(error);

        if (KnapsackProEnvConfig.ciNodeRetryCount > 0) {
          throw new Error(
            `No connection to Knapsack Pro API to determine the set of tests that should run on the retried CI node. Please retry the CI node to reconnect with the API or create a new commit to start another CI build that could run tests in Fallback Mode in case of persisting connection issues with the API. Learn more ${Urls.QUEUE_MODE_CONNECTION_ERROR_AND_POSITIVE_RETRY_COUNT}`,
          );
        }

        this.knapsackProLogger.warn(
          'Fallback Mode has started. We could not connect to Knapsack Pro API. Your tests will be executed based on test file names.\n\nIf other CI nodes were able to connect to Knapsack Pro API then you may notice that some of the test files were executed twice across CI nodes. Fallback Mode guarantees each of test files is run at least once as a part of CI build.',
        );

        const fallbackTestDistributor = new FallbackTestDistributor(
          this.allTestFiles,
          this.recordedTestFiles,
        );
        const testFiles = fallbackTestDistributor.testFilesForCiNode();

        const executedTestFiles = KnapsackProLogger.objectInspect(
          this.recordedTestFiles,
        );
        this.knapsackProLogger.debug(
          `Test files already executed:\n${executedTestFiles}`,
        );
        const inspectedTestFiles = KnapsackProLogger.objectInspect(testFiles);
        this.knapsackProLogger.debug(
          `Test files to be run in Fallback Mode:\n${inspectedTestFiles}`,
        );

        onSuccess(testFiles).then(({ recordedTestFiles, isTestSuiteGreen }) => {
          this.updateRecordedTestFiles(
            recordedTestFiles,
            isTestSuiteGreen,
            testFiles,
          );
          this.finishQueueMode();
        });
      });
  }

  private updateRecordedTestFiles(
    recordedTestFiles: TestFile[],
    isTestSuiteGreen: boolean,
    scheduledTestPaths: TestFile[],
  ) {
    this.recordedTestFiles = updateRecordedTestFiles(
      this.recordedTestFiles,
      recordedTestFiles,
      scheduledTestPaths,
    );
    this.isTestSuiteGreen = this.isTestSuiteGreen && isTestSuiteGreen;
  }

  private finishQueueMode() {
    this.createBuildSubset(this.recordedTestFiles);
    process.exitCode = this.isTestSuiteGreen ? 0 : 1;
  }

  // saves recorded timing for tests executed on single CI node
  private createBuildSubset(testFiles: TestFile[]) {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    this.knapsackProAPI.createBuildSubset(testFiles).catch((error) => {
      this.knapsackProLogger.error(
        'Could not save recorded timing of tests due to failed request to Knapsack Pro API.',
      );
    });
  }
}

export function updateRecordedTestFiles(
  recordedTestFiles: TestFile[],
  newRecordedTestFiles: TestFile[],
  scheduledTestFiles: TestFile[],
) {
  const map = new Map();
  scheduledTestFiles.forEach((testFile) => {
    map.set(testFile.path, { path: testFile.path, time_execution: 0 });
  });
  newRecordedTestFiles.forEach((testFile) => {
    map.set(testFile.path, testFile);
  });
  return recordedTestFiles.concat(Array.from(map.values()));
}
