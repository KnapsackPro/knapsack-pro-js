#!/usr/bin/env node

import { readFileSync, mkdirSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
  mkdirSync('.knapsack-pro', { recursive: true });

  const knapsackProLogger = new KnapsackProLogger();

  // 0   1                        2
  // npx @knapsack-pro/playwright ...
  const cliArguments = process.argv.slice(2).join(' ');
  // TODO: cliArguments may contain filters like --grep --grep-invert or args
  //       they are applied to each batch, but only args should be removed.
  knapsackProLogger.debug(`cliArguments: ${cliArguments}`);

  // --reporter must be last to overwrite a (potentially) preceeding --reporter
  const command = `npx playwright test --list ${cliArguments} --reporter=@knapsack-pro/playwright/reporters/list`; // TODO: are there incompatible args with --list?
  knapsackProLogger.debug(`Executing: ${command}`);

  const stdout = execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }); // TODO: possible that not only reporter prints to stdout?
  const tests = JSON.parse(String(stdout)) as string[]; // This may throw an error
  knapsackProLogger.debug(`Tests to run: ${tests}`);

  const filePath = fileURLToPath(import.meta.url);
  const dirName = dirname(filePath);
  const pkg = JSON.parse(
    readFileSync(join(dirName, '..', 'package.json'), 'utf8'),
  );
  knapsackProLogger.debug(`Running ${pkg.name}@${pkg.version}`);

  const knapsackPro = new KnapsackProCore(pkg.name, pkg.version, () =>
    tests.map((testFilePath) => ({ path: testFilePath })),
  );

  const onSuccess: onQueueSuccessType = async (testFiles: TestFile[]) => {
    const paths = testFiles.map((testFile) => testFile.path).join(' ');
    const command = `PWTEST_BLOB_DO_NOT_REMOVE=1 npx playwright test ${cliArguments} ${paths}`;
    knapsackProLogger.debug(`Executing: ${command}`);
    spawnSync(command, { shell: true, stdio: 'inherit' });
    return JSON.parse(readFileSync('.knapsack-pro/batch.json', 'utf8')); // This may throw an error
  };

  const onError: onQueueFailureType = () => {};

  knapsackPro.runQueueMode(onSuccess, onError);
}

main();
