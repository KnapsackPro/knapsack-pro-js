#!/usr/bin/env node

import { readFileSync, mkdirSync, rmSync } from 'fs';
import { execSync, spawnSync } from 'child_process';

import pkg from '@knapsack-pro/playwright/package.json' with { type: 'json' };
import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';

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
  const tests = JSON.parse(
    readFileSync('.knapsack-pro/list.json', 'utf8'),
  ) as string[];
  knapsackProLogger.debug(`Tests to run: ${tests}`);

  const knapsackPro = new KnapsackProCore(pkg.name, pkg.version, () =>
    tests.map((testFilePath) => ({ path: testFilePath })),
  );

  const onSuccess: onQueueSuccessType = async (testFiles: TestFile[]) => {
    const paths = testFiles.map((testFile) => testFile.path).join(' ');
    const command = `PWTEST_BLOB_DO_NOT_REMOVE=1 npx playwright test ${cliArguments} ${paths}`;
    knapsackProLogger.debug(`Executing: ${command}`);
    spawnSync(command, { shell: true, stdio: 'inherit' });
    const batch = readFileSync('.knapsack-pro/batch.json', 'utf8');
    rmSync('.knapsack-pro/batch.json');
    return JSON.parse(batch);
  };

  const onError: onQueueFailureType = () => {};

  knapsackPro.runQueueMode(onSuccess, onError);
}

main();
