#!/usr/bin/env node

import pkg from '@knapsack-pro/cypress/package.json' with { type: 'json' };
import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
} from '@knapsack-pro/core';
import cypress from 'cypress';

import { EnvConfig } from './env-config.js';
import { PathsFinder } from './paths-finder.js';
import { CypressCLI } from './cypress-cli.js';
import { normalizePaths } from './utils.js';

const cypressCLIOptions = CypressCLI.argvToOptions();
const knapsackProLogger = new KnapsackProLogger();

knapsackProLogger.debug(
  `Initial Cypress CLI options:\n${KnapsackProLogger.objectInspect(
    cypressCLIOptions,
  )}`,
);

EnvConfig.loadEnvironmentVariables();

const knapsackPro = new KnapsackProCore(
  pkg.name,
  pkg.version,
  PathsFinder.allPaths,
);

const onSuccess: onQueueSuccessType = async (scheduledPaths: string[]) => {
  const updatedCypressCLIOptions = CypressCLI.updateOptions(cypressCLIOptions);
  knapsackProLogger.debug(
    `Updated Cypress CLI options for the set of tests fetched from Knapsack Pro API:\n${KnapsackProLogger.objectInspect(
      updatedCypressCLIOptions,
    )}`,
  );

  const result = await cypress.run({
    ...updatedCypressCLIOptions,
    spec: scheduledPaths.join(','),
  });

  if (isCypressFailedRunResult(result)) {
    knapsackProLogger.error(
      `Error from cypress.run:\n${KnapsackProLogger.objectInspect(result)}`,
    );
    process.exitCode = 1;
    throw new Error('cypress.run process failed. See the above logs.');
  }

  const recordedPaths: Record<string, number> = {};
  const failedPaths: Set<string> = new Set();

  result.runs.forEach((run) => {
    const path = run.spec.relative;
    recordedPaths[path] = (run.stats.duration ?? 0) / 1000;

    // States:
    // https://github.com/cypress-io/cypress/blob/8addb93e04dd372ab736d76c60735711d570312e/packages/server/lib/reporter.ts#L281
    if (run.tests.some((test) => test.state === 'failed')) {
      failedPaths.add(path);
    }
  });

  return {
    recordedPaths: normalizePaths(scheduledPaths, recordedPaths),
    isTestSuiteGreen: result.totalFailed === 0,
    failedPaths
  };
};

const isCypressFailedRunResult = (
  result:
    | CypressCommandLine.CypressRunResult
    | CypressCommandLine.CypressFailedRunResult,
): result is CypressCommandLine.CypressFailedRunResult => {
  return 'status' in result && result.status === 'failed';
};

const onError: onQueueFailureType = () => {};

knapsackPro.runQueueMode(onSuccess, onError);
