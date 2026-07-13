#!/usr/bin/env node

import { readFileSync, mkdirSync, rmSync } from 'fs';
import { execSync, spawnSync } from 'child_process';

import pkg from '@knapsack-pro/playwright/package.json' with { type: 'json' };
import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
} from '@knapsack-pro/core';
import { normalizePaths } from './utils.js';
import { type Batch } from './reporters/batch.js';

if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_PLAYWRIGHT) {
  process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN =
    process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_PLAYWRIGHT;
}

async function main() {
  const knapsackProLogger = new KnapsackProLogger();
  knapsackProLogger.debug(`Running ${pkg.name}@${pkg.version}`);

  mkdirSync('.knapsack-pro', { recursive: true });

  // 0   1                        2
  // npx @knapsack-pro/playwright ...
  const cliArguments = process.argv.slice(2).join(' ');
  // TODO: Remove from cliArguments the positional arguments. (Options like --grep, --grep-invert can stay.)
  knapsackProLogger.debug(`cliArguments: ${cliArguments}`);

  // --reporter must be last to overwrite a (potentially) preceeding --reporter
  const command = `npx playwright test --list ${cliArguments} --reporter=@knapsack-pro/playwright/reporters/list`;
  knapsackProLogger.debug(`Executing: ${command}`);

  execSync(command, { stdio: 'ignore' });
  const paths = JSON.parse(
    readFileSync('.knapsack-pro/list.json', 'utf8'),
  ) as string[];
  knapsackProLogger.debug(`Tests to run: ${paths}`);

  const knapsackPro = new KnapsackProCore(pkg.name, pkg.version, () => paths);

  const onSuccess: onQueueSuccessType = async (scheduledPaths: string[]) => {
    const filters = scheduledPaths
      .map((path) => {
        const regexEscaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return `'${regexEscaped.replaceAll("'", "'\\''")}'`;
      })
      .join(' ');

    const command = `PWTEST_BLOB_DO_NOT_REMOVE=1 npx playwright test ${cliArguments} ${filters}`;
    knapsackProLogger.debug(`Executing: ${command}`);
    spawnSync(command, { shell: true, stdio: 'inherit' });
    const batch = readFileSync('.knapsack-pro/batch.json', 'utf8');
    rmSync('.knapsack-pro/batch.json');
    const { recordedPaths, failedPaths, isTestSuiteGreen } = JSON.parse(
      batch,
    ) as Batch;
    return {
      failedPaths: new Set(failedPaths),
      isTestSuiteGreen,
      recordedPaths: normalizePaths(scheduledPaths, recordedPaths),
    };
  };

  const onError: onQueueFailureType = () => {};

  knapsackPro.runQueueMode(onSuccess, onError);
}

main();
