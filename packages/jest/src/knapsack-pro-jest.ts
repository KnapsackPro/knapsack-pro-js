#!/usr/bin/env node

import pkg from '@knapsack-pro/jest/package.json' with { type: 'json' };
import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';
import { v4 as uuidv4 } from 'uuid';

import { EnvConfig } from './env-config.js';
import { TestFilesFinder } from './test-files-finder.js';
import { JestCLI } from './jest-cli.js';

const jestImport = await import('jest');
const jest = jestImport.default ?? jestImport;

const jestCLIOptions = JestCLI.argvToOptions();
const knapsackProLogger = new KnapsackProLogger();
knapsackProLogger.debug(
  `Jest CLI options:\n${KnapsackProLogger.objectInspect(jestCLIOptions)}`,
);

EnvConfig.loadEnvironmentVariables();

const projectPath = process.cwd();
const knapsackPro = new KnapsackProCore(pkg.name, pkg.version, () =>
  TestFilesFinder.allTestFiles().map((testFile) => testFile.path),
);

const onSuccess: onQueueSuccessType = async (testFilePaths: string[]) => {
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
      $0: 'jest',
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
    recordedPaths: recordedTestFiles,
    isTestSuiteGreen,
    failedPaths: [],
  };
};

// we do nothing when error so pass noop
const onError: onQueueFailureType = () => {};

knapsackPro.runQueueMode(onSuccess, onError);
