#!/usr/bin/env node

import pkg from '@knapsack-pro/jest/package.json' with { type: 'json' };
import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
} from '@knapsack-pro/core';
import { v4 as uuidv4 } from 'uuid';
import { relative } from 'path';

import { EnvConfig } from './env-config.js';
import { PathsFinder } from './paths-finder.js';
import { JestCLI } from './jest-cli.js';
import { normalizePaths } from './utils.js';

const jestImport = await import('jest');
const jest = jestImport.default ?? jestImport;

const jestCLIOptions = JestCLI.argvToOptions();
const knapsackProLogger = new KnapsackProLogger();
knapsackProLogger.debug(
  `Jest CLI options:\n${KnapsackProLogger.objectInspect(jestCLIOptions)}`,
);

EnvConfig.loadEnvironmentVariables();

const projectPath = process.cwd();
const knapsackPro = new KnapsackProCore(
  pkg.name,
  pkg.version,
  PathsFinder.allPaths,
);

const onSuccess: onQueueSuccessType = async (scheduledPaths: string[]) => {
  const jestCLICoverage = EnvConfig.coverageDirectory
    ? { coverageDirectory: `${EnvConfig.coverageDirectory}/${uuidv4()}` }
    : {};

  const { results } = await jest.runCLI(
    {
      ...jestCLIOptions,
      ...jestCLICoverage,
      runTestsByPath: true,
      _: scheduledPaths,
      $0: 'jest',
    },
    [projectPath],
  );

  const recordedPaths: Record<string, number> = {};
  const failedPaths: Set<string> = new Set();

  results.testResults.forEach(({ testFilePath, perfStats, testResults }) => {
    const path =
      process.platform === 'win32'
        ? relative(projectPath, testFilePath).replace(/\\/g, '/')
        : relative(projectPath, testFilePath);
    const time = perfStats.end - perfStats.start;
    recordedPaths[path] = time > 0 ? time / 1000 : 0.0;

    if (
      testResults.some((assertionResult) => assertionResult.status === 'failed')
    ) {
      failedPaths.add(path);
    }
  });

  return {
    recordedPaths: normalizePaths(scheduledPaths, recordedPaths),
    isTestSuiteGreen: results.success,
    failedPaths,
  };
};

const onError: onQueueFailureType = () => {};

knapsackPro.runQueueMode(onSuccess, onError);
