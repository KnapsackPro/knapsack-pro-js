import { KnapsackProAPI } from './knapsack-pro-api.js';
import { QueueApiResponseCodes } from './api-response-codes.js';
import { KnapsackProEnvConfig } from './config/index.js';
import { KnapsackProLogger } from './knapsack-pro-logger.js';
import { FallbackTestDistributor } from './fallback-test-distributor.js';
import { PathsFinder } from './paths-finder.js';
import { TestFile } from './models/index.js';
import { onQueueFailureType, onQueueSuccessType } from './types/index.js';
import * as Urls from './urls.js';
import { v4 as uuidv4 } from 'uuid';

export class KnapsackProCore {
  private knapsackProAPI: KnapsackProAPI;
  private knapsackProLogger: KnapsackProLogger;
  private recordedTestFiles: TestFile[];
  private allPaths: string[];
  private isTestSuiteGreen: boolean;
  private nodeUuid: string;

  constructor(
    clientName: string,
    clientVersion: string,
    pathsToExecute: () => string[],
  ) {
    this.allPaths = PathsFinder.pathsFromSourceFile() ?? pathsToExecute();
    this.isTestSuiteGreen = true;
    this.knapsackProAPI = new KnapsackProAPI(clientName, clientVersion);
    this.knapsackProLogger = new KnapsackProLogger();
    this.nodeUuid = uuidv4();
    this.recordedTestFiles = [];
  }

  public runQueueMode(
    onSuccess: onQueueSuccessType,
    onFailure: onQueueFailureType,
  ) {
    this.fetchTestsFromQueue(true, true, onSuccess, onFailure);
  }

  private fetchTestsFromQueue(
    initializeQueue = false,
    attemptConnectToQueue = false,
    onSuccess: onQueueSuccessType,
    onFailure: onQueueFailureType,
    failedPaths: string[] = [],
    batchId: number | null = null,
    batchIndex: number = 0,
  ) {
    this.knapsackProAPI
      .fetchTestsFromQueue(
        this.allPaths,
        initializeQueue,
        attemptConnectToQueue,
        failedPaths,
        this.nodeUuid,
        batchId,
        batchIndex,
      )
      .then((response) => {
        if (
          response.data.code ===
          QueueApiResponseCodes.AttemptConnectToQueueFailed
        ) {
          this.fetchTestsFromQueue(true, false, onSuccess, onFailure);
          return;
        }

        const queuePaths = response.data.paths;
        const batchId = response.data.batch_id;

        if (queuePaths.length === 0) {
          this.finishQueueMode();
          return;
        }

        onSuccess(queuePaths).then(
          ({ recordedPaths, failedPaths, isTestSuiteGreen }) => {
            this.updateRecordedTestFiles(
              recordedPaths,
              isTestSuiteGreen,
              queuePaths,
            );
            this.fetchTestsFromQueue(
              false,
              false,
              onSuccess,
              onFailure,
              failedPaths,
              batchId,
              batchIndex + 1,
            );
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
          this.allPaths,
          this.recordedTestFiles.map((testFile) => testFile.path),
        );
        const queuePaths = fallbackTestDistributor.pathsForCiNode();

        const executedTestFiles = KnapsackProLogger.objectInspect(
          this.recordedTestFiles,
        );
        this.knapsackProLogger.debug(
          `Test files already executed:\n${executedTestFiles}`,
        );
        const inspectedTestFiles = KnapsackProLogger.objectInspect(queuePaths);
        this.knapsackProLogger.debug(
          `Test files to be run in Fallback Mode:\n${inspectedTestFiles}`,
        );

        onSuccess(queuePaths).then(({ recordedPaths, isTestSuiteGreen }) => {
          this.updateRecordedTestFiles(
            recordedPaths,
            isTestSuiteGreen,
            queuePaths,
          );
          this.finishQueueMode();
        });
      });
  }

  private updateRecordedTestFiles(
    recordedPaths: TestFile[] | Record<string, number>,
    isTestSuiteGreen: boolean,
    scheduledPaths: string[],
  ) {
    this.recordedTestFiles = updateRecordedTestFiles(
      this.recordedTestFiles,
      recordedPaths,
      scheduledPaths,
    );
    this.isTestSuiteGreen = this.isTestSuiteGreen && isTestSuiteGreen;
  }

  private finishQueueMode() {
    this.createBuildSubset(this.recordedTestFiles);
    process.exitCode = this.isTestSuiteGreen ? 0 : 1;
  }

  // saves recorded timing for tests executed on single CI node
  private createBuildSubset(testFiles: TestFile[]) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.knapsackProAPI.createBuildSubset(testFiles).catch((error) => {
      this.knapsackProLogger.error(
        'Could not save recorded timing of tests due to failed request to Knapsack Pro API.',
      );
    });
  }
}

export function updateRecordedTestFiles(
  recordedTestFiles: TestFile[],
  newRecordedPaths: TestFile[] | Record<string, number>,
  scheduledPaths: string[],
) {
  if (Array.isArray(newRecordedPaths)) {
    const map = new Map();
    scheduledPaths.forEach((path) => {
      map.set(path, { path, time_execution: 0 });
    });
    newRecordedPaths.forEach((testFile) => {
      map.set(testFile.path, testFile);
    });
    return recordedTestFiles.concat(Array.from(map.values()));
  } else {
    const map = new Map();
    Object.entries(newRecordedPaths).forEach(([path, time]) => {
      map.set(path, { path, time_execution: time });
    });
    return recordedTestFiles.concat(Array.from(map.values()));
  }
}
