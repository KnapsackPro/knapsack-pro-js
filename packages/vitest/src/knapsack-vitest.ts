#!/usr/bin/env node

import {
  KnapsackProCore,
  KnapsackProLogger,
  onQueueFailureType,
  onQueueSuccessType,
  TestFile,
} from '@knapsack-pro/core';

import {
  startVitest,
  parseCLI,
  ResolvedConfig,
  Vitest,
  resolveConfig,
} from 'vitest/node';
import { v4 as uuidv4 } from 'uuid';
import { minimatch } from 'minimatch';
import { glob } from 'glob';
import { join, dirname, relative } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import * as Urls from './urls.js';

if (process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_VITEST) {
  process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN =
    process.env.KNAPSACK_PRO_TEST_SUITE_TOKEN_VITEST;
}

const knapsackProLogger = new KnapsackProLogger();

async function main() {
  const filePath = fileURLToPath(import.meta.url);
  const dirName = dirname(filePath);
  const pkg = JSON.parse(
    readFileSync(join(dirName, '..', 'package.json'), 'utf8'),
  );
  knapsackProLogger.debug(`Running ${pkg.name}@${pkg.version}`);

  const cliArguments = parseCLI(`vitest ${process.argv.slice(2).join(' ')}`);
  if (cliArguments.filter.length > 0) {
    throw new Error(
      '[@knapsack-pro/vitest] Passing list of files to test from command line is not supported',
    );
  }

  const resolvedConfig = await resolveConfig();

  const knapsackPro = new KnapsackProCore(
    pkg.name,
    pkg.version,
    makeGetAllTestFiles(resolvedConfig.vitestConfig),
  );

  const onSuccess: onQueueSuccessType = async (testFiles: TestFile[]) => {
    const filters = testFiles.map((testFile) => testFile.path);
    const cliOptions = {
      ...cliArguments.options,
      outputFile: withBatchedBlobOutputFile(
        cliArguments,
        resolvedConfig.vitestConfig,
      ),
      watch: false,
    };
    knapsackProLogger.debug(`Filters: ${JSON.stringify(filters)}`);
    knapsackProLogger.debug(`CLIOptions: ${JSON.stringify(cliOptions)}`);
    const vitest = await startVitest('test', filters, cliOptions);

    if (!vitest) {
      throw new Error('[@knapsack-pro/vitest] Vitest failed to start');
    }

    return getTestResults(vitest);
  };

  const onError: onQueueFailureType = () => {};

  knapsackPro.runQueueMode(onSuccess, onError);
}

main();

/**
 * Processes the test results and converts them to a format vitest
 * understands
 * @param vitest
 */
function getTestResults(vitest: Vitest) {
  const recordedTestFiles = vitest.state.getFiles().map<TestFile>((file) => {
    const testFile = vitest.state.getReportedEntity(file);

    if (testFile?.type !== 'module') {
      throw new Error('[@knapsack-pro/vitest] Vitest reported non-module file');
    }

    return {
      path: relative(vitest.config.root, file.filepath),
      time_execution: testFile.diagnostic().duration / 1000,
    };
  });

  const isTestSuiteGreen = process.exitCode !== 1;

  return {
    recordedTestFiles,
    isTestSuiteGreen,
  };
}

/**
 * Returns a function that returns all test files in the test suite
 */
function makeGetAllTestFiles(resolvedConfig: ResolvedConfig) {
  return () => {
    const testFileIncludePattern =
      process.env.KNAPSACK_PRO_TEST_FILE_PATTERN ||
      resolvedConfig.include ||
      '**/*.{test,spec}.?(c|m)[jt]s?(x)';

    const testFileExcludePattern = process.env
      .KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN
      ? [process.env.KNAPSACK_PRO_TEST_FILE_EXCLUDE_PATTERN]
      : resolvedConfig.exclude || [];

    const testFiles = glob
      .sync(testFileIncludePattern)
      .filter((testFilePath) =>
        testFileExcludePattern.every(
          (excludePattern) =>
            !minimatch(testFilePath, excludePattern, {
              matchBase: true,
            }),
        ),
      )
      .filter((testFilePath) => !testFilePath.match(/node_modules/))
      .map((testFilePath) => ({ path: testFilePath }));

    if (testFiles.length === 0) {
      const errorMessage = `[@knapsack-pro/vitest] Test files cannot be found.\nPlease set KNAPSACK_PRO_TEST_FILE_PATTERN matching your test directory structure.\nLearn more: ${Urls.NO_TESTS_FOUND}`;

      knapsackProLogger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return testFiles;
  };
}

// Vitest uses the following priority when parsing the outputFile:
// - From CLI if string (e.g., vitest --outputFile=file.txt)
// - From config if string (e.g., outputFile: 'file.txt')
// - Merge objects; Example:
//     Input: vitest --outputFile.junit=junit.txt && outputFile: { json: 'json.txt', junit: 'ignored.txt' }
//     Output: { json: 'json.txt', junit: 'junit.txt' }
function withBatchedBlobOutputFile(
  cliArguments: ReturnType<typeof parseCLI>,
  resolvedConfig: ResolvedConfig,
): ReturnType<typeof parseCLI>['options']['outputFile'] {
  const cliOutputFile = cliArguments.options.outputFile;
  if (typeof cliOutputFile === 'string') return cliOutputFile;
  const configOutputFile = resolvedConfig.outputFile;
  if (typeof configOutputFile === 'string') return configOutputFile;
  const filename = [
    process.env.KNAPSACK_PRO_CI_NODE_INDEX,
    process.env.KNAPSACK_PRO_CI_NODE_TOTAL,
    uuidv4(),
  ].join('-');
  const blob = `.vitest-reports/blob-${filename}.json`;
  return { blob, ...configOutputFile, ...cliOutputFile };
}
