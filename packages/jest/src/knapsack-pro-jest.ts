#!/usr/bin/env node

import {
  KnapsackProCore,
  KnapsackProLogger,
  testFilesToExecuteType,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';
import { EnvConfig } from './env-config';
import { TestFilesFinder } from './test-files-finder';
import { JestCLI } from './jest-cli';

const jest = require('jest');
const { v4: uuidv4 } = require('uuid');

const { name: clientName, version: clientVersion } = require('../package.json');

const jestCLIOptions = JestCLI.argvToOptions();
const knapsackProLogger = new KnapsackProLogger();
knapsackProLogger.debug(
  `Jest CLI options:\n${KnapsackProLogger.objectInspect(jestCLIOptions)}`,
);

EnvConfig.loadEnvironmentVariables();

const projectPath = process.cwd();
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

  const jestCLICoverage = EnvConfig.coverageDirectory
    ? { coverageDirectory: `${EnvConfig.coverageDirectory}/${uuidv4()}` }
    : {};

  const {
    results: { success: isTestSuiteGreen, testResults },
  } = await jest.runCLI(
    {
      ...jestCLIOptions,
      ...jestCLICoverage,
      runTestsByPath: true,
      _: testFilePaths,
    },
    [projectPath],
  );

  const recordedTestFiles: TestFile[] = testResults.map(
    ({
      testFilePath,
      perfStats: { start, end },
    }: {
      testFilePath: string;
      perfStats: { start: number; end: number };
    }) => {
      const path =
        process.platform === 'win32'
          ? testFilePath.replace(`${projectPath}\\`, '').replace(/\\/g, '/')
          : testFilePath.replace(`${projectPath}/`, '');
      const timeExecutionMiliseconds = end - start;
      const timeExecution =
        timeExecutionMiliseconds > 0 ? timeExecutionMiliseconds / 1000 : 0.0;

      return {
        path,
        time_execution: timeExecution,
      };
    },
  );

  return {
    recordedTestFiles,
    isTestSuiteGreen,
  };
};

// we do nothing when error so pass noop
const onError: onQueueFailureType = () => {};

knapsackPro.runQueueMode(onSuccess, onError);
