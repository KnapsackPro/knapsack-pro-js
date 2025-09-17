#!/usr/bin/env node

import {
  KnapsackProCore,
  KnapsackProLogger,
  testFilesToExecuteType,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';
import cypress from 'cypress';
import { EnvConfig } from './env-config.js';
import { TestFilesFinder } from './test-files-finder.js';
import { CypressCLI } from './cypress-cli.js';

const clientName = '@knapsack-pro/cypress';
const clientVersion = '8.1.0';

const cypressCLIOptions = CypressCLI.argvToOptions();
const knapsackProLogger = new KnapsackProLogger();

knapsackProLogger.debug(
  `Initial Cypress CLI options:\n${KnapsackProLogger.objectInspect(
    cypressCLIOptions,
  )}`,
);

EnvConfig.loadEnvironmentVariables();

const testFilesToExecute: testFilesToExecuteType = () =>
  TestFilesFinder.allTestFiles();
const knapsackPro = new KnapsackProCore(
  clientName,
  clientVersion,
  testFilesToExecute,
);

const onSuccess: onQueueSuccessType = async (queueTestFiles: TestFile[]) => {
  const testFilePaths: string[] = queueTestFiles.map(
    (testFile: TestFile) => testFile.path,
  );

  const updatedCypressCLIOptions = CypressCLI.updateOptions(cypressCLIOptions);
  knapsackProLogger.debug(
    `Updated Cypress CLI options for the set of tests fetched from Knapsack Pro API:\n${KnapsackProLogger.objectInspect(
      updatedCypressCLIOptions,
    )}`,
  );

  const { runs: tests, totalFailed } = (await cypress
    .run({
      ...updatedCypressCLIOptions,
      spec: testFilePaths.join(','),
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((e: any) => {
      knapsackProLogger.error(
        `Error from cypress.run:\n${KnapsackProLogger.objectInspect(e)}`,
      );
      process.exitCode = 1;
      throw new Error('cypress.run process failed. See the above logs.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as { runs: any; totalFailed: number };

  // when Cypress crashed
  if (typeof tests === 'undefined') {
    return {
      recordedTestFiles: [],
      isTestSuiteGreen: false,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recordedTestFiles: TestFile[] = tests.map((test: any) => ({
    path: test.spec.relative,
    time_execution: test.stats.duration / 1000,
  }));

  return {
    recordedTestFiles,
    isTestSuiteGreen: totalFailed === 0,
  };
};

// we do nothing when error so pass noop
const onError: onQueueFailureType = () => {};

knapsackPro.runQueueMode(onSuccess, onError);
